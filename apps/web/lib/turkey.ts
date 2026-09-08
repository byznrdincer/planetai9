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
];

export const KIND_LABEL: Record<Org["kind"], { tr: string; en: string }> = {
  kurum: { tr: "Kurum", en: "Institution" },
  lab: { tr: "Laboratuvar", en: "Lab" },
  şirket: { tr: "Şirket", en: "Company" },
  model: { tr: "Model", en: "Model" },
  girişim: { tr: "Girişim", en: "Startup" },
  topluluk: { tr: "Topluluk", en: "Community" },
};
