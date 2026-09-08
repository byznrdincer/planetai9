# 07 — News translation (TR ↔ EN)

PlanetAI9 ingests both Turkish feeds (Webrazzi, ShiftDelete, TechInside, DonanımHaber,
LOG) and English feeds (OpenAI, TechCrunch, Reddit, …). Each story is stored in the
language it was published in; a machine translation into the *other* language is
produced by a separate ingest pass and cached in the database. The reader's
TR / EN toggle then decides which text is served.

## How it works

| Piece | Location |
| --- | --- |
| Feed language | `sources.lang` (`infra/seed/sources.yaml` → `lang: tr`) |
| Story language | `events.lang` — set from the feed on creation |
| Translation store | `event_translations (event_id, target_lang)` — `title`, `summary`, `body_text`, `status`, `attempts`, `error`, `source_hash` |
| Translator | `services/ingest/planetai_ingest/pipeline/translate.py` (Google Cloud Translation **v2**) |
| Trigger | CLI `planetai-ingest translate` · scheduler job every 20 min |
| Serving | `serializers.localized_text()` — every event endpoint takes `?lang=tr|en` |
| Web | `apps/web/lib/api.ts` appends `?lang=<locale>` automatically |

Guarantees:

* **The original is never lost.** It always stays on the `events` row. A missing or
  failed translation transparently serves the original, and the row is retried on the
  next pass (up to `PLANETAI_TRANSLATE_MAX_ATTEMPTS`, default 4).
* **Translate once.** Results are cached until the source text changes
  (`source_hash`). Nothing is translated on page load.
* **Faithful text.** We call the API with `format=text` and pass the source
  language explicitly, so names, numbers and dates are preserved and no markup is
  invented. Only `title`, `summary` and the article body (capped at 12 000 chars)
  are sent.
* **No key ⇒ no-op.** With `PLANETAI_GOOGLE_TRANSLATE_API_KEY` unset the pass logs
  once and exits; the site still works, serving each story in its origin language.

## Google Cloud setup

1. **Create / pick a project** — <https://console.cloud.google.com/projectcreate>.
2. **Enable billing** on that project (Translation API has no free-forever tier;
   there is a monthly free quota — see pricing below).
3. **Enable the API** — <https://console.cloud.google.com/apis/library/translate.googleapis.com>
   → *Enable*.
4. **Create an API key** — *APIs & Services → Credentials → Create credentials →
   API key*.
5. **Restrict the key** (recommended):
   * *API restrictions* → *Cloud Translation API* only.
   * *Application restrictions* → *IP addresses* → add the ingest host's egress IP.
6. **Set the env var** where the **ingest / scheduler** process runs (not the API):
   * local: `PLANETAI_GOOGLE_TRANSLATE_API_KEY=...` in `.env`
   * prod: `GOOGLE_TRANSLATE_API_KEY=...` in `infra/.env.prod`
     (wired to the `ingest` service in `docker-compose.prod.yml`).
7. **Backfill** existing stories once:
   ```bash
   uv run planetai-ingest translate --limit 500
   ```
   then let the scheduler keep it warm.

## Cost

Google Cloud Translation v2 bills **$20 per 1M characters** (first 500K chars/month
free). One story ≈ 2–4 K characters with the body included. Knobs:

| Setting | Default | Effect |
| --- | --- | --- |
| `PLANETAI_TRANSLATE_MAX_AGE_DAYS` | `21` | only translate stories fresher than this |
| `PLANETAI_TRANSLATE_MAX_ATTEMPTS` | `4` | give up on a story after N failures |
| `translate.run(limit=...)` | `60` CLI / scheduler | max stories per pass |
| `_BODY_CHAR_CAP` in `translate.py` | `12000` | truncate long bodies |

To translate **headlines + summaries only** (≈10× cheaper), drop `body_text` from
the `payload` list in `_translate_event`.

## Operations

```bash
# one pass now
uv run planetai-ingest translate

# see what still needs translating / what failed
psql "$PLANETAI_DATABASE_URL" -c \
  "select target_lang, status, count(*) from event_translations group by 1,2;"

# force a re-translation of one story
psql ... -c "delete from event_translations where event_id = '<uuid>';"
```

Failed rows carry the Google error in `event_translations.error`.
