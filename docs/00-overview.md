# 00 — Ürün Genel Bakış

## Vizyon

PlanetAI, "AI dünyasında ne oluyor?" sorusunun cevabını **tek bir yerde, birkaç saniyede** veren bir AI intelligence platformudur. Bir haber sitesi değil; **event aggregator + AI entity database + discovery engine**.

Kullanıcı yolculuğu:

```
What happened?  →  Why does it matter?  →  Who is affected?
      →  What is related?  →  What should I watch next?
```

## Temel ürün prensibi

> **More information is not the goal. Better understanding is.**

Yüzlerce haber göstermek hedef değil. Az sayıda, önemli, ilişkilendirilmiş sinyal göstermek hedef.

## Article aggregator değil, event aggregator

Aynı gelişme (ör. "OpenAI launches Model X") 8 farklı sitede çıktığında kullanıcıya **tek bir olay** olarak gösterilir; kaynaklar o olayın altında listelenir.

```
Olay (Event/Story)
 ├── Article (TechCrunch)      secondary
 ├── Article (The Verge)       secondary
 ├── Article (Reuters)         secondary
 └── Article (OpenAI blog)     primary   ← birincil kaynak işaretli
```

## LLM kararı (MVP)

Bu sürümde **LLM kullanılmıyor.** Sonuçları:

| Alan | MVP'de nasıl üretilir | V2+ (LLM eklendiğinde) |
|---|---|---|
| `summary` | Kaynağın RSS/OG açıklaması, temizlenmiş ilk paragraf | LLM özet |
| `category` | Kaynak + anahtar kelime kural motoru | LLM sınıflandırma |
| `company` / entities | Sözlük (known entities) eşleşmesi | LLM entity extraction |
| `importance` | Heuristik skor (bkz. 03) | Heuristik + LLM sinyali |
| `why_it_matters` | Boş / gösterilmez | LLM üretir |
| duplicate detection | Başlık + URL + zaman benzerliği (trigram/simhash) | + embedding benzerliği |

AI işleme, pipeline'da **opsiyonel ve izole bir adım** olarak tasarlandı: LLM eklendiğinde diğer katmanlar değişmez.

## Kapsam — Navigasyon

```
Home · News · Models · Tools · Research · Companies · Trends · Videos · Events · Radar
```

## MVP (V1) kapsamı

1. Home dashboard (Top Signals, Latest News, Trending, Videos, AI Timeline)
2. News aggregation + kategori filtreleri
3. Kural tabanlı özet/kategori/entity
4. Duplicate → Event birleştirme
5. Heuristik importance score
6. Global search
7. Trending topics
8. PlanetAI YouTube videoları (YouTube Data API)
9. Her sinyalde orijinal kaynak linkleri
10. Temel entity tespiti (sözlük)

MVP dışı (sonraki sürümler): Model Explorer, Company intelligence, Research discovery, Tools, AI Universe graph, Personalized Radar, Daily Brief, Notifications. Bkz. [06-roadmap.md](06-roadmap.md).

## Marka / his

- Dark-first, "deep space / planet / orbit" estetiği ama **gaming değil**.
- Hedef his: **Bloomberg + modern AI product + space interface**.
- Sade, premium, güvenilir, global.

## Güvenlik / mimari kırmızı çizgiler

- API anahtarları **asla** frontend'e gitmez.
- Tüm dış çağrılar (YouTube API, feed fetch) backend/ingest tarafında.
- Her içerik için orijinal kaynak URL'si saklanır; kullanıcı orijinale ulaşabilir.
- Kaynak metinleri tam kopyalanmaz; özet + alıntı + canonical link saklanır (telif).
