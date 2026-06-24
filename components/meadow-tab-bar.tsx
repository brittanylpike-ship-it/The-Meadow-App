import { router, usePathname } from "expo-router";
import { MeadowImage as Image } from "@/components/meadow-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { meadowTheme, tabLabels } from "@/constants/meadow-theme";

const tabIconSources = {
  Home: require("@/assets/icons/home-icon.png"),
  Journal: require("@/assets/icons/journal-icon.png"),
  Chapters: require("@/assets/icons/chapters-icon.png"),
  "Memory Garden": require("@/assets/icons/memory-garden-icon.png"),
  Hearth: require("@/assets/icons/hearth-icon.png"),
  Profile: require("@/assets/icons/profile-icon.png"),
} satisfies Record<(typeof tabLabels)[number], unknown>;

const tabItems = [
  { label: tabLabels[0], href: "/", activePaths: ["/"] },
  { label: tabLabels[1], href: "/journal", activePaths: ["/journal", "/journal/archive"] },
  {
    label: tabLabels[2],
    href: "/chapters",
    activePaths: [
      "/chapters",
      "/frozen-ground",
      "/evergreen-tree",
      "/frosted-window",
      "/frozen-pond",
      "/quiet-hour",
      "/footprints",
      "/storm-garden",
      "/lightning-tree",
      "/thorn-patch",
      "/floodwaters",
      "/scorched-earth",
      "/shattered-mirror",
      "/crossroads",
      "/worn-path",
      "/offering",
      "/candle",
      "/searching-for-signs",
      "/waiting-gate",
      "/the-moors",
      "/canopy-cloak",
      "/mire",
      "/bramble",
      "/fog",
      "/vanishing-path",
      "/first-bloom",
      "/grounding",
      "/opening",
      "/anchoring",
      "/emergence",
      "/integration",
    ],
  },
  { label: tabLabels[3], href: "/memory-garden", activePaths: ["/memory-garden", "/reflection-pool", "/keepsake-box", "/companions"] },
  { label: tabLabels[4], href: "/hearth", activePaths: ["/hearth"] },
  { label: tabLabels[5], href: "/profile", activePaths: ["/profile"] },
] as const;

export function MeadowTabBar() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathname === "/auth" || pathname === "/onboarding" || pathname.startsWith("/(auth)") || pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password") {
    return null;
  }

  if (pathname.startsWith("/chapters/") && pathSegments.length >= 3) {
    return null;
  }

  return (
    <View
      accessibilityRole="tablist"
      style={{
        backgroundColor: meadowTheme.colors.linen,
        borderTopColor: meadowTheme.colors.line,
        borderTopWidth: 1,
        bottom: 0,
        flexDirection: "row",
        height: 82,
        left: 0,
        paddingBottom: 8,
        paddingHorizontal: 6,
        paddingTop: 6,
        position: "absolute",
        right: 0,
        zIndex: 10,
      }}
    >
      {tabItems.map((item) => {
        const active = item.activePaths.includes(pathname as never) || (item.label === "Chapters" && pathname.startsWith("/chapters"));
        return (
          <Pressable
            key={item.label}
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            hitSlop={6}
            onPress={() => router.push(item.href as never)}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: "transparent",
              flex: 1,
              gap: 2,
              justifyContent: "center",
              minWidth: 0,
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <Image
              source={tabIconSources[item.label]}
              style={{
                backgroundColor: meadowTheme.colors.linenDeep,
                borderColor: active ? meadowTheme.colors.sage : meadowTheme.colors.line,
                borderRadius: 16,
                borderWidth: 1,
                height: 32,
                overflow: "hidden",
                width: 32,
              }}
              contentFit="cover"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text
              selectable={false}
              style={{
                color: active ? meadowTheme.colors.sageDeep : meadowTheme.colors.mutedInk,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 12,
                lineHeight: 14,
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {item.label.toUpperCase()}
            </Text>
            <View
              style={{
                backgroundColor: active ? meadowTheme.colors.sage : "transparent",
                borderRadius: 2,
                height: 4,
                width: 4,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
