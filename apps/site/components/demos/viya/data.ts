import type { ManifestSeed, MapDecor, RawRow, Stop, TenantSeed, VehicleSeed } from "./types";

/** "Guest|Hotel|HH:MM|adults|children|infants" per line. All names are invented. */
function rows(text: string): RawRow[] {
  return text
    .trim()
    .split("\n")
    .map((line) => {
      const [guest, hotel, time, a, c, i] = line.split("|").map((s) => s.trim());
      return { guest, hotel, time, adults: Number(a), children: Number(c), infants: Number(i) };
    });
}

const stop = (id: string, hotel: string, lead: string, adults: number, children: number, infants: number, x: number, y: number): Stop => ({
  id,
  hotel,
  lead,
  adults,
  children,
  infants,
  x,
  y,
});

/* ------------------------------------------------------------------ */
/* Tenant A: Lantern Bay Excursions (strait city)                      */
/* ------------------------------------------------------------------ */

const lanternManifests: ManifestSeed[] = [
  {
    id: "lb-m1",
    filename: "sunset-cruise_14-oct.xlsx",
    kind: "xlsx",
    tour: "Strait Sunset Cruise",
    date: "14 Oct",
    uploaded: "Today, 08:12",
    parseProvider: "native_sheet",
    provider: "deepseek_chat",
    rows: rows(`
Hollis Whitaker|Azure Minaret Suites|15:30|2|0|0
Mireille Dufort|Hotel Karaca Terrace|15:35|2|1|0
Anders Lindqvist|Peri Garden Inn|15:40|2|2|1
Priya Raman|Cobalt Bazaar Residence|15:45|3|0|0
Tomasz Kowal|Sultan's Loom Hotel|15:50|2|0|0
Nadia Bellweather|Galata Fig Boutique|15:55|4|0|0
Okafor-Lindgren party|Harbour Lantern Hotel|16:00|2|2|1
Jun Sakamura|Azure Minaret Suites|15:30|1|0|0
Elodie Marchetti|Peri Garden Inn|15:40|2|0|0
Bram Veldkamp|Hotel Karaca Terrace|15:35|2|1|0
Sunniva Holt|Galata Fig Boutique|15:55|2|0|1
Rafael Ortega-Lyle|Cobalt Bazaar Residence|15:45|3|1|0
`),
  },
  {
    id: "lb-m2",
    filename: "old-quarter-walk_scan.pdf",
    kind: "pdf",
    tour: "Old Quarter Morning Walk",
    date: "15 Oct",
    uploaded: "Today, 08:40",
    parseProvider: "mistral_ocr",
    provider: "minimax_m2_5_highspeed",
    rows: rows(`
Winifred Achterberg|Sultan's Loom Hotel|08:30|2|0|0
Kasimir Brandt|Ember Square Hotel|08:35|1|0|0
Leila Hartmann-Osei|Quince Alley Residence|08:40|2|1|0
Dmitri Vasquez|Violet Steps Hotel|08:45|3|0|0
Ingrid Solheim|Peri Garden Inn|08:50|2|0|0
Hugo Pellerin|Galata Fig Boutique|08:55|2|2|0
Aiko Brennan|Azure Minaret Suites|09:00|4|0|0
Cormac Delacroix|Harbour Lantern Hotel|09:05|2|0|1
`),
  },
  {
    id: "lb-m3",
    filename: "islands-ferry-day_13-oct.pdf",
    kind: "pdf",
    tour: "Islands Ferry Day",
    date: "13 Oct",
    uploaded: "Yesterday, 17:05",
    parseProvider: "llamaparse",
    provider: "openai_gpt_4_1_mini",
    approved: true,
    rows: rows(`
Verena Castellanos|Hotel Karaca Terrace|07:30|2|0|0
Obadiah Finch|Cobalt Bazaar Residence|07:35|3|1|0
Saoirse Lindholm|Violet Steps Hotel|07:45|2|0|0
Matteo Quaranta|Ember Square Hotel|07:50|2|2|1
Yara Tennant|Harbour Lantern Hotel|08:00|1|0|0
Lucan Mbeki-Rowe|Azure Minaret Suites|08:05|4|0|0
Petra Voss|Galata Fig Boutique|08:10|2|0|0
`),
  },
];

