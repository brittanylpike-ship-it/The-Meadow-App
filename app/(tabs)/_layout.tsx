import { Tabs } from "expo-router";
import React from "react";

import { meadowTheme } from "@/constants/meadow-theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: meadowTheme.colors.linen },
        headerTintColor: meadowTheme.colors.ink,
        headerTitleStyle: { fontFamily: meadowTheme.fonts.header },
        tabBarActiveTintColor: meadowTheme.colors.sageDeep,
        tabBarInactiveTintColor: meadowTheme.colors.mutedInk,
        tabBarLabelStyle: { fontFamily: meadowTheme.fonts.body, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: meadowTheme.colors.panel,
          borderTopColor: meadowTheme.colors.line,
          display: "none",
          height: 78,
          paddingBottom: 10,
          paddingTop: 8
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: () => null }} />
      <Tabs.Screen name="journal" options={{ title: "Journal", tabBarIcon: () => null }} />
      <Tabs.Screen name="chapters" options={{ title: "Chapters", tabBarIcon: () => null }} />
      <Tabs.Screen name="memory-garden" options={{ title: "Memory Garden", tabBarIcon: () => null }} />
      <Tabs.Screen name="hearth" options={{ title: "Hearth", tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => null }} />
    </Tabs>
  );
}
