import type { ImageSourcePropType } from "react-native";

export type ChapterSlug = "frozen-ground" | "storm-garden" | "crossroads" | "the-moors" | "first-bloom";

export type RitualEntry = {
  id: string;
  name: string;
  symbol: string;
  route: string;
  stages: string[];
  backgroundImage: ImageSourcePropType;
  interactionSound?: string;
};

export type ChapterExperience = {
  slug: ChapterSlug;
  chapterNumber: number;
  chapterName: string;
  tagline: string;
  accentColor: string;
  heroImage: ImageSourcePropType;
  ambientSound: string;
  rituals: RitualEntry[];
};

export const chapterExperiences: ChapterExperience[] = [
  {
    slug: "frozen-ground",
    chapterNumber: 1,
    chapterName: "Frozen Ground",
    tagline: "Where you begin when the world is quiet.",
    accentColor: "#8BAFC4",
    heroImage: require("@/assets/images/chapters/frozen-ground.png"),
    ambientSound: "wind-snow",
    rituals: [
      {
        id: "evergreen-tree",
        name: "Evergreen Tree",
        symbol: "\u274B",
        route: "/chapters/frozen-ground/evergreen-tree",
        backgroundImage: require("@/assets/images/rituals/evergreen-tree-bg.png"),
        interactionSound: "soft-snow-crunch",
        stages: [
          "Find something green and living near you. Hold it or picture it.",
          "Notice it has stayed. Through cold, through dark, it did not leave.",
          "You are also still here. That is enough.",
        ],
      },
      {
        id: "frosted-window",
        name: "Frosted Window",
        symbol: "\u274B",
        route: "/chapters/frozen-ground/frosted-window",
        backgroundImage: require("@/assets/images/rituals/frosted-window-bg.png"),
        stages: [
          "Breathe out slowly onto a cold surface, or imagine doing so.",
          "Watch the fog form and fade. Your breath was there. It mattered.",
          "What you feel right now will also change. It always does.",
        ],
      },
      {
        id: "frozen-pond",
        name: "Frozen Pond",
        symbol: "\u274B",
        route: "/chapters/frozen-ground/frozen-pond",
        backgroundImage: require("@/assets/images/rituals/frozen-pond-bg.png"),
        interactionSound: "ice-creak-water",
        stages: [
          "Be still for a moment. Rest on the surface.",
          "Beneath stillness, things are still moving.",
          "You do not have to do anything. Let the pond hold you.",
        ],
      },
      {
        id: "quiet-hour",
        name: "Quiet Hour",
        symbol: "\u274B",
        route: "/chapters/frozen-ground/quiet-hour",
        backgroundImage: require("@/assets/images/rituals/quiet-hour-bg.png"),
        interactionSound: "clock-chime",
        stages: [
          "Choose one hour, just one, to move slowly today.",
          "No rushing. No fixing. Only presence.",
          "The quiet hour is yours. It always was.",
        ],
      },
      {
        id: "footprints",
        name: "Footprints",
        symbol: "\u274B",
        route: "/chapters/frozen-ground/footprints",
        backgroundImage: require("@/assets/images/rituals/footprints-bg.png"),
        interactionSound: "soft-snow-step",
        stages: [
          "Think of a moment you made it through that you doubted you could.",
          "You left footprints there. Evidence you were strong.",
          "You are walking forward. Even now.",
        ],
      },
    ],
  },
  {
    slug: "storm-garden",
    chapterNumber: 2,
    chapterName: "Storm Garden",
    tagline: "Where the storm teaches and transforms.",
    accentColor: "#6B6B8A",
    heroImage: require("@/assets/images/chapters/storm-garden.png"),
    ambientSound: "thunder-rain",
    rituals: [
      {
        id: "lightning-tree",
        name: "Lightning Tree",
        symbol: "\u26A1",
        route: "/chapters/storm-garden/lightning-tree",
        backgroundImage: require("@/assets/images/rituals/lightning-tree-bg.png"),
        interactionSound: "distant-thunder-crack",
        stages: [
          "Name what is striking you right now. Say it plainly.",
          "Lightning does not stay. It passes through.",
          "What it leaves behind can become the most interesting part of you.",
        ],
      },
      {
        id: "thorn-patch",
        name: "Thorn Patch",
        symbol: "\u26A1",
        route: "/chapters/storm-garden/thorn-patch",
        backgroundImage: require("@/assets/images/rituals/thorn-patch-bg.png"),
        stages: [
          "Something is sharp and hard right now. Don't smooth it over.",
          "Thorns are defenses. They grew for a reason.",
          "You don't have to remove them today. Just know they are yours.",
        ],
      },
      {
        id: "floodwaters",
        name: "Floodwater",
        symbol: "\u26A1",
        route: "/chapters/storm-garden/floodwaters",
        backgroundImage: require("@/assets/images/rituals/floodwaters-bg.png"),
        interactionSound: "rushing-water-swell",
        stages: [
          "Let it rise. Don't fight it right now.",
          "Water finds its level. It cannot stay peaked forever.",
          "You have survived floods before. This one will also recede.",
        ],
      },
      {
        id: "scorched-earth",
        name: "Scorched Earth",
        symbol: "\u26A1",
        route: "/chapters/storm-garden/scorched-earth",
        backgroundImage: require("@/assets/images/rituals/scorched-earth-bg.png"),
        interactionSound: "fire-crackle",
        stages: [
          "What has burned? Acknowledge it. Don't look away.",
          "Scorched earth is not ruined earth. It is cleared ground.",
          "Something will grow here. It is already beginning.",
        ],
      },
      {
        id: "shattered-mirror",
        name: "Shattered Mirror",
        symbol: "\u26A1",
        route: "/chapters/storm-garden/shattered-mirror",
        backgroundImage: require("@/assets/images/rituals/shattered-mirror-bg.png"),
        interactionSound: "glass-shimmer",
        stages: [
          "The version of yourself you expected is not who is here.",
          "Look at the pieces. Each one still reflects you.",
          "A mosaic is made of broken things. It is still beautiful.",
        ],
      },
    ],
  },
  {
    slug: "crossroads",
    chapterNumber: 3,
    chapterName: "Crossroads",
    tagline: "Where you choose, and meaning is made.",
    accentColor: "#A89070",
    heroImage: require("@/assets/images/chapters/crossroads.png"),
    ambientSound: "forest-path",
    rituals: [
      {
        id: "worn-path",
        name: "Worn Path",
        symbol: "\u25C7",
        route: "/chapters/crossroads/worn-path",
        backgroundImage: require("@/assets/images/rituals/worn-path-bg.png"),
        stages: [
          "You have walked a long way to be here. Feel that.",
          "This path is worn because others have come before you.",
          "You are not alone on this road. You never were.",
        ],
      },
      {
        id: "offering",
        name: "Offering",
        symbol: "\u25C7",
        route: "/chapters/crossroads/offering",
        backgroundImage: require("@/assets/images/rituals/offering-bg.png"),
        interactionSound: "match-flame-settle",
        stages: [
          "Place something down, a worry, a hope, a small stone, a word.",
          "You do not have to carry everything.",
          "The offering doesn't have to be perfect. It just has to be honest.",
        ],
      },
      {
        id: "candle",
        name: "Candle",
        symbol: "\u25C7",
        route: "/chapters/crossroads/candle",
        backgroundImage: require("@/assets/images/rituals/candle-bg.png"),
        interactionSound: "match-flame-settle",
        stages: [
          "Light something. A candle, a lamp, a screen, any small light.",
          "You are holding light against the dark. That is enough.",
          "The flame is small. Small things still illuminate.",
        ],
      },
      {
        id: "searching-for-signs",
        name: "Searching For Signs",
        symbol: "\u25C7",
        route: "/chapters/crossroads/searching-for-signs",
        backgroundImage: require("@/assets/images/rituals/searching-for-signs-bg.png"),
        stages: [
          "Look around you right now. Find one thing that feels like a signal.",
          "It doesn't have to be grand. A color. A bird. A word overheard.",
          "You are being spoken to constantly. This was one of those moments.",
        ],
      },
      {
        id: "waiting-gate",
        name: "Waiting Gate",
        symbol: "\u25C7",
        route: "/chapters/crossroads/waiting-gate",
        backgroundImage: require("@/assets/images/rituals/waiting-gate-bg.png"),
        stages: [
          "You are at a threshold. You have not passed through yet.",
          "Waiting is not doing nothing. Waiting is preparation.",
          "The gate will open. Or you will find another way. Either is allowed.",
        ],
      },
    ],
  },
  {
    slug: "the-moors",
    chapterNumber: 4,
    chapterName: "The Moors",
    tagline: "Where you may feel lost, but you are never forgotten.",
    accentColor: "#5A6B4A",
    heroImage: require("@/assets/images/chapters/the-moors.png"),
    ambientSound: "moor-wind",
    rituals: [
      {
        id: "canopy-cloak",
        name: "Canopy Cloak",
        symbol: "\u274B",
        route: "/chapters/the-moors/canopy-cloak",
        backgroundImage: require("@/assets/images/rituals/canopy-cloak-bg.png"),
        stages: [
          "Let something cover you, a blanket, a shadow, a quiet room.",
          "You do not have to be seen right now.",
          "Being hidden is not disappearing. It is resting before returning.",
        ],
      },
      {
        id: "mire",
        name: "Mire",
        symbol: "\u274B",
        route: "/chapters/the-moors/mire",
        backgroundImage: require("@/assets/images/rituals/mire-bg.png"),
        stages: [
          "Name where you feel stuck. Be specific.",
          "Mires have solid ground beneath them. It is there.",
          "You do not have to move quickly. One small movement is enough.",
        ],
      },
      {
        id: "fog",
        name: "Fog",
        symbol: "\u274B",
        route: "/chapters/the-moors/fog",
        backgroundImage: require("@/assets/images/rituals/fog-bg.png"),
        interactionSound: "deep-exhale",
        stages: [
          "You cannot see all the way ahead. That is the point.",
          "Walk to what you can see. Then look again.",
          "The fog is not permanent. It never is.",
        ],
      },
      {
        id: "bramble",
        name: "Bramble",
        symbol: "\u274B",
        route: "/chapters/the-moors/bramble",
        backgroundImage: require("@/assets/images/rituals/bramble-bg.png"),
        stages: [
          "Something is catching you, slowing you. Name it.",
          "Brambles also carry fruit. What might this difficulty be holding?",
          "You can rest here before moving through.",
        ],
      },
      {
        id: "vanishing-path",
        name: "Vanishing Path",
        symbol: "\u274B",
        route: "/chapters/the-moors/vanishing-path",
        backgroundImage: require("@/assets/images/rituals/vanishing-path-bg.png"),
        stages: [
          "The way forward is not clear. Acknowledge that honestly.",
          "Paths don't vanish. They wait for you to trust the next step.",
          "Take one step toward what feels most like you.",
        ],
      },
    ],
  },
  {
    slug: "first-bloom",
    chapterNumber: 5,
    chapterName: "First Bloom",
    tagline: "Where you rise, and new life begins.",
    accentColor: "#B8896A",
    heroImage: require("@/assets/images/chapters/first-bloom.png"),
    ambientSound: "birdsong-spring",
    rituals: [
      {
        id: "grounding",
        name: "Grounding",
        symbol: "\u25C7",
        route: "/chapters/first-bloom/grounding",
        backgroundImage: require("@/assets/images/rituals/grounding-bg.png"),
        stages: [
          "Feel the surface beneath you. Press into it.",
          "Name five things you can see right now.",
          "You are here. Fully here. That is where everything begins.",
        ],
      },
      {
        id: "opening",
        name: "Opening",
        symbol: "\u25C7",
        route: "/chapters/first-bloom/opening",
        backgroundImage: require("@/assets/images/rituals/opening-bg.png"),
        interactionSound: "petals-rustling",
        stages: [
          "Find one place in your body that is holding tension. Soften it.",
          "You do not have to be open to everything. Just open slightly.",
          "A flower does not force itself open. It is warmed into blooming.",
        ],
      },
      {
        id: "anchoring",
        name: "Anchoring",
        symbol: "\u25C7",
        route: "/chapters/first-bloom/anchoring",
        backgroundImage: require("@/assets/images/rituals/anchoring-bg.png"),
        stages: [
          "Name one thing that always feels like you.",
          "Hold it. A memory, an object, a name you trust.",
          "That is your anchor. You can return to it anytime.",
        ],
      },
      {
        id: "emergence",
        name: "Emergence",
        symbol: "\u25C7",
        route: "/chapters/first-bloom/emergence",
        backgroundImage: require("@/assets/images/rituals/emergence-bg.png"),
        stages: [
          "Something is beginning. It may not look like much yet.",
          "Notice any small sign of movement in your life, even tiny.",
          "Emergence is slow. You are in it right now.",
        ],
      },
      {
        id: "integration",
        name: "Integration",
        symbol: "\u25C7",
        route: "/chapters/first-bloom/integration",
        backgroundImage: require("@/assets/images/rituals/integration-bg.png"),
        interactionSound: "soft-chime-chord",
        stages: [
          "You have been through something. Let yourself know that.",
          "The cold, the storm, the wandering, the waiting, it is part of you.",
          "You are not the same as when you arrived. That is the gift.",
        ],
      },
    ],
  },
];

export function getChapterExperience(slug: string | string[] | undefined) {
  const normalized = Array.isArray(slug) ? slug[0] : slug;
  return chapterExperiences.find((chapter) => chapter.slug === normalized);
}

export function getRitualExperience(chapterSlug: string | string[] | undefined, ritualSlug: string | string[] | undefined) {
  const chapter = getChapterExperience(chapterSlug);
  const normalizedRitual = Array.isArray(ritualSlug) ? ritualSlug[0] : ritualSlug;
  const ritual = chapter?.rituals.find((entry) => entry.id === normalizedRitual);

  return { chapter, ritual };
}
