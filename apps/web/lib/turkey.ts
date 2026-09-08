// Editorial reference data for the "Türkiye'de Yapay Zekâ" page.
// Kept in code (rarely changes) rather than the DB.

export type Org = {
  name: string;
  kind: "kurum" | "lab" | "şirket" | "model" | "girişim" | "topluluk";
  url: string;
  note: { tr: string; en: string };
};

export const TR_ECOSYSTEM: Org[] = [
  {
    name: "T3 Yapay Zeka (T3 AI)",
    kind: "kurum",
    url: "https://t3ai.org.tr",
    note: {
      tr: "T3 Vakfı çatısında Türkçe büyük dil modeli geliştiren yapı.",
      en: "Develops a Turkish large language model under the T3 Foundation.",
    },
  },
  {
    name: "TÜBİTAK YZE",
    kind: "kurum",
    url: "https://yze.tubitak.gov.tr",
    note: {
      tr: "TÜBİTAK Yapay Zekâ Enstitüsü — ulusal araştırma ve model çalışmaları.",
      en: "TÜBİTAK's AI Institute — national research and model work.",
    },
  },
  {
    name: "KUIS AI Lab (Koç Üniversitesi)",
    kind: "lab",
    url: "https://ai.ku.edu.tr",
    note: {
      tr: "Koç Üniversitesi İş Bankası Yapay Zekâ Laboratuvarı; NLP ve görü araştırması.",
      en: "Koç University's AI lab; NLP and vision research.",
    },
  },
  {
    name: "Trendyol Tech",
    kind: "şirket",
    url: "https://tech.trendyol.com",
    note: {
      tr: "E-ticaret ölçeğinde öneri, arama ve Türkçe dil modeli çalışmaları.",
      en: "Recommendation, search and Turkish LLM work at e-commerce scale.",
    },
  },
  {
    name: "Getir / BiTaksi AI",
    kind: "şirket",
    url: "https://getir.com",
    note: {
      tr: "Talep tahmini, rota optimizasyonu ve operasyonel yapay zekâ.",
      en: "Demand forecasting, routing and operational AI.",
    },
  },
  {
    name: "Insider",
    kind: "şirket",
    url: "https://useinsider.com",
    note: {
      tr: "Pazarlama için tahmine dayalı yapay zekâ; Türkiye çıkışlı unicorn.",
      en: "Predictive AI for marketing; a Türkiye-founded unicorn.",
    },
  },
  {
    name: "ASELSAN",
    kind: "şirket",
    url: "https://www.aselsan.com",
    note: {
      tr: "Savunma sistemlerinde görü, otonomi ve karar destek yapay zekâsı.",
      en: "Vision, autonomy and decision-support AI in defence systems.",
    },
  },
  {
    name: "HAVELSAN",
    kind: "şirket",
    url: "https://www.havelsan.com.tr",
    note: {
      tr: "Simülasyon, siber güvenlik ve otonom sistemlerde yapay zekâ.",
      en: "AI in simulation, cybersecurity and autonomous systems.",
    },
  },
  {
    name: "Codeway",
    kind: "şirket",
    url: "https://codeway.co",
    note: {
      tr: "Üretken yapay zekâ tabanlı mobil uygulamalar (görsel, ses, metin).",
      en: "Generative-AI mobile apps (image, audio, text).",
    },
  },
  {
    name: "VNGRS / Hazelcast / Peak",
    kind: "şirket",
    url: "https://vngrs.com",
    note: {
      tr: "Danışmanlık, gerçek zamanlı veri ve oyun tarafında yapay zekâ uygulamaları.",
      en: "AI in consulting, real-time data and gaming.",
    },
  },
  {
    name: "İTÜ Yapay Zekâ ve Veri Bilimi",
    kind: "lab",
    url: "https://ai.itu.edu.tr",
    note: {
      tr: "İstanbul Teknik Üniversitesi araştırma merkezi ve lisansüstü programı.",
      en: "Istanbul Technical University research centre and graduate programme.",
    },
  },
  {
    name: "Boğaziçi Üniversitesi (CmpE, NLP)",
    kind: "lab",
    url: "https://www.cmpe.boun.edu.tr",
    note: {
      tr: "Türkçe doğal dil işleme ve konuşma teknolojilerinde köklü çalışma.",
      en: "Long-standing Turkish NLP and speech technology research.",
    },
  },
];

// "Türkiye Data" — open-data portals and Turkish dataset resources.
export type DataSource = {
  name: string;
  kind: "portal" | "istatistik" | "nlp" | "akademik" | "yerel";
  url: string;
  note: { tr: string; en: string };
};

