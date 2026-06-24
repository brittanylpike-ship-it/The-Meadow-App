import { MessageBubble } from "@/components/Hearth/TeaRooms/MessageBubble";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { meadowTheme } from "@/constants/meadow-theme";
import type { TeaRoomMessage } from "@/hooks/useTeaRoom";
import React from "react";
import { Text, View } from "react-native";

export function ChatFeed({ currentUserId, loading, messages }: { currentUserId?: string; loading: boolean; messages: TeaRoomMessage[] }) {
  if (loading) {
    return (
      <View accessibilityLabel="The Tea Room is restoring messages" style={{ gap: 10 }}>
        {[44, 60, 44].map((height, index) => (
          <SkeletonBox key={`${height}-${index}`} height={height} width={index % 2 === 0 ? "74%" : "84%"} />
        ))}
      </View>
    );
  }

  if (!messages.length) {
    return (
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
        It is quiet in here. Pull up a chair.
      </Text>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {messages.map((message) => (
        <MessageBubble key={message.id} currentUserId={currentUserId} message={message} />
      ))}
    </View>
  );
}
