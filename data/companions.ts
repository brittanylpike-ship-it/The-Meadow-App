import type { ChapterSlug } from "@/constants/chapter-experience";
import type { ImageSourcePropType } from "react-native";

export type IdleAnimationType =
  | "EAR_TWITCH"
  | "HEAD_TILT"
  | "NOSE_SNIFF"
  | "WING_SETTLE"
  | "SLOW_CROSS"
  | "WING_FLUTTER"
  | "SLOW_BLINK"
  | "PEEK_RETREAT"
  | "HOVER_DRIFT";

export type Companion = {
  id: string;
  name: string;
  chapter: ChapterSlug | "all";
  position: "corner" | "edge" | "perch";
  personality: string;
  imageAsset: ImageSourcePropType;
  idleAnimation: IdleAnimationType;
  witnessedPhrases: string[];
  presenceThreshold: number;
};

export const companions: Companion[] = [
  {
    id: "rabbit",
    name: "Rabbit",
    chapter: "frozen-ground",
    position: "corner",
    personality: "Still, gentle, and loyal to the quiet.",
    imageAsset: require("@/assets/images/companions/rabbit.png"),
    idleAnimation: "EAR_TWITCH",
    presenceThreshold: 0,
    witnessedPhrases: [
      "The rabbit sat very still and watched you the whole time.",
      "It didn't leave. Neither did you.",
      "The rabbit knows stillness. It recognized yours.",
      "It saw you stay. That mattered to it.",
      "Small and quiet. It thought you were brave.",
    ],
  },
  {
    id: "chickadee",
    name: "Chickadee",
    chapter: "all",
    position: "perch",
    personality: "A small returning presence.",
    imageAsset: require("@/assets/images/companions/chickadee.png"),
    idleAnimation: "HEAD_TILT",
    presenceThreshold: 1,
    witnessedPhrases: [
      "The chickadee visited today. It always comes back.",
      "It doesn't know your name but it chose your branch.",
      "Small birds do not worry about the weather. They sing anyway.",
      "It saw you here. It will look for you tomorrow.",
      "The chickadee thinks you are worth returning to.",
    ],
  },
  {
    id: "hedgehog",
    name: "Hedgehog",
    chapter: "frozen-ground",
    position: "corner",
    personality: "Careful, guarded, and close by.",
    imageAsset: require("@/assets/images/companions/hedgehog.png"),
    idleAnimation: "NOSE_SNIFF",
    presenceThreshold: 2,
    witnessedPhrases: [
      "The hedgehog watched from the edge. It takes time to trust.",
      "It didn't uncurl completely. But it didn't leave either.",
      "Spines are protection, not rejection. It knows that about you too.",
      "It saw the whole thing. It is still here.",
      "It is thinking about coming closer next time.",
    ],
  },
  {
    id: "crow",
    name: "Crow",
    chapter: "storm-garden",
    position: "perch",
    personality: "Unflinching witness of storms.",
    imageAsset: require("@/assets/images/companions/crow.png"),
    idleAnimation: "WING_SETTLE",
    presenceThreshold: 0,
    witnessedPhrases: [
      "The crow watched without looking away. It respects that in you.",
      "Crows remember faces. It will remember yours.",
      "It has weathered many storms. It thinks you will too.",
      "It didn't flinch. Neither did you, not really.",
      "The crow has no comfort to offer. Only witness. That was enough.",
    ],
  },
  {
    id: "snail",
    name: "Snail",
    chapter: "crossroads",
    position: "edge",
    personality: "Slow, certain, and unhurried.",
    imageAsset: require("@/assets/images/companions/snail.png"),
    idleAnimation: "SLOW_CROSS",
    presenceThreshold: 1,
    witnessedPhrases: [
      "The snail was crossing when you arrived. It is still crossing. It's okay.",
      "It carries everything it needs. You are figuring out what that is.",
      "The snail does not worry about being slow. It always arrives.",
      "It noticed you at the crossroads. It did not tell you which way to go.",
      "No rush. The snail said so.",
    ],
  },
  {
    id: "moth",
    name: "Moth",
    chapter: "crossroads",
    position: "edge",
    personality: "Drawn to warmth by feeling.",
    imageAsset: require("@/assets/images/companions/moth.png"),
    idleAnimation: "WING_FLUTTER",
    presenceThreshold: 2,
    witnessedPhrases: [
      "The moth found the light. So did you.",
      "It flew toward something it didn't fully understand. That's enough.",
      "Navigation by feeling. The moth has always done it this way.",
      "It circled the candle the whole time you were here.",
      "Drawn to warmth. It thought you were warm.",
    ],
  },
  {
    id: "owl",
    name: "Owl",
    chapter: "the-moors",
    position: "perch",
    personality: "A patient watcher in the fog.",
    imageAsset: require("@/assets/images/companions/owl.png"),
    idleAnimation: "SLOW_BLINK",
    presenceThreshold: 0,
    witnessedPhrases: [
      "The owl saw you in the fog. It always can.",
      "It has been watching the moors for a very long time. You belong here too.",
      "It does not think you are lost. It thinks you are finding.",
      "The owl blinked slowly. That is how it says it sees you.",
      "You are not invisible here. The owl makes sure of that.",
    ],
  },
  {
    id: "field-mouse",
    name: "Field Mouse",
    chapter: "the-moors",
    position: "corner",
    personality: "Small, brave, and returning.",
    imageAsset: require("@/assets/images/companions/field-mouse.png"),
    idleAnimation: "PEEK_RETREAT",
    presenceThreshold: 2,
    witnessedPhrases: [
      "The field mouse peeked out the whole time. It knows about being small in big places.",
      "It hid twice. Then it came back. That's what it does.",
      "It saw you manage. It thought that looked familiar.",
      "Small things survive the moors. It wanted you to know.",
      "It doesn't know you yet. But it keeps looking.",
    ],
  },
  {
    id: "bumblebee",
    name: "Bumblebee",
    chapter: "first-bloom",
    position: "edge",
    personality: "A soft arrival near new growth.",
    imageAsset: require("@/assets/images/companions/bumblebee.png"),
    idleAnimation: "HOVER_DRIFT",
    presenceThreshold: 0,
    witnessedPhrases: [
      "The bumblebee visited every bloom. It didn't skip yours.",
      "Aerodynamically it shouldn't fly. It never got the memo.",
      "It arrived covered in pollen from somewhere else. Carrying things from one place to another.",
      "The bumblebee thinks new growth is worth showing up for.",
      "It buzzed around you the whole time. That's how it says welcome.",
    ],
  },
];

export function getCompanionById(id: string) {
  return companions.find((companion) => companion.id === id);
}

export function getCompanionsForChapter(chapter: ChapterSlug) {
  return companions.filter((companion) => companion.chapter === chapter);
}

export function getAmbientCompanionsForChapter(chapter: ChapterSlug, totalRitualsWitnessed: number) {
  const chapterCompanions = getCompanionsForChapter(chapter);
  const chickadee = companions.find((companion) => companion.id === "chickadee");
  return totalRitualsWitnessed > 0 && chickadee ? [...chapterCompanions, chickadee] : chapterCompanions;
}
