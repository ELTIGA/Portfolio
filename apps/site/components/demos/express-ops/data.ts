// All data in this file is invented sample data. No real guests, agencies, hotels or bookings.

export type Role = "operator" | "guide";

export type Row = { id: string; guest: string; pax: number; hotel: string; service: string };

export type ManifestImage = {
  id: string;
  file: string;
  title: string;
  time: string;
  rows: Row[];
  /** Footer total as read from the image. null means the footer could not be read. */
  printedTotal: number | null;
  /** What the mock paper thumbnail shows in its footer (the original print). */
  paperTotal: number;
  /** Number of text lines drawn on the mock paper. */
  paperLines: number;
  /** Failure explanation shown when extraction found nothing. */
  failure?: string;
  /** Result of a second, corrected extraction pass. */
  reprocessed?: { rows: Row[]; printedTotal: number | null };
};

export const SERVICES = ["Rafting day", "Canyon trek", "Airport transfer", "City tour"] as const;

const r = (id: string, guest: string, pax: number, hotel: string, service: string): Row => ({ id, guest, pax, hotel, service });

export const SESSION = { name: "Session 07", meta: "5 images" };

export const manifestSeed: ManifestImage[] = [
  {
    id: "m1",
    file: "IMG_0412.jpg",
    title: "Morning, Bus 1",
    time: "07:15",
    paperTotal: 14,
    printedTotal: 14,
    paperLines: 6,
    rows: [
      r("m1-1", "Alex Rivera", 2, "Hotel Marlowe", "Rafting day"),
      r("m1-2", "Priya Nair", 4, "Seaview Residence", "Rafting day"),
      r("m1-3", "Jonas Weber", 3, "Palm Court Inn", "Rafting day"),
      r("m1-4", "Mei Tanaka", 2, "Hotel Marlowe", "Canyon trek"),
      r("m1-5", "Sofia Costa", 2, "Harbor Lights Hotel", "Canyon trek"),
      r("m1-6", "Omar Haddad", 1, "Cedar Grove Lodge", "Canyon trek"),
    ],
  },
  {
    id: "m2",
    file: "IMG_0413.jpg",
    title: "Morning, Bus 2",
    time: "07:45",
    paperTotal: 12,
    printedTotal: 12,
    paperLines: 5,
    rows: [
      r("m2-1", "Lena Fischer", 7, "Blue Heron Suites", "Rafting day"),
      r("m2-2", "Daniel Moreau", 3, "Seaview Residence", "Rafting day"),
      r("m2-3", "Aiko Sato", 2, "Hotel Marlowe", "Rafting day"),
      r("m2-4", "Tom Gallagher", 3, "Palm Court Inn", "Canyon trek"),
      r("m2-5", "Nadia Petrova", 2, "Cedar Grove Lodge", "Canyon trek"),
    ],
    reprocessed: {
      printedTotal: 12,
      rows: [
        r("m2-1", "Lena Fischer", 2, "Blue Heron Suites", "Rafting day"),
        r("m2-2", "Daniel Moreau", 3, "Seaview Residence", "Rafting day"),
        r("m2-3", "Aiko Sato", 2, "Hotel Marlowe", "Rafting day"),
        r("m2-4", "Tom Gallagher", 3, "Palm Court Inn", "Canyon trek"),
        r("m2-5", "Nadia Petrova", 2, "Cedar Grove Lodge", "Canyon trek"),
      ],
    },
  },
  {
    id: "m3",
    file: "IMG_0414.jpg",
    title: "Midday, Bus 3",
    time: "11:30",
    paperTotal: 11,
    printedTotal: null,
    paperLines: 6,
    rows: [],
    failure: "The photo is blurred and the table edge is cut off, so no rows could be read. Reprocess, or add rows by hand.",
    reprocessed: {
      printedTotal: 11,
      rows: [
        r("m3-1", "Hugo Lindqvist", 2, "Harbor Lights Hotel", "City tour"),
        r("m3-2", "Fatima Zahra", 3, "Palm Court Inn", "City tour"),
        r("m3-3", "Chloe Bennett", 2, "Seaview Residence", "City tour"),
        r("m3-4", "Ravi Menon", 2, "Hotel Marlowe", "Airport transfer"),
        r("m3-5", "Isabel Duarte", 2, "Blue Heron Suites", "Airport transfer"),
      ],
    },
  },
  {
    id: "m4",
    file: "IMG_0415.jpg",
    title: "Afternoon, Bus 4",
    time: "14:00",
    paperTotal: 9,
    printedTotal: 9,
    paperLines: 5,
    rows: [
      r("m4-1", "Kofi Mensah", 2, "Cedar Grove Lodge", "City tour"),
      r("m4-2", "Elena Rossi", 2, "Hotel Marlowe", "City tour"),
      r("m4-3", "Samir Khoury", 1, "Palm Court Inn", "Airport transfer"),
      r("m4-4", "Grace Liu", 3, "Seaview Residence", "Airport transfer"),
      r("m4-5", "Noah Fraser", 1, "Blue Heron Suites", "Airport transfer"),
    ],
  },
  {
    id: "m5",
    file: "IMG_0416.jpg",
    title: "Evening, Minibus 5",
    time: "17:30",
    paperTotal: 10,
    printedTotal: 10,
    paperLines: 5,
    rows: [
      r("m5-1", "Yusuf Demir", 2, "Harbor Lights Hotel", "Airport transfer"),
      r("m5-2", "Clara Nilsson", 3, "Hotel Marlowe", "Airport transfer"),
      r("m5-3", "Ben Carter", 1, "Palm Court Inn", "Airport transfer"),
      r("m5-4", "Anya Volkova", 2, "Seaview Residence", "Airport transfer"),
    ],
    reprocessed: {
      printedTotal: 10,
      rows: [
        r("m5-1", "Yusuf Demir", 2, "Harbor Lights Hotel", "Airport transfer"),
        r("m5-2", "Clara Nilsson", 3, "Hotel Marlowe", "Airport transfer"),
        r("m5-3", "Ben Carter", 1, "Palm Court Inn", "Airport transfer"),
        r("m5-4", "Anya Volkova", 2, "Seaview Residence", "Airport transfer"),
        r("m5-5", "Marta Kowalska", 2, "Blue Heron Suites", "Airport transfer"),
      ],
    },
  },
];

