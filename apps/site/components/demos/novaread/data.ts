/** All titles, authors and passages are invented for this demo. AI replies are canned, nothing here calls a model. */

export interface Sentence {
  text: string;
  explain: string;
  simplify: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  progress: number;
  /** Tailwind gradient classes for the generated cover. */
  cover: string;
  chapter: string;
  sentences: Sentence[];
}

export const books: Book[] = [
  {
    id: "clouds",
    title: "A Short Treatise on Clouds",
    author: "Marian Ashgrove",
    progress: 64,
    cover: "from-sky-700 to-indigo-900",
    chapter: "Chapter 2: Things made of air",
    sentences: [
      {
        text: "Clouds are not things so much as events, for each one is a place where the air has grown too cool to hold its water unseen.",
        explain:
          "The author is saying a cloud is a process rather than a solid object. Warm air carries water as invisible vapour. When that air cools, the vapour condenses into tiny droplets you can see, and that visible patch is the cloud.",
        simplify: "A cloud is what you see when air gets cool and its hidden water turns into tiny drops.",
      },
      {
        text: "Watch a cumulus rise on a summer morning and you will see it swell at the top while its flat base stays perfectly level.",
        explain:
          "Warm air rises in a column. The flat base marks the height at which that air has cooled enough for condensation to begin. Above that line the cloud keeps growing as more air is carried upward.",
        simplify: "A puffy cloud grows taller on top, but its bottom stays flat.",
      },
      {
        text: "The level base is a line drawn by temperature, and no hand could draw it straighter.",
        explain:
          "This is a metaphor. The flat base is set by a temperature threshold, so nature produces something that looks ruled with a straightedge. The author is admiring the precision of a natural rule.",
        simplify: "Temperature makes the flat bottom, so it looks perfectly straight.",
      },
      {
        text: "Fog, in this view, is simply a cloud that has lost its ambition and come down to meet the ground.",
        explain:
          "A playful but accurate point: fog is cloud at ground level, formed by the same cooling and condensation. Saying it has lost its ambition personifies it as a cloud that stopped rising.",
        simplify: "Fog is just a cloud that is touching the ground.",
      },
    ],
  },
  {
    id: "lantern",
    title: "The Lantern Keeper's Almanac",
    author: "Edda Marsh",
    progress: 28,
    cover: "from-amber-700 to-rose-900",
    chapter: "Part 1: The ninety-one steps",
    sentences: [
      {
        text: "Every evening, before the light failed, the keeper climbed ninety-one steps to trim the wick.",
        explain:
          "The exact number stresses a daily ritual: physical, repeated and done at a fixed time. Trimming the wick keeps the flame clean and bright, so the routine has a real purpose.",
        simplify: "Each evening, before dark, the keeper climbed many steps to get the lamp ready.",
      },
      {
        text: "It was not a grand duty, but a ship's captain somewhere in the dark was trusting it entirely.",
        explain:
          "The sentence contrasts how modest the task looks with how large its consequence is. The unseen trust of a stranger turns an ordinary chore into something important.",
        simplify: "The job seemed small, but sailors depended on it completely.",
      },
      {
        text: "He kept a ledger of the weather, though no one had ever asked to read it.",
        explain:
          "The ledger shows care and quiet pride. He records the weather for its own sake, which suggests a character who values attention and accuracy over recognition.",
        simplify: "He wrote down the weather every day, even though nobody asked him to.",
      },
      {
        text: "On clear nights he would sit on the gallery rail and count the lights that were not his.",
        explain:
          "He measures his solitary life against other lights, such as ships and villages. The phrase \"that were not his\" hints at gentle loneliness, and also at belonging to a wider network of lights.",
        simplify: "On clear nights he sat outside and counted the other lights he could see.",
      },
    ],
  },
  {
    id: "salt",
    title: "Letters from the Salt Coast",
    author: "Tomas Verhey",
    progress: 100,
    cover: "from-teal-700 to-cyan-950",
    chapter: "Letter 5: The walking road",
    sentences: [
      {
        text: "The tide here keeps no calendar, but the whole village runs by it.",
        explain:
          "Tides follow the moon, not human dates. Even so, fishing, travel and markets are planned around them, so the sea quietly sets the village timetable.",
        simplify: "The sea does not use a calendar, but the people plan their days by the tides.",
      },
      {
        text: "At low water the bay becomes a road, and children walk to the school on the far side without wetting their shoes.",
        explain:
          "When the tide is out the seabed is exposed, so the bay can be crossed on foot. The detail is whimsical and practical, and shows how the landscape reshapes daily routine.",
        simplify: "When the tide is out you can walk across the bay, so the children walk to school.",
      },
      {
        text: "By evening the same road is a harbour, and the boats come home along it as if they had always known the way.",
        explain:
          "The same stretch of ground is a road by day and water by night. The simile \"as if they had always known the way\" gives the boats a calm familiarity, like animals returning home.",
        simplify: "At night the sea comes back, and the boats sail home over the same path.",
      },
    ],
  },
  {
    id: "orchard",
    title: "The Orchard at Dunmere",
    author: "Ines Calloway",
    progress: 0,
    cover: "from-lime-700 to-emerald-950",
    chapter: "Chapter 1: A seed on the wind",
    sentences: [
      {
        text: "Nobody planted the first apple tree; a bird had dropped a seed and the wind had done the rest.",
        explain:
          "The opening says the orchard began by chance rather than design. The bird and the wind act as the planters, which sets a tone of gentle, unplanned beginnings.",
        simplify: "A bird dropped a seed and the wind helped it grow, so nobody planted the first tree.",
      },
      {
        text: "By the time anyone noticed, it was taller than the barn and heavy with fruit that tasted of cold water and honey.",
        explain:
          "Time has passed unobserved, and the tree has quietly matured. The taste description is sensory and slightly poetic: cold water for freshness, honey for sweetness.",
        simplify: "When people found it, the tree was already tall and full of fresh, sweet apples.",
      },
      {
        text: "They named the orchard after the farm, though the trees had always seemed to belong to themselves.",
        explain:
          "People attach a human name and ownership to the orchard, but the narrator suggests the trees are independent. It is a quiet comment on how little we really control about nature.",
        simplify: "People gave the orchard the farm's name, but the trees felt like they belonged to no one.",
      },
    ],
  },
];

export interface SavedQuote {
  id: string;
  book: string;
  text: string;
  when: string;
}

export const seedQuotes: SavedQuote[] = [
  { id: "seed-1", book: "The Lantern Keeper's Almanac", text: "It was not a grand duty, but a ship's captain somewhere in the dark was trusting it entirely.", when: "Saved earlier" },
  { id: "seed-2", book: "Letters from the Salt Coast", text: "The tide here keeps no calendar, but the whole village runs by it.", when: "Saved earlier" },
];
