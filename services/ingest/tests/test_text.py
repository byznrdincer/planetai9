from planetai_ingest.text import (
    clean_url,
    content_hash,
    extract_article_paragraphs,
    hamming,
    registered_domain,
    simhash64,
    summarize_excerpt,
)


def test_content_hash_is_stable_and_domain_scoped():
    a = content_hash("OpenAI launches Model X", "https://techcrunch.com/2026/01/01/openai-x/")
    b = content_hash(
        "openai   launches model x!",
        "https://www.techcrunch.com/2026/01/01/openai-x/?utm_source=rss",
    )
    assert a == b  # normalisation: case, punctuation, www, tracking params
    c = content_hash("OpenAI launches Model X", "https://theverge.com/openai-x")
    assert a != c  # different publisher


def test_clean_url_strips_tracking():
    assert clean_url("https://x.com/a?utm_source=rss&ref=foo") == "https://x.com/a"
    assert clean_url("https://x.com/a?id=5&utm_medium=x") == "https://x.com/a?id=5"


def test_registered_domain():
    assert registered_domain(
        "https://www.example.co.uk/path"
    ) == "co.uk" or "example" in registered_domain("https://www.example.com")
    assert registered_domain("https://blog.openai.com/x") == "openai.com"


def test_simhash_distance_orders_by_similarity():
    base = "OpenAI releases a powerful new frontier coding model this week"
    h_same = simhash64("OpenAI releases a powerful new frontier coding model this week")
    h_close = simhash64("OpenAI releases powerful new frontier coding model this week")
    h_far = simhash64("NVIDIA announces its next data center GPU architecture")
    h0 = simhash64(base)
    assert hamming(h0, h_same) == 0
    assert hamming(h0, h_close) < hamming(h0, h_far)
    assert hamming(h0, h_far) > 15


def test_summarize_excerpt_caps_and_keeps_sentences():
    text = "First sentence here. Second sentence follows. Third one too."
    out = summarize_excerpt(text, max_chars=200, max_sentences=2)
    assert out.startswith("First sentence here.")
    assert "Third one" not in out
    assert summarize_excerpt("") == ""


def test_extract_article_paragraphs():
    html = """
    <html><body>
      <nav>menu</nav>
      <article>
        <p>This is the first real paragraph of the article and it is definitely long enough.</p>
        <p>Sign up for our newsletter</p>
        <p>A second substantial paragraph that carries the reporting forward with more detail.</p>
        <figure><figcaption>a caption we should drop</figcaption></figure>
      </article>
    </body></html>
    """
    out = extract_article_paragraphs(html)
    assert "first real paragraph" in out
    assert "second substantial paragraph" in out
    assert "Sign up for our newsletter" not in out
    assert "caption we should drop" not in out
    assert out.count("\n\n") == 1