// ---------- Driver's List ----------

export type DriverEntry = { id: string; guest: string; pickup: string; pax: number };
export type DriverBatch = { id: string; shift: string; screenshots: number; footerTotal: number; entries: DriverEntry[] };
export type Driver = { id: string; name: string; vehicle: string; batches: DriverBatch[] };

const e = (id: string, guest: string, pickup: string, pax: number): DriverEntry => ({ id, guest, pickup, pax });

export const driversSeed: Driver[] = [
  {
    id: "d1",
    name: "Marco Bellini",
    vehicle: "Bus 1",
    batches: [
      {
        id: "d1-am",
        shift: "Morning, 06:30 to 10:00",
        screenshots: 2,
        footerTotal: 12,
        entries: [
          e("d1-am-1", "Alex Rivera", "Hotel Marlowe", 2),
          e("d1-am-2", "Priya Nair", "Seaview Residence", 4),
          e("d1-am-3", "Jonas Weber", "Palm Court Inn", 3),
          e("d1-am-4", "Mei Tanaka", "Hotel Marlowe", 3),
        ],
      },
      {
        id: "d1-pm",
        shift: "Afternoon, 13:00 to 16:00",
        screenshots: 1,
        footerTotal: 9,
        entries: [
          e("d1-pm-1", "Kofi Mensah", "Cedar Grove Lodge", 2),
          e("d1-pm-2", "Elena Rossi", "Hotel Marlowe", 2),
          e("d1-pm-3", "Grace Liu", "Seaview Residence", 3),
          e("d1-pm-4", "Noah Fraser", "Blue Heron Suites", 2),
        ],
      },
    ],
  },
  {
    id: "d2",
    name: "Tariq Aziz",
    vehicle: "Bus 2",
    batches: [
      {
        id: "d2-am",
        shift: "Morning, 07:00 to 10:30",
        screenshots: 2,
        footerTotal: 10,
        entries: [
          e("d2-am-1", "Lena Fischer", "Blue Heron Suites", 2),
          e("d2-am-2", "Daniel Moreau", "Seaview Residence", 3),
          e("d2-am-3", "Aiko Sato", "Hotel Marlowe", 2),
          e("d2-am-4", "Nadia Petrova", "Cedar Grove Lodge", 3),
        ],
      },
      {
        id: "d2-pm",
        shift: "Evening, 17:00 to 20:00",
        screenshots: 1,
        footerTotal: 9,
        entries: [
          e("d2-pm-1", "Yusuf Demir", "Harbor Lights Hotel", 2),
          e("d2-pm-2", "Clara Nilsson", "Hotel Marlowe", 3),
          e("d2-pm-3", "Ben Carter", "Palm Court Inn", 1),
          e("d2-pm-4", "Anya Volkova", "Seaview Residence", 1),
        ],
      },
    ],
  },
  {
    id: "d3",
    name: "Hannah Doyle",
    vehicle: "Minibus 5",
    batches: [
      {
        id: "d3-am",
        shift: "Midday, 11:00 to 14:00",
        screenshots: 1,
        footerTotal: 8,
        entries: [
          e("d3-am-1", "Hugo Lindqvist", "Harbor Lights Hotel", 2),
          e("d3-am-2", "Fatima Zahra", "Palm Court Inn", 3),
          e("d3-am-3", "Chloe Bennett", "Seaview Residence", 3),
        ],
      },
    ],
  },
];

