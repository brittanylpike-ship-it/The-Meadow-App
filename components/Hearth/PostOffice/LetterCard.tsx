import { BotanicalAvatar } from "@/components/Hearth/BotanicalAvatar";
import { WaxSealButton } from "@/components/Hearth/PostOffice/WaxSealButton";
import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import type { HearthPost } from "@/hooks/useHearthPosts";
import React from "react";
import { Text, View } from "react-native";

export function LetterCard({ letter, onOpen, onSeal }: { letter: HearthPost; onOpen?: () => void; onSeal?: () => void }) {
  return (
    <PressCard
      accessibilityLabel={letter.title ?? "Open letter"}
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
        <BotanicalAvatar seed={letter.user_id} size={34} />
        <View style={{ flex: 1 }}>
          <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 17, lineHeight: 22 }}>
            {letter.display_name}
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
            {letter.category}
          </Text>
        </View>
        <WaxSealButton count={letter.seal_count} onPress={onSeal} />
      </View>
      {letter.title ? (
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25 }}>
          {letter.title}
        </Text>
      ) : null}
      <Text selectable numberOfLines={3} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
        {letter.content}
      </Text>
    </PressCard>
  );
}
