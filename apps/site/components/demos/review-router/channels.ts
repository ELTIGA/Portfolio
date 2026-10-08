export interface Channel {
  id: "google" | "getyourguide" | "viator" | "booking";
  name: string;
  /** Short label used in the badge. */
  initial: string;
  /** Badge colours are generic, not official brand marks. */
  badge: string;
  blurb: string;
  live: boolean;
  hint?: string;
}

export const channels: Channel[] = [
  {
    id: "google",
    name: "Google",
    initial: "G",
    badge: "bg-blue-700 text-white",
    blurb: "Anyone can review. Takes about 30 seconds.",
    live: true,
  },
  {
    id: "getyourguide",
    name: "GetYourGuide",
    initial: "GY",
    badge: "bg-orange-700 text-white",
    blurb: "Booked with us through GetYourGuide? Share how it went.",
    live: true,
  },
  {
    id: "viator",
    name: "Viator",
    initial: "V",
    badge: "bg-emerald-800 text-white",
    blurb: "Booked through Viator?",
    live: false,
    hint: "Viator only accepts reviews from the link in your post-booking email.",
  },
  {
    id: "booking",
    name: "Booking.com",
    initial: "B",
    badge: "bg-indigo-800 text-white",
    blurb: "Booked through Booking.com?",
    live: false,
    hint: "Booking.com only accepts reviews from the link in your post-booking email.",
  },
];

export type Source = "qr" | "whatsapp";

export interface ClickEvent {
  n: number;
  channel: Channel["id"];
  source: Source;
  at: string;
}
