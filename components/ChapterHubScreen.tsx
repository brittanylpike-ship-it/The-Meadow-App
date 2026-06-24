import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import type { RitualEntry } from "@/constants/chapter-experience";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChapterHubProps = {
  chapterNumber: number;
  chapterName: string;
  tagline: string;
  accentColor: string;
  heroImage: ImageSourcePropType;
  rituals: RitualEntry[];
};

export function ChapterHubScreen({ chapterNumber, chapterName, tagline, accentColor, heroImage, rituals }: ChapterHubProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ height: 120 + insets.top, overflow: "hidden", position: "relative", width: "100%" }}>
          <Image
            accessibilityLabel={`${chapterName} chapter landscape`}
            accessibilityRole="image"
            contentFit="cover"
            source={heroImage}
            style={{ height: 120 + insets.top, width: "100%" }}
          />
          <View style={{ backgroundColor: "rgba(245,241,235,0.24)", bottom: 46, height: 34, left: 0, position: "absolute", right: 0 }} />
          <View style={{ backgroundColor: "#F5F1EB", bottom: 0, height: 50, left: 0, opacity: 0.94, position: "absolute", right: 0 }} />
          <View style={{ alignItems: "center", bottom: 8, left: 20, position: "absolute", right: 20 }}>
            <Text selectable style={{ color: "#7A7060", fontFamily: meadowTheme.fonts.body, fontSize: 12, letterSpacing: 2, lineHeight: 18, textTransform: "uppercase" }}>
              Chapter {chapterNumber}
            </Text>
            <Text selectable style={{ color: "#3D4A2E", fontFamily: meadowTheme.fonts.header, fontSize: 28, lineHeight: 32, textAlign: "center" }}>
              {chapterName}
            </Text>
            <Text selectable style={{ color: "#7A7060", fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 18, textAlign: "center" }}>
              {tagline}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: "#F5F1EB" }}>
          {rituals.map((ritual, index) => (
            <Pressable
              key={ritual.id}
              accessibilityHint={`Opens ${ritual.name}.`}
              accessibilityLabel={ritual.name}
              accessibilityRole="button"
              hitSlop={4}
              onPress={() => router.push(ritual.route as never)}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: index % 2 === 0 ? "#F5F1EB" : "#EDE8E0",
                borderBottomColor: "#C8BFA8",
                borderBottomWidth: 1,
                flexDirection: "row",
                height: 68,
                opacity: pressed ? 0.8 : 1,
                paddingLeft: 20,
                paddingRight: 20,
              })}
            >
              <Text selectable={false} style={{ color: accentColor, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 26, width: 28 }}>
                {ritual.symbol}
              </Text>
              <Text selectable style={{ color: "#3D4A2E", flex: 1, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 24, paddingLeft: 12 }}>
                {ritual.name}
              </Text>
              <Text selectable={false} style={{ color: "#AFA48F", fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 28 }}>
                {">"}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Back"
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => router.back()}
        style={{ left: 16, position: "absolute", top: insets.top + 16 }}
      >
        <Text selectable={false} style={{ color: "#3D4A2E", fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {"<- Back"}
        </Text>
      </Pressable>
    </View>
  );
}
