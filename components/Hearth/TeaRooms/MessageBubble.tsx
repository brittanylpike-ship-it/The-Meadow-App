import { BotanicalAvatar } from "@/components/Hearth/BotanicalAvatar";
import { meadowTheme } from "@/constants/meadow-theme";
import type { TeaRoomMessage } from "@/hooks/useTeaRoom";
import React from "react";
import { Text, View } from "react-native";

export function MessageBubble({ currentUserId, message }: { currentUserId?: string; message: TeaRoomMessage }) {
  const mine = currentUserId === message.user_id;

  return (
    <View style={{ alignItems: mine ? "flex-end" : "flex-start", gap: 4 }}>
      <View style={{ alignItems: "center", flexDirection: mine ? "row-reverse" : "row", gap: 8, maxWidth: "86%" }}>
        <BotanicalAvatar seed={message.user_id} size={28} />
        <View
          style={{
            backgroundColor: mine ? meadowTheme.colors.sage : meadowTheme.colors.panel,
            borderColor: meadowTheme.colors.line,
            borderRadius: 14,
            borderWidth: 1,
            padding: 10,
          }}
        >
          <Text selectable style={{ color: mine ? meadowTheme.colors.linen : meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 15, lineHeight: 20 }}>
            {message.display_name}
          </Text>
          <Text selectable style={{ color: mine ? meadowTheme.colors.linen : meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
            {message.content}
          </Text>
        </View>
      </View>
    </View>
  );
}