// ---------- Double bookings ----------

export type Severity = "high" | "medium" | "low";
export type Booking = { agency: string; ref: string; guest: string; date: string; time: string; service: string; hotel: string; pax: number; flag?: string };
export type DoubleBooking = {
  id: string;
  severity: Severity;
  score: number;
  kind: string;
  title: string;
  summary: string;
  bookings: Booking[];
  action: string;
  resolveLabel: string;
};

export const doublesSeed: DoubleBooking[] = [
  {
    id: "db1",
    severity: "high",
    score: 94,
    kind: "Across agencies",
    title: "Alex Rivera",
    summary: "Same guest, same service and date, booked by two agencies at different hotels.",
    bookings: [
      { agency: "Agency North", ref: "AN-2041", guest: "Alex Rivera", date: "Sat 14 Jun", time: "07:15", service: "Rafting day", hotel: "Hotel Marlowe", pax: 2 },
      { agency: "Agency South", ref: "AS-7780", guest: "Alex Rivera", date: "Sat 14 Jun", time: "07:15", service: "Rafting day", hotel: "Seaview Residence", pax: 2 },
    ],
    action: "Keep the Agency North booking (created first, hotel matches the last confirmation) and ask Agency South to cancel AS-7780 before the list is exported.",
    resolveLabel: "Keep Agency North",
  },
  {
    id: "db2",
    severity: "high",
    score: 88,
    kind: "Time clash",
    title: "Priya Nair",
    summary: "Two different services start at 07:30 on the same day. One guest cannot join both.",
    bookings: [
      { agency: "Agency North", ref: "AN-2057", guest: "Priya Nair", date: "Sat 14 Jun", time: "07:30", service: "Canyon trek", hotel: "Seaview Residence", pax: 4 },
      { agency: "Agency South", ref: "AS-7792", guest: "Priya Nair", date: "Sat 14 Jun", time: "07:30", service: "City tour", hotel: "Seaview Residence", pax: 4 },
    ],
    action: "Call the guest to confirm which service they want, then release the other seats. Both bookings hold four seats today.",
    resolveLabel: "Mark confirmed",
  },
  {
    id: "db3",
    severity: "medium",
    score: 63,
    kind: "Same agency",
    title: "Jonas Weber",
    summary: "Agency South sent the same service twice with different passenger counts. Looks like an amended booking.",
    bookings: [
      { agency: "Agency South", ref: "AS-7731", guest: "Jonas Weber", date: "Sat 14 Jun", time: "07:15", service: "Rafting day", hotel: "Palm Court Inn", pax: 3 },
      { agency: "Agency South", ref: "AS-7759", guest: "Jonas Weber", date: "Sat 14 Jun", time: "07:15", service: "Rafting day", hotel: "Palm Court Inn", pax: 2 },
    ],
    action: "Merge into the later booking (AS-7759, 2 pax) and confirm with Agency South that one guest dropped out.",
    resolveLabel: "Merge into latest",
  },
  {
    id: "db4",
    severity: "medium",
    score: 57,
    kind: "Name variant",
    title: "Mei Tanaka / Tanaka Mei",
    summary: "Same hotel, service and date under two spellings of the name.",
    bookings: [
      { agency: "Agency North", ref: "AN-2063", guest: "Mei Tanaka", date: "Sat 14 Jun", time: "07:15", service: "Canyon trek", hotel: "Hotel Marlowe", pax: 2 },
      { agency: "Agency North", ref: "AN-2071", guest: "Tanaka Mei", date: "Sat 14 Jun", time: "07:15", service: "Canyon trek", hotel: "Hotel Marlowe", pax: 3 },
    ],
    action: "Treat as one party of three if the agency confirms. Otherwise keep both and flag the name order for the next import.",
    resolveLabel: "Treat as one party",
  },
  {
    id: "db5",
    severity: "low",
    score: 31,
    kind: "Data quality",
    title: "Reference AN-2093 used twice",
    summary: "One agency reference is attached to two different guests.",
    bookings: [
      { agency: "Agency North", ref: "AN-2093", guest: "Sofia Costa", date: "Sat 14 Jun", time: "07:15", service: "Canyon trek", hotel: "Harbor Lights Hotel", pax: 2, flag: "Reference collision" },
      { agency: "Agency North", ref: "AN-2093", guest: "Liam Hughes", date: "Sun 15 Jun", time: "09:00", service: "City tour", hotel: "Blue Heron Suites", pax: 2, flag: "Reference collision" },
    ],
    action: "Likely a typo in one reference. Ask Agency North for the correct one; neither booking needs to move.",
    resolveLabel: "Dismiss",
  },
  {
    id: "db6",
    severity: "low",
    score: 22,
    kind: "Data quality",
    title: "Omar Haddad",
    summary: "Passenger count is 0 and the hotel is missing on this row.",
    bookings: [
      { agency: "Agency South", ref: "AS-7804", guest: "Omar Haddad", date: "Sat 14 Jun", time: "07:15", service: "Canyon trek", hotel: "", pax: 0, flag: "Missing hotel, 0 pax" },
    ],
    action: "Open the source row and fill in the hotel and passenger count. The manifest shows 1 pax at Cedar Grove Lodge.",
    resolveLabel: "Dismiss",
  },
];

