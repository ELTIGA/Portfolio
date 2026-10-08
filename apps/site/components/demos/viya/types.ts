export type ParseProvider = "docling" | "native_sheet" | "mistral_ocr" | "llamaparse";
export type ExtractProvider =
  | "deepseek_chat"
  | "openai_gpt_4_1_mini"
  | "gemini_2_5_flash_lite"
  | "minimax_m2_5_highspeed"
  | "zai_glm";
export type Channel = "whatsapp" | "telegram" | "slack";
export type Screen = "manifests" | "routes" | "dispatch";

export interface RawRow {
  guest: string;
  hotel: string;
  time: string;
  adults: number;
  children: number;
  infants: number;
}

export interface Passenger extends RawRow {
  id: string;
  /** Reason the extraction flagged this row, or null when clean. */
  review: string | null;
  edited: boolean;
}

export interface Attempt {
  provider: ExtractProvider;
  outcome: "succeeded" | "failed" | "standby";
  detail: string;
}

export interface Extraction {
  /** Provider whose output is shown (after any fallback). */
  provider: ExtractProvider;
  attempts: Attempt[];
  confidence: number;
  ms: number;
}

export interface ManifestSeed {
  id: string;
  filename: string;
  kind: "xlsx" | "pdf";
  tour: string;
  date: string;
  uploaded: string;
  parseProvider: ParseProvider;
  provider: ExtractProvider;
  approved?: boolean;
  rows: RawRow[];
}

export interface Manifest extends Omit<ManifestSeed, "approved" | "provider"> {
  passengers: Passenger[];
  extraction: Extraction;
  status: "needs_review" | "approved";
}

export interface Stop {
  id: string;
  hotel: string;
  lead: string;
  adults: number;
  children: number;
  infants: number;
  x: number;
  y: number;
}

export interface Driver {
  name: string;
  whatsapp: string;
  telegram: string;
  slack: string;
}

export interface VehicleSeed {
  id: string;
  label: string;
  model: string;
  plate: string;
  seats: number;
  color: string;
  driver: Driver;
  depot: { name: string; x: number; y: number };
  stopIds: string[];
}

export interface MapDecor {
  land: string;
  water: string[];
  parks: { x: number; y: number; rx: number; ry: number }[];
  roads: string[];
  labels: { x: number; y: number; t: string }[];
}

export interface TenantSeed {
  id: string;
  slug: string;
  name: string;
  city: string;
  tour: string;
  date: string;
  /** Minutes after midnight when vehicles leave the depot. */
  startMin: number;
  destination: { name: string; x: number; y: number };
  stops: Stop[];
  vehicles: VehicleSeed[];
  manifests: ManifestSeed[];
  map: MapDecor;
}

export type DispatchStatus = "idle" | "queued" | "sent" | "delivered";
export type ReplyKind = "confirm" | "issue" | "no_show";

export interface DriverRun {
  status: DispatchStatus;
  reply: { kind: ReplyKind; n?: number } | null;
}

export interface LogEntry {
  id: number;
  dir: "out" | "in" | "sys";
  text: string;
  note?: string;
  ok?: boolean;
  at: string;
}

export interface DispatchState {
  channel: Channel;
  runs: Record<string, DriverRun>;
  log: LogEntry[];
}

export interface TenantState {
  manifests: Manifest[];
  routes: Record<string, string[]>;
  dispatch: DispatchState;
}