export const TR_DATA: DataSource[] = [
  {
    name: "data.gov.tr",
    kind: "portal",
    url: "https://data.gov.tr",
    note: {
      tr: "Cumhurbaşkanlığı Dijital Dönüşüm Ofisi — kamu kurumlarının açık veri portalı.",
      en: "Türkiye's national open-government data portal.",
    },
  },
  {
    name: "TÜİK Veri Portalı",
    kind: "istatistik",
    url: "https://data.tuik.gov.tr",
    note: {
      tr: "Türkiye İstatistik Kurumu'nun resmi istatistik ve mikro veri servisi.",
      en: "Official statistics and micro-data from the Turkish Statistical Institute.",
    },
  },
  {
    name: "İBB Açık Veri Portalı",
    kind: "yerel",
    url: "https://data.ibb.gov.tr",
    note: {
      tr: "İstanbul Büyükşehir Belediyesi — ulaşım, çevre ve şehir verisi.",
      en: "Istanbul metropolitan municipality — transport, environment and city data.",
    },
  },
  {
    name: "AperTA (ULAKBİM)",
    kind: "akademik",
    url: "https://aperta.ulakbim.gov.tr",
    note: {
      tr: "TÜBİTAK ULAKBİM Açık Erişim ve Açık Bilim platformu; araştırma veri setleri.",
      en: "TÜBİTAK's open-access / open-science platform with research datasets.",
    },
  },
  {
    name: "TDD — Turkish Data Depository",
    kind: "nlp",
    url: "https://tdd.ai",
    note: {
      tr: "Türkçe doğal dil işleme için derlenmiş veri setleri ve araçlar.",
      en: "Curated datasets and tools for Turkish NLP.",
    },
  },
  {
    name: "Hugging Face — Türkçe veri setleri",
    kind: "nlp",
    url: "https://huggingface.co/datasets?language=language:tr",
    note: {
      tr: "Topluluk tarafından paylaşılan Türkçe metin, konuşma ve görüntü veri setleri.",
      en: "Community-shared Turkish text, speech and vision datasets.",
    },
  },
  {
    name: "Mukayese / TQuAD / BOUN Treebank",
    kind: "nlp",
    url: "https://github.com/boun-tabi",
    note: {
      tr: "Boğaziçi TABI Lab — Türkçe için karşılaştırma (benchmark) ve etiketli veri.",
      en: "Boğaziçi TABI Lab — Turkish benchmarks and annotated corpora.",
    },
  },
  {
    name: "Kaggle — Türkiye toplulukları",
    kind: "portal",
    url: "https://www.kaggle.com/datasets?search=turkey",
    note: {
      tr: "Türkiye odaklı açık veri setleri ve yarışma verileri.",
      en: "Türkiye-focused open datasets and competition data.",
    },
  },
];

export const DATA_KIND_LABEL: Record<DataSource["kind"], { tr: string; en: string }> = {
  portal: { tr: "Portal", en: "Portal" },
  istatistik: { tr: "İstatistik", en: "Statistics" },
  nlp: { tr: "Türkçe NLP", en: "Turkish NLP" },
  akademik: { tr: "Akademik", en: "Academic" },
  yerel: { tr: "Yerel yönetim", en: "Local government" },
};

export const TR_FACTS: { label: { tr: string; en: string }; value: { tr: string; en: string } }[] = [
  {
    label: { tr: "Ulusal Strateji", en: "National Strategy" },
    value: { tr: "2021–2025 Ulusal Yapay Zekâ Stratejisi", en: "2021–2025 National AI Strategy" },
  },
  {
    label: { tr: "Koordinasyon", en: "Coordination" },
    value: {
      tr: "Cumhurbaşkanlığı Dijital Dönüşüm Ofisi + Sanayi ve Teknoloji Bakanlığı",
      en: "Presidency's Digital Transformation Office + Ministry of Industry & Technology",
    },
  },
  {
    label: { tr: "Türkçe LLM", en: "Turkish LLM" },
    value: {
      tr: "T3 AI, Trendyol ve TÜBİTAK açık Türkçe modeller yayınlıyor",
      en: "T3 AI, Trendyol and TÜBİTAK release open Turkish models",
    },
  },
  {
    label: { tr: "Etkinlik", en: "Event" },
    value: { tr: "TEKNOFEST yapay zekâ yarışmaları", en: "TEKNOFEST AI competitions" },
  },
  {
    label: { tr: "Veri koruma", en: "Data protection" },
    value: { tr: "KVKK (6698 sayılı Kanun) çerçevesi", en: "KVKK (Law 6698) framework" },
  },
  {
    label: { tr: "Açık veri", en: "Open data" },
    value: {
      tr: "data.gov.tr ve TÜİK veri portalları",
      en: "data.gov.tr and TÜİK data portals",
    },
  },
];

export const KIND_LABEL: Record<Org["kind"], { tr: string; en: string }> = {
  kurum: { tr: "Kurum", en: "Institution" },
  lab: { tr: "Laboratuvar", en: "Lab" },
  şirket: { tr: "Şirket", en: "Company" },
  model: { tr: "Model", en: "Model" },
  girişim: { tr: "Girişim", en: "Startup" },
  topluluk: { tr: "Topluluk", en: "Community" },
};