// ---------- Customer lists (guide view) ----------

export type CustomerGuest = { id: string; name: string; pax: number; hotel: string; note?: string };
export type CustomerList = { id: string; vehicle: string; departure: string; service: string; guests: CustomerGuest[] };

export const customerListsSeed: CustomerList[] = [
  {
    id: "c1",
    vehicle: "Bus 1",
    departure: "07:15",
    service: "Rafting day",
    guests: [
      { id: "c1-1", name: "Alex Rivera", pax: 2, hotel: "Hotel Marlowe" },
      { id: "c1-2", name: "Priya Nair", pax: 4, hotel: "Seaview Residence", note: "One child seat" },
      { id: "c1-3", name: "Jonas Weber", pax: 3, hotel: "Palm Court Inn" },
      { id: "c1-4", name: "Sofia Costa", pax: 2, hotel: "Harbor Lights Hotel", note: "Vegetarian lunch" },
    ],
  },
  {
    id: "c2",
    vehicle: "Bus 2",
    departure: "07:45",
    service: "Canyon trek",
    guests: [
      { id: "c2-1", name: "Tom Gallagher", pax: 3, hotel: "Palm Court Inn" },
      { id: "c2-2", name: "Nadia Petrova", pax: 2, hotel: "Cedar Grove Lodge" },
      { id: "c2-3", name: "Mei Tanaka", pax: 2, hotel: "Hotel Marlowe", note: "Meets at lobby" },
    ],
  },
  {
    id: "c3",
    vehicle: "Minibus 5",
    departure: "17:30",
    service: "Airport transfer",
    guests: [
      { id: "c3-1", name: "Yusuf Demir", pax: 2, hotel: "Harbor Lights Hotel" },
      { id: "c3-2", name: "Clara Nilsson", pax: 3, hotel: "Hotel Marlowe", note: "Large luggage" },
      { id: "c3-3", name: "Marta Kowalska", pax: 2, hotel: "Blue Heron Suites" },
    ],
  },
];