const lanternStops: Stop[] = [
  stop("a1", "Azure Minaret Suites", "Hollis Whitaker", 3, 0, 0, 110, 112),
  stop("a2", "Hotel Karaca Terrace", "Mireille Dufort", 3, 1, 0, 200, 68),
  stop("a3", "Peri Garden Inn", "Anders Lindqvist", 2, 2, 1, 330, 112),
  stop("a4", "Cobalt Bazaar Residence", "Priya Raman", 2, 0, 0, 262, 156),
  stop("b1", "Sultan's Loom Hotel", "Tomasz Kowal", 2, 0, 0, 122, 252),
  stop("b2", "Galata Fig Boutique", "Nadia Bellweather", 3, 0, 1, 205, 308),
  stop("b3", "Harbour Lantern Hotel", "Okafor-Lindgren party", 2, 1, 1, 318, 268),
  stop("c1", "Ember Square Hotel", "Kasimir Brandt", 5, 3, 1, 92, 182),
  stop("c2", "Quince Alley Residence", "Leila Hartmann-Osei", 4, 0, 0, 262, 224),
  stop("c3", "Violet Steps Hotel", "Dmitri Vasquez", 6, 1, 0, 180, 200),
];

const lanternVehicles: VehicleSeed[] = [
  {
    id: "v1",
    label: "Van 1",
    model: "Sprinter 14",
    plate: "DEMO 101",
    seats: 14,
    color: "#0A7CA5",
    driver: { name: "Selim Aydar", whatsapp: "+•• ••• ••• 0142", telegram: "@selim_drv", slack: "@selim.a" },
    depot: { name: "Lantern Bay yard", x: 48, y: 44 },
    stopIds: ["a1", "a2", "a4", "a3"],
  },
  {
    id: "v2",
    label: "Van 2",
    model: "Vito 8",
    plate: "DEMO 202",
    seats: 8,
    color: "#B45309",
    driver: { name: "Baran Yücel", whatsapp: "+•• ••• ••• 0287", telegram: "@baran_yc", slack: "@baran.y" },
    depot: { name: "South garage", x: 40, y: 318 },
    stopIds: ["b1", "b2", "b3"],
  },
  {
    id: "v3",
    label: "Midi 3",
    model: "Midi 20",
    plate: "DEMO 303",
    seats: 20,
    color: "#7C3AED",
    driver: { name: "Kerem Tosun", whatsapp: "+•• ••• ••• 0359", telegram: "@kerem_t", slack: "@kerem.t" },
    depot: { name: "Hillside depot", x: 30, y: 150 },
    stopIds: ["c1", "c3", "c2"],
  },
];

const lanternMap: MapDecor = {
  land: "#EEF2F6",
  water: [
    "M 438 0 C 412 80 478 150 436 236 C 404 300 462 350 446 400 L 640 400 L 640 0 Z",
    "M 0 352 C 50 340 110 360 170 400 L 0 400 Z",
  ],
  parks: [
    { x: 150, y: 140, rx: 30, ry: 18 },
    { x: 360, y: 300, rx: 40, ry: 24 },
    { x: 60, y: 250, rx: 22, ry: 14 },
  ],
  roads: [
    "M 0 120 C 120 100 220 150 420 130",
    "M 0 220 C 140 240 260 200 430 250",
    "M 90 0 C 110 120 80 260 130 400",
    "M 230 0 C 250 120 210 250 260 400",
    "M 340 0 C 350 140 330 260 370 400",
  ],
  labels: [
    { x: 520, y: 120, t: "Strait" },
    { x: 140, y: 372, t: "Old Harbour" },
    { x: 290, y: 24, t: "North Quarter" },
  ],
};

