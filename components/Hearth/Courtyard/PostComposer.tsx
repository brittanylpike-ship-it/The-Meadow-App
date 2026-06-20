import { MeadowButton } from "@/components/meadow-button";
import { CrisisSupportCard } from "@/components/Hearth/CrisisSupportCard";
import { meadowTheme } from "@/constants/meadow-theme";
import { checkCommunityContent } from "@/services/moderationService";
import React from "react";
import { Text, TextInput, View } from "react-native";

export function PostComposer({ onPost, prompt = "Share something from your heart..." }: { onPost: (body: string) => Promise<void> | void; prompt?: string }) {
  const [body, setBody] = React.useState("");
  const [warning, setWarning] = React.useState<string | null>(null);
  const [crisisOpen, setCrisisOpen] = React.useState(false);

  async function submit() {
    const result = await checkCommunityContent(body, 600);
    setWarning(result.warning);
    if (result.moderation.flagLevel === "crisis") {
      setCrisisOpen(true);
      return;
    }

    if (!result.ok) {
      return;
    }

    if (!result.cleanedBody) {
      return;
    }
    await onPost(result.cleanedBody);
    setBody("");
  }

  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 10, padding: 12 }}>
      <TextInput
        accessibilityLabel="Courtyard post"
        multiline
        onChangeText={setBody}
        placeholder={prompt}
        placeholderTextColor={meadowTheme.colors.mutedInk}
        style={{
          backgroundColor: meadowTheme.colors.linenDeep,
          borderColor: meadowTheme.colors.line,
          borderRadius: meadowTheme.radius.panel,
          borderWidth: 1,
          color: meadowTheme.colors.ink,
          fontFamily: meadowTheme.fonts.body,
          fontSize: 15,
          lineHeight: 23,
          minHeight: 74,
          padding: 12,
          textAlignVertical: "top",
        }}
        value={body}
      />
      {warning ? (
        <Text selectable style={{ color: meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>
          {warning}
        </Text>
      ) : null}
      <MeadowButton label="Post" onPress={() => void submit()} />
      <CrisisSupportCard visible={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </View>
  );
}
