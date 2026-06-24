import { MeadowImage as Image } from "@/components/meadow-image";
import { useWindowDimensions } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";

export type MeadowSceneId =
  | "home"
  | "chapters_home"
  | "journal_home"
  | "hearth_home"
  | "memory_garden"
  | "chapter_frozen_ground"
  | "chapter_storm_garden"
  | "chapter_crossroads"
  | "chapter_the_moors"
  | "chapter_first_bloom"
  | "ritual_evergreen_tree"
  | "ritual_frosted_window"
  | "ritual_frozen_pond"
  | "ritual_quiet_hour"
  | "ritual_footprints"
  | "ritual_lightning_tree"
  | "ritual_thorn_patch"
  | "ritual_floodwaters"
  | "ritual_scorched_earth"
  | "ritual_shattered_mirror"
  | "ritual_worn_path"
  | "ritual_offering"
  | "ritual_candle"
  | "ritual_searching_for_signs"
  | "ritual_waiting_gate"
  | "ritual_canopy_cloak"
  | "ritual_mire"
  | "ritual_bramble"
  | "ritual_fog"
  | "ritual_vanishing_path"
  | "ritual_grounding"
  | "ritual_opening"
  | "ritual_anchoring"
  | "ritual_emergence"
  | "ritual_integration";

type MeadowSceneImageProps = {
  sceneId: MeadowSceneId;
  accessibilityLabel: string;
};

const sceneSources = {
  home: require("@/assets/art/rendered/home.png"),
  chapters_home: require("@/assets/art/rendered/chapters-home.png"),
  journal_home: require("@/assets/art/rendered/journal-home.png"),
  hearth_home: require("@/assets/art/rendered/hearth-home.png"),
  memory_garden: require("@/assets/art/rendered/memory-garden.png"),
  chapter_frozen_ground: require("@/assets/art/rendered/chapter-frozen-ground.png"),
  chapter_storm_garden: require("@/assets/art/rendered/chapter-storm-garden.png"),
  chapter_crossroads: require("@/assets/art/rendered/chapter-crossroads.png"),
  chapter_the_moors: require("@/assets/art/rendered/chapter-the-moors.png"),
  chapter_first_bloom: require("@/assets/art/rendered/chapter-first-bloom.png"),
  ritual_evergreen_tree: require("@/assets/art/rendered/ritual-evergreen-tree.png"),
  ritual_frosted_window: require("@/assets/art/rendered/ritual-frosted-window.png"),
  ritual_frozen_pond: require("@/assets/art/rendered/ritual-frozen-pond.png"),
  ritual_quiet_hour: require("@/assets/art/rendered/ritual-quiet-hour.png"),
  ritual_footprints: require("@/assets/art/rendered/ritual-footprints.png"),
  ritual_lightning_tree: require("@/assets/art/rendered/ritual-lightning-tree.png"),
  ritual_thorn_patch: require("@/assets/art/rendered/ritual-thorn-patch.png"),
  ritual_floodwaters: require("@/assets/art/rendered/ritual-floodwaters.png"),
  ritual_scorched_earth: require("@/assets/art/rendered/ritual-scorched-earth.png"),
  ritual_shattered_mirror: require("@/assets/art/rendered/ritual-shattered-mirror.png"),
  ritual_worn_path: require("@/assets/art/rendered/ritual-worn-path.png"),
  ritual_offering: require("@/assets/art/rendered/ritual-offering.png"),
  ritual_candle: require("@/assets/art/rendered/ritual-candle.png"),
  ritual_searching_for_signs: require("@/assets/art/rendered/ritual-searching-for-signs.png"),
  ritual_waiting_gate: require("@/assets/art/rendered/ritual-waiting-gate.png"),
  ritual_canopy_cloak: require("@/assets/art/rendered/ritual-canopy-cloak.png"),
  ritual_mire: require("@/assets/art/rendered/ritual-mire.png"),
  ritual_bramble: require("@/assets/art/rendered/ritual-bramble.png"),
  ritual_fog: require("@/assets/art/rendered/ritual-fog.png"),
  ritual_vanishing_path: require("@/assets/art/rendered/ritual-vanishing-path.png"),
  ritual_grounding: require("@/assets/art/rendered/ritual-grounding.png"),
  ritual_opening: require("@/assets/art/rendered/ritual-opening.png"),
  ritual_anchoring: require("@/assets/art/rendered/ritual-anchoring.png"),
  ritual_emergence: require("@/assets/art/rendered/ritual-emergence.png"),
  ritual_integration: require("@/assets/art/rendered/ritual-integration.png"),
} satisfies Record<MeadowSceneId, unknown>;

const sceneAspectRatios = {
  home: 852 / 1846,
  chapters_home: 1024 / 1536,
  journal_home: 853 / 1844,
  hearth_home: 1024 / 1536,
  memory_garden: 941 / 1672,
  chapter_frozen_ground: 853 / 1844,
  chapter_storm_garden: 853 / 1844,
  chapter_crossroads: 853 / 1844,
  chapter_the_moors: 875 / 1798,
  chapter_first_bloom: 930 / 1691,
  ritual_evergreen_tree: 864 / 1821,
  ritual_frosted_window: 863 / 1822,
  ritual_frozen_pond: 902 / 1743,
  ritual_quiet_hour: 887 / 1774,
  ritual_footprints: 854 / 1842,
  ritual_lightning_tree: 864 / 1821,
  ritual_thorn_patch: 853 / 1844,
  ritual_floodwaters: 853 / 1843,
  ritual_scorched_earth: 863 / 1822,
  ritual_shattered_mirror: 1024 / 1792,
  ritual_worn_path: 853 / 1844,
  ritual_offering: 853 / 1844,
  ritual_candle: 853 / 1844,
  ritual_searching_for_signs: 854 / 1842,
  ritual_waiting_gate: 853 / 1844,
  ritual_canopy_cloak: 853 / 1843,
  ritual_mire: 852 / 1846,
  ritual_bramble: 853 / 1844,
  ritual_fog: 853 / 1844,
  ritual_vanishing_path: 852 / 1846,
  ritual_grounding: 852 / 1846,
  ritual_opening: 852 / 1846,
  ritual_anchoring: 853 / 1844,
  ritual_emergence: 853 / 1844,
  ritual_integration: 853 / 1844,
} satisfies Record<MeadowSceneId, number>;

export function MeadowSceneImage({ sceneId, accessibilityLabel }: MeadowSceneImageProps) {
  const { height, width } = useWindowDimensions();
  const imageWidth = Math.max(1, width - 36);
  const imageHeight = Math.min(imageWidth / sceneAspectRatios[sceneId], height * 0.4);

  return (
    <Image
      accessible
      accessibilityRole="image"
      source={sceneSources[sceneId]}
      style={{
        backgroundColor: meadowTheme.colors.linenDeep,
        borderRadius: meadowTheme.radius.panel,
        height: imageHeight,
        width: "100%"
      }}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
