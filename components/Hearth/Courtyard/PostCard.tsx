import { BotanicalAvatar } from "@/components/Hearth/BotanicalAvatar";
import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import type { HearthPost } from "@/hooks/useHearthPosts";
import React from "react";
import { Text, View } from "react-native";

export function PostCard({ onOpen, post }: { onOpen?: () => void; post: HearthPost }) {
  return (
    <PressCard
      accessibilityLabel="Open courtyard post"
      accessibilityRole="button"
      hitSlop={6}
      onPress={onOpen}
      style={{
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.panel,
        borderWidth: 1,
        gap: 10,
        padding: 14,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
        <BotanicalAvatar seed={post.user_id} size={34} />
        <View style={{ flex: 1 }}>
          <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 17, lineHeight: 22 }}>
            {post.display_name}
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
            {post.category}
          </Text>
        </View>
      </View>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
        {post.content}
      </Text>
    </PressCard>
  );
}
