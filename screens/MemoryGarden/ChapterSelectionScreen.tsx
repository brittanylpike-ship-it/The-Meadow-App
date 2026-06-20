import { MeadowImage as Image } from "@/components/meadow-image";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";

type MemoryGardenChapterRoute =
  | "/winter-chapter"
  | "/storm-chapter"
  | "/journey-chapter"
  | "/shadow-forest-chapter"
  | "/spring-chapter";

export type ChapterCard = {
  id: string;
  name: string;
  symbol: string;
  accentColor: string;
  route: MemoryGardenChapterRoute;
  entryCount: number;
};

const landscapeImage = require("@/assets/images/memory-garden-landscape.png");

const chapters: ChapterCard[] = [
  {
    id: "winter",
    name: "Winter",
    symbol: "✣",
    accentColor: "#8BAFC4",
    route: "/winter-chapter",
    entryCount: 5,
  },
  {
    id: "storm",
    name: "Storm",
    symbol: "⚡",
    accentColor: "#6B6B8A",
    route: "/storm-chapter",
    entryCount: 5,
  },
  {
    id: "journey",
    name: "Journey",
    symbol: "◇",
    accentColor: "#A89070",
    route: "/journey-chapter",
    entryCount: 5,
  },
  {
    id: "shadow_forest",
    name: "Shadow Forest",
    symbol: "✣",
    accentColor: "#5A6B4A",
    route: "/shadow-forest-chapter",
    entryCount: 5,
  },
  {
    id: "spring",
    name: "Spring",
    symbol: "◇",
    accentColor: "#B8896A",
    route: "/spring-chapter",
    entryCount: 5,
  },
];

const screenHeight = Dimensions.get("window").height;
const heroHeight = Math.min(Math.round(screenHeight * 0.52), 430);

export function ChapterSelectionScreen() {
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
        contentContainerStyle={{ paddingBottom: 108 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={landscapeImage}
          style={{ backgroundColor: meadowTheme.colors.linenDeep, height: heroHeight, width: "100%" }}
          contentFit="cover"
          accessibilityLabel="A watercolor Memory Garden landscape with five emotional seasons"
        />

        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <Text
            selectable
            style={{
              color: "#7A7060",
              fontFamily: meadowTheme.fonts.body,
              fontSize: 12,
              letterSpacing: 2,
              lineHeight: 18,
              textTransform: "uppercase",
            }}
          >
            MEMORY GARDEN
          </Text>
          <Text
            selectable
            style={{
              color: "#3D4A2E",
              fontFamily: meadowTheme.fonts.header,
              fontSize: 24,
              lineHeight: 32,
            }}
          >
            Choose a chapter
          </Text>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={{
            alignItems: "center",
            minHeight: 148,
            paddingHorizontal: 12,
            paddingVertical: 16,
          }}
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          {chapters.map((chapter) => (
            <PressCard
              key={chapter.id}
              accessibilityLabel={`${chapter.name}. ${chapter.entryCount} entries.`}
              accessibilityHint={`Opens the ${chapter.name} Memory Garden chapter.`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push(chapter.route as never)}
              style={{
                alignItems: "center",
                backgroundColor: "#F5F1EB",
                borderColor: "#C8BFA8",
                borderRadius: 12,
                borderWidth: 1,
                boxShadow: "0 3px 8px rgba(61, 74, 46, 0.14)",
                height: 100,
                justifyContent: "center",
                marginHorizontal: 8,
                paddingHorizontal: 10,
                width: 120,
              }}
            >
              <Text
                selectable={false}
                style={{
                  color: chapter.accentColor,
                  fontFamily: meadowTheme.fonts.header,
                  fontSize: 28,
                  lineHeight: 34,
                }}
              >
                {chapter.symbol}
              </Text>
              <Text
                selectable={false}
                style={{
                  color: "#3D4A2E",
                  fontFamily: meadowTheme.fonts.header,
                  fontSize: 17,
                  lineHeight: 22,
                  marginTop: 2,
                  textAlign: "center",
                }}
                numberOfLines={2}
              >
                {chapter.name}
              </Text>
              <Text
                selectable={false}
                style={{
                  color: "#7A7060",
                  fontFamily: meadowTheme.fonts.body,
                  fontSize: 12,
                  lineHeight: 18,
                  textAlign: "center",
                }}
              >
                {chapter.entryCount} entries
              </Text>
            </PressCard>
          ))}
        </ScrollView>

        <Pressable
          accessibilityLabel="Meet the Witnessing Companions"
          accessibilityRole="button"
          onPress={() => router.push("/companions" as never)}
          style={({ pressed }) => ({
            alignSelf: "center",
            marginTop: 2,
            opacity: pressed ? 0.72 : 1,
            paddingHorizontal: 20,
            paddingVertical: 12,
          })}
        >
          <Text
            selectable={false}
            style={{
              color: "#7A7060",
              fontFamily: meadowTheme.fonts.body,
              fontSize: 13,
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            Meet the Companions -&gt;
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
