import { MeadowButton } from "@/components/meadow-button";
import { meadowTheme } from "@/constants/meadow-theme";
import { checkCommunityContent } from "@/services/moderationService";
import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

export function CreateLetterSheet({
  onCancel,
  onSave,
  visible,
}: {
  onCancel: () => void;
  onSave: (body: string, cubby: string) => Promise<void> | void;
  visible: boolean;
}) {
  const [body, setBody] = React.useState("");
  const [cubby, setCubby] = React.useState("introductions");
  const [warning, setWarning] = React.useState<string | null>(null);

  async function save() {
    const result = checkCommunityContent(body, 1000);
    setWarning(result.warning);
    if (!result.ok || !result.cleanedBody) {
      return;
    }

    await onSave(result.cleanedBody, cubby);
    setBody("");
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={{ backgroundColor: "rgba(59, 42, 26, 0.26)", flex: 1, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: meadowTheme.colors.panel, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 12, padding: 20 }}>
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30, textAlign: "center" }}>
            Write a Letter
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
            A slow space for thoughtful words.
          </Text>
          <TextInput
            accessibilityLabel="Letter cubby"
            onChangeText={setCubby}
            placeholder="introductions"
            placeholderTextColor={meadowTheme.colors.mutedInk}
            style={inputStyle}
            value={cubby}
          />
          <TextInput
            accessibilityLabel="Letter body"
            multiline
            onChangeText={setBody}
            placeholder="Dear Meadow..."
            placeholderTextColor={meadowTheme.colors.mutedInk}
            style={[inputStyle, { minHeight: 130, textAlignVertical: "top" }]}
            value={body}
          />
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18, textAlign: "right" }}>
            {body.length}/1000
          </Text>
          {warning ? (
            <Text selectable style={{ color: meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
              {warning}
            </Text>
          ) : null}
          <MeadowButton label="Seal and send" onPress={() => void save()} />
          <Pressable accessibilityLabel="Let this letter rest" accessibilityRole="button" hitSlop={8} onPress={onCancel}>
            <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
              Let this one rest.
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const inputStyle = {
  backgroundColor: meadowTheme.colors.linenDeep,
  borderColor: meadowTheme.colors.line,
  borderRadius: meadowTheme.radius.panel,
  borderWidth: 1,
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 15,
  lineHeight: 23,
  padding: 12,
} as const;
