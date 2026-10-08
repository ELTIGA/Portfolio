import { track as vaTrack } from "@vercel/analytics";

type EventName =
  | "email_click"
  | "case_study_open"
  | "demo_interact"
  | "demo_launch"
  | "window_open"
  | "enter_3d"
  | "skip_3d";

/** Privacy-friendly custom events (no personal data). Safe to call anywhere on the client. */
export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    vaTrack(name, props);
  } catch {
    // analytics must never break the UI
  }
}
