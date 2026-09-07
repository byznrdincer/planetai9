"""Text normalization, hashing, and similarity helpers (no LLM)."""

from __future__ import annotations

import hashlib
import re
import unicodedata
from urllib.parse import urlparse

from selectolax.parser import HTMLParser

_WS = re.compile(r"\s+")
_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")
_TRACKING = re.compile(r"[?&](utm_[^=]+|ref|fbclid|gclid|mc_cid|mc_eid)=[^&]*", re.I)


def extract_og_image(html: str, base_url: str = "") -> str | None:
    """Pull an og:image / twitter:image / first large <img> out of a page."""
    from urllib.parse import urljoin

    tree = HTMLParser(html)
    for sel, attr in (
        ('meta[property="og:image"]', "content"),
        ('meta[name="og:image"]', "content"),
        ('meta[name="twitter:image"]', "content"),
        ('meta[property="twitter:image"]', "content"),
        ('link[rel="image_src"]', "href"),
    ):
        node = tree.css_first(sel)
        if node and node.attributes.get(attr):
            return urljoin(base_url, node.attributes[attr].strip())
    article = tree.css_first("article img, main img, figure img")
    if article and article.attributes.get("src"):
        return urljoin(base_url, article.attributes["src"].strip())
    return None


def strip_html(raw: str | None) -> str:
    if not raw:
        return ""
    text = HTMLParser(raw).text(separator=" ")
    return _WS.sub(" ", text).strip()


def normalize_ws(text: str | None) -> str:
    return _WS.sub(" ", (text or "").strip())


def clean_url(url: str) -> str:
    url = _TRACKING.sub("", url or "").rstrip("?&")
    return url


def registered_domain(url: str) -> str:
    host = (urlparse(url).hostname or "").lower().removeprefix("www.")
    parts = host.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def summarize_excerpt(text: str, max_chars: int = 280, max_sentences: int = 2) -> str:
    """Pick the first 1-2 sentences, capped. No rewriting."""
    text = normalize_ws(text)
    if not text:
        return ""
    sentences = _SENT_SPLIT.split(text)
    out = " ".join(sentences[:max_sentences]).strip()
    if len(out) > max_chars:
        out = out[:max_chars].rsplit(" ", 1)[0].rstrip(",;:") + "…"
    return out


def content_hash(title: str, url: str) -> str:
    key = f"{_norm_title(title)}|{registered_domain(url)}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()


def _norm_title(title: str) -> str:
    t = unicodedata.normalize("NFKD", title or "").encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-z0-9 ]+", " ", t.lower())
    return _WS.sub(" ", t).strip()


_TOKEN = re.compile(r"[a-z0-9]+")


def _tokens(text: str) -> list[str]:
    return _TOKEN.findall((text or "").lower())


def simhash64(text: str) -> int:
    """64-bit SimHash over word shingles. Signed range for Postgres BIGINT."""
    tokens = _tokens(text)
    if not tokens:
        return 0
    shingles = tokens if len(tokens) < 3 else [
        " ".join(tokens[i : i + 2]) for i in range(len(tokens) - 1)
    ]
    v = [0] * 64
    for sh in shingles:
        h = int.from_bytes(hashlib.blake2b(sh.encode(), digest_size=8).digest(), "big")
        for b in range(64):
            v[b] += 1 if (h >> b) & 1 else -1
    out = 0
    for b in range(64):
        if v[b] > 0:
            out |= 1 << b
    return out - (1 << 64) if out >= (1 << 63) else out


def hamming(a: int, b: int) -> int:
    return ((a & 0xFFFFFFFFFFFFFFFF) ^ (b & 0xFFFFFFFFFFFFFFFF)).bit_count()
