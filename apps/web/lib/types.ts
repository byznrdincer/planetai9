// Mirrors apps/api/planetai_api/schemas.py. Regenerate from openapi.json later.

export interface EntityRef {
  slug: string;
  name: string;
  type: string;
}

export interface SourceRef {
  slug: string;
  name: string;
  source_type: string;
  trust_weight: number;
  homepage_url: string;
}

export interface TopicRef {
  slug: string;
  name: string;
}

export interface EventCard {
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  impact: "low" | "medium" | "high" | "critical";
  importance: number;
  source_count: number;
  primary_entity: EntityRef | null;
  top_source: SourceRef | null;
  published_at: string;
  image_url: string | null;
}

export interface ImportanceFactors {
  source_reliability: number;
  independent_sources: number;
  entity_impact: number;
  novelty: number;
  market_impact: number;
  velocity: number;
  total: number;
}

export interface EventSource {
  source: SourceRef;
  title: string;
  url: string;
  published_at: string;
  is_primary: boolean;
}

export interface EventDetail {
  slug: string;
  title: string;
  summary: string | null;
  why_it_matters: string | null;
  category: string;
  impact: EventCard["impact"];
  importance: number;
  source_count: number;
  first_seen_at: string;
  last_activity_at: string;
  image_url: string | null;
  primary_entity: EntityRef | null;
  topics: TopicRef[];
  entities: { entity: EntityRef; role: string }[];
  sources: EventSource[];
  importance_factors: ImportanceFactors | null;
  related_events: EventCard[];
  related_videos: VideoCard[];
}

export interface TimelineItem {
  time: string;
  slug: string;
  title: string;
  category: string;
  impact: EventCard["impact"];
}

export interface VideoCard {
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_sec: number;
  published_at: string;
  playlist: string | null;
  topics: string[];
}

export interface VideoDetail extends VideoCard {
  related_events: EventCard[];
  related_entities: EntityRef[];
  related_topics: TopicRef[];
}

export interface TopicTrend {
  topic: TopicRef;
  window: string;
  rank: number;
  event_count: number;
  weighted_score: number;
  delta_pct: number;
  sample_events: EventCard[];
}

export interface HomePayload {
  top_signals: EventCard[];
  latest_news: EventCard[];
  trending: TopicTrend[];
  videos: VideoCard[];
  timeline: TimelineItem[];
}

export interface Page<T = EventCard> {
  data: T[];
  next_cursor: string | null;
  count: number;
}

export interface SearchResult {
  query: string;
  entities: EntityRef[];
  events: Page;
  videos: VideoCard[];
  research: Page;
}

export interface CategoryCount {
  category: string;
  events_24h: number;
}

export interface Stats {
  entities: number;
  companies: number;
  models: number;
  sources: number;
  articles: number;
  events: number;
  topics: number;
}
