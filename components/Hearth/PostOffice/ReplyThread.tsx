import { BotanicalAvatar } from "@/components/Hearth/BotanicalAvatar";
import { meadowTheme } from "@/constants/meadow-theme";
import type { HearthReply } from "@/hooks/useHearthPosts";
import React from "react";
import { Text, View } from "react-native";

export function ReplyThread({ replies }: { replies: HearthReply[] }) {
  if (!replies.length) {
    return (
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20 }}>
        No replies yet. Leave one gently.
      </Text>
    );
  }

  return (
    <View style={{ backgroundColor: meadowTheme.colors.linenDeep, borderRadius: meadowTheme.radius.panel, gap: 8, padding: 10 }}>
      {replies.slice(0, 2).map((reply) => (
        <View key={reply.id} style={{ flexDirection: "row", gap: 8 }}>
          <BotanicalAvatar seed={reply.user_id} size={28} />
          <View style={{ flex: 1 }}>
            <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 15, lineHeight: 20 }}>
              {reply.display_name}
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>
              {reply.content}
            </Text>
          </View>
        </View>
      ))}
      {replies.length > 2 ? (
        <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
          View {replies.length - 2} more replies
        </Text>
      ) : null}
    </View>
  );
}
