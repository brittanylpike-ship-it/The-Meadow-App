export type FrozenGroundLandmark = {
  id: "evergreen_tree" | "frosted_window" | "frozen_pond" | "quiet_hour" | "footprints";
  title: string;
  emotionalThread: string;
  description: string;
  route: "/evergreen-tree" | "/frosted-window" | "/frozen-pond" | "/quiet-hour" | "/footprints";
  enabled: boolean;
};

export const frozenGroundLandmarks: FrozenGroundLandmark[];
