import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { meadowTheme } from "@/constants/meadow-theme";

type MemoryGardenChapterStubProps = {
  chapterName: string;
};

export function MemoryGardenChapterStub({ chapterName }: MemoryGardenChapterStubProps) {
  return (
    <SafeAreaView style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14 }}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            opacity: pressed ? 0.78 : 1,
            paddingVertical: 8,
          })}
        >
          <Text selectable={false} style={{ color: "#3D4A2E", fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
            {"← Back"}
          </Text>
        </Pressable>

        <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 92 }}>
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 32, lineHeight: 40, textAlign: "center" }}>
            {chapterName} Chapter
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 24, marginTop: 8, textAlign: "center" }}>
            coming soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