/* ------------------------------------------------------------------ */
/* Tenant B: Saffron Dune Tours (coastal desert city)                  */
/* ------------------------------------------------------------------ */

const saffronManifests: ManifestSeed[] = [
  {
    id: "sd-m1",
    filename: "red-dune-safari_14-oct.xlsx",
    kind: "xlsx",
    tour: "Red Dune Evening Safari",
    date: "14 Oct",
    uploaded: "Today, 07:48",
    parseProvider: "native_sheet",
    provider: "gemini_2_5_flash_lite",
    rows: rows(`
Calista Wren|Marina Opal Hotel|14:45|2|1|0
Idris Montclair|Palm Crescent Resort|14:50|2|0|1
Tove Hallgren|Coral Gate Hotel|14:55|2|0|0
Basil Ferreira-Quinn|Creekside Pearl Suites|15:00|2|0|0
Anouk Rademaker|Skyline Jade Towers|15:05|2|1|0
Wendell Okonkwo-Hart|Dune Rose Apartments|15:10|1|0|0
Mara Delgado-Finn|Oasis Teal Residence|15:15|4|2|1
Sorin Albescu|Jasmine Court Hotel|15:20|3|0|0
Hana Kobayashi-Reed|Bluewater Pearl Inn|15:25|2|1|0
Linus Aberdeen|Marina Opal Hotel|14:45|1|0|0
`),
  },
  {
    id: "sd-m2",
    filename: "dhow-dinner_batch.pdf",
    kind: "pdf",
    tour: "Creek Dhow Dinner",
    date: "14 Oct",
    uploaded: "Today, 09:20",
    parseProvider: "docling",
    provider: "zai_glm",
    rows: rows(`
Gideon Vasari|Creekside Pearl Suites|18:30|2|0|0
Philippa Odera|Skyline Jade Towers|18:35|3|1|0
Rhys Kantor|Coral Gate Hotel|18:40|2|0|0
Eun-seo Marlowe|Marina Opal Hotel|18:50|2|2|1
Tamsin Achebe|Palm Crescent Resort|18:55|1|0|0
Lorenzo Brightwater|Jasmine Court Hotel|19:00|4|0|0
Zainab Holloway|Oasis Teal Residence|19:05|2|0|0
`),
  },
  {
    id: "sd-m3",
    filename: "sunrise-balloon_15-oct.pdf",
    kind: "pdf",
    tour: "Sunrise Balloon Transfer",
    date: "15 Oct",
    uploaded: "Yesterday, 19:30",
    parseProvider: "llamaparse",
    provider: "openai_gpt_4_1_mini",
    approved: true,
    rows: rows(`
Otto Lindenberg|Bluewater Pearl Inn|03:45|2|0|0
Maeve Santoro|Dune Rose Apartments|03:50|2|0|0
Felix Ndiaye-Cho|Palm Crescent Resort|04:00|3|0|0
Rosalind Ishikawa|Skyline Jade Towers|04:05|2|0|0
Casper Wyndham|Marina Opal Hotel|04:15|1|0|0
Delphine Arkwright|Coral Gate Hotel|04:20|2|0|0
`),
  },
];

const saffronStops: Stop[] = [
  stop("a1", "Marina Opal Hotel", "Calista Wren", 2, 1, 0, 110, 150),
  stop("a2", "Palm Crescent Resort", "Idris Montclair", 2, 0, 1, 190, 106),
  stop("a3", "Coral Gate Hotel", "Tove Hallgren", 2, 0, 0, 160, 262),
  stop("b1", "Creekside Pearl Suites", "Basil Ferreira-Quinn", 2, 0, 0, 220, 204),
  stop("b2", "Skyline Jade Towers", "Anouk Rademaker", 2, 1, 0, 330, 160),
  stop("b3", "Dune Rose Apartments", "Wendell Okonkwo-Hart", 1, 0, 0, 410, 246),
  stop("c1", "Oasis Teal Residence", "Mara Delgado-Finn", 4, 2, 1, 430, 172),
  stop("c2", "Jasmine Court Hotel", "Sorin Albescu", 3, 0, 0, 486, 236),
  stop("c3", "Bluewater Pearl Inn", "Hana Kobayashi-Reed", 2, 1, 0, 530, 140),
];

