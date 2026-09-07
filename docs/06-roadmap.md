# 06 — Yol Haritası

## V1 — MVP  ("What happened? / Why does it matter?")

**Hedef:** kullanıcı girer, son 24 saatte AI dünyasında ne olduğunu 10 saniyede görür.

- [ ] `infra/` — docker-compose (postgres, redis), Alembic, seed loader
- [ ] Şema migration'ları (bkz. 02)
- [ ] Seed: ~40 kaynak, ~120 entity, kategori kuralları, topic listesi
- [ ] Collectors: `rss`, `arxiv`, `youtube` (+ `html_blog` 3-5 önemli blog için)
- [ ] Pipeline: extract → normalize → dedup/event → classify → entity tag → score → trend snapshot
- [ ] Dedup gold-set testi (precision/recall raporu)
- [ ] API: `/home`, `/events`, `/events/{slug}`, `/search`, `/trends`, `/videos`, `/videos/{id}`, `/entities/{slug}`, `/sources`, `/categories`, `/healthz`
- [ ] Web: `/`, `/news`, `/news/[slug]`, `/videos`, `/videos/[id]`, `/trends`, `/search`, `/sources`
- [ ] Tasarım sistemi + dark tema
- [ ] Deploy: web (Vercel) + api/ingest/db (Fly.io/Railway)

**MVP'de YOK:** LLM işleme, kullanıcı hesabı, Model/Company/Tool özel sayfaları, Radar, Daily Brief, bildirimler.

## V2 — Entity intelligence + AI enrich

- Model Explorer (`/models`, karşılaştırma), Company intelligence (`/companies/[slug]` — news/models/products/funding/timeline), Tools dizini, Research bölümü genişletme
- `entity_relations` zenginleştirme + `/entities/{slug}/graph` komşuluk endpoint'i
- Pipeline'a opsiyonel `ai_enrich` adımı (feature flag): daha iyi `summary`, `why_it_matters`, topic çıkarımı, entity doğrulama — sağlayıcı-bağımsız arayüz
- `pgvector` ile semantik dedup + "related"
- Event timeline'ları (Claude Timeline, OpenAI Timeline...)

## V3 — Discovery + kişiselleştirme

- **AI Universe / Radar** görselleştirmesi (`/radar`)
- **Personalized Radar** — kullanıcı hesabı, "Following: OpenAI, AI Agents, Coding..."
- Gelişmiş trend engine: sosyal + arama sinyalleri ek factor olarak
- ⌘K global search → tam sonuç sayfaları, filtre kombinasyonları

## V4 — Otomasyon + medya

- **Today's AI Brief** — günlük otomatik "5 things you should know" (V2 enrich altyapısı üzerine)
- Bildirimler (takip edilen entity/topic'te critical event → e-posta/push)
- AI-generated haftalık rapor
- Daily Brief → PlanetAI YouTube video script kaynağı

## Ölçüm (her sürümde bak)

- Dedup precision/recall (gold-set)
- Top Signal isabet: manuel "bu gerçekten önemli miydi?" haftalık review
- Kaynak kapsama: önemli bir duyuru kaç dk içinde platformda
- Kategori dağılımı dengesi
