export const chapterMap = [
  {
    id: "frozen_ground",
    title: "Frozen Ground",
    emotionalState: "Shock",
    enabled: true,
    route: "/chapters/frozen-ground",
    description: "A still winter place where the Evergreen Tree keeps what is left beneath its branches."
  },
  {
    id: "storm_garden",
    title: "Storm Garden",
    emotionalState: "Anger",
    enabled: true,
    route: "/chapters/storm-garden",
    description: "The storm waits beyond the closed gate."
  },
  {
    id: "crossroads",
    title: "Crossroads",
    emotionalState: "Bargaining",
    enabled: true,
    route: "/chapters/crossroads",
    description: "Lanterns mark a path for a later return."
  },
  {
    id: "the_moors",
    title: "The Moors",
    emotionalState: "Depression",
    enabled: true,
    route: "/chapters/the-moors",
    description: "Fog holds this place until its chapter opens."
  },
  {
    id: "first_bloom",
    title: "First Bloom",
    emotionalState: "Integration",
    enabled: true,
    route: "/chapters/first-bloom",
    description: "Soft growth waits without hurry."
  }
] as const;

export const evergreenThoughts = [
  "It doesn't feel real.",
  "I still expect them to call.",
  "I forgot for a moment.",
  "I thought I saw them.",
  "I keep looking for them.",
  "I still wait."
] as const;

export const evergreenContexts = [
  "Morning",
  "Night",
  "Driving",
  "Working",
  "Eating",
  "Holidays",
  "Quiet Moments",
  "Everywhere"
] as const;