const saffronVehicles: VehicleSeed[] = [
  {
    id: "v1",
    label: "Cruiser 1",
    model: "4x4 Cruiser 7",
    plate: "DEMO 411",
    seats: 7,
    color: "#0A7CA5",
    driver: { name: "Tariq Nasser", whatsapp: "+••• •• ••• 0518", telegram: "@tariq_n", slack: "@tariq.n" },
    depot: { name: "Saffron base", x: 56, y: 76 },
    stopIds: ["a1", "a3", "a2"],
  },
  {
    id: "v2",
    label: "Cruiser 2",
    model: "4x4 Cruiser 7",
    plate: "DEMO 422",
    seats: 7,
    color: "#B45309",
    driver: { name: "Rashed Farouk", whatsapp: "+••• •• ••• 0634", telegram: "@rashed_f", slack: "@rashed.f" },
    depot: { name: "Creek lot", x: 50, y: 282 },
    stopIds: ["b1", "b2", "b3"],
  },
  {
    id: "v3",
    label: "Van 3",
    model: "Coaster Van 12",
    plate: "DEMO 433",
    seats: 12,
    color: "#7C3AED",
    driver: { name: "Imran Qadri", whatsapp: "+••• •• ••• 0771", telegram: "@imran_q", slack: "@imran.q" },
    depot: { name: "East garage", x: 340, y: 292 },
    stopIds: ["c1", "c2", "c3"],
  },
];

const saffronMap: MapDecor = {
  land: "#F3EEE4",
  water: [
    "M 0 330 C 120 300 240 352 360 322 C 480 292 560 332 640 312 L 640 400 L 0 400 Z",
    "M 248 0 C 270 80 226 150 268 246 C 284 286 300 306 302 330 L 280 330 C 276 300 258 286 244 246 C 204 150 250 80 232 0 Z",
  ],
  parks: [
    { x: 120, y: 200, rx: 26, ry: 16 },
    { x: 380, y: 100, rx: 34, ry: 20 },
    { x: 560, y: 250, rx: 30, ry: 18 },
  ],
  roads: [
    "M 0 190 C 140 180 300 220 640 120",
    "M 120 0 C 140 120 110 240 150 330",
    "M 340 0 C 360 100 330 200 380 320",
    "M 0 60 C 200 40 400 30 640 52",
  ],
  labels: [
    { x: 150, y: 372, t: "Marina Coast" },
    { x: 264, y: 30, t: "Creek" },
    { x: 560, y: 94, t: "Dune Road" },
  ],
};

export const TENANTS: TenantSeed[] = [
  {
    id: "ten_lantern",
    slug: "lantern-bay",
    name: "Lantern Bay Excursions",
    city: "Strait city",
    tour: "Strait Sunset Cruise",
    date: "14 Oct",
    startMin: 14 * 60 + 40,
    destination: { name: "Kordon Pier", x: 436, y: 226 },
    stops: lanternStops,
    vehicles: lanternVehicles,
    manifests: lanternManifests,
    map: lanternMap,
  },
  {
    id: "ten_saffron",
    slug: "saffron-dune",
    name: "Saffron Dune Tours",
    city: "Coastal desert city",
    tour: "Red Dune Evening Safari",
    date: "14 Oct",
    startMin: 14 * 60 + 15,
    destination: { name: "Dune Camp gate", x: 590, y: 52 },
    stops: saffronStops,
    vehicles: saffronVehicles,
    manifests: saffronManifests,
    map: saffronMap,
  },
];
