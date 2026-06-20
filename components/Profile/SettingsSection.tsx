import { MeadowButton } from "@/components/meadow-button";
import { meadowTheme } from "@/constants/meadow-theme";
import { clearMeadowData } from "@/hooks/useProfileContext";
import { router } from "expo-router";
import React from "react";
import { Alert, Modal, Pressable, Switch, Text, TextInput, View } from "react-native";

type SettingsSectionProps = {
  animationsEnabled: boolean;
  audioEnabled: boolean;
  displayName: string;
  journalEntryCount: number;
  onSaveDisplayName: (value: string) => Promise<void>;
  onToggleAnimations: (value: boolean) => Promise<void>;
  onToggleAudio: (value: boolean) => Promise<void>;
};

const appVersion = require("@/app.json").expo.version as string;

export function SettingsSection({
  animationsEnabled,
  audioEnabled,
  displayName,
  journalEntryCount,
  onSaveDisplayName,
  onToggleAnimations,
  onToggleAudio,
}: SettingsSectionProps) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [draftName, setDraftName] = React.useState(displayName);

  React.useEffect(() => {
    setDraftName(displayName);
  }, [displayName]);

  function confirmClear() {
    Alert.alert("Are you sure?", "This will clear your journey, journal, and companions.", [
      { style: "cancel", text: "Keep everything" },
      {
        text: "Yes, clear",
        onPress: () =>
          Alert.alert("This cannot be undone.", "", [
            { style: "cancel", text: "Cancel" },
            {
              style: "destructive",
              text: "Clear everything",
              onPress: async () => {
                await clearMeadowData();
                router.replace("/");
              },
            },
          ]),
      },
    ]);
  }

  async function keepName() {
    await onSaveDisplayName(draftName);
    setModalVisible(false);
  }

  return (
    <View style={{ gap: 10, paddingHorizontal: 20 }}>
      <Text selectable style={sectionHeading}>
        Settings
      </Text>
      <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: 14, borderCurve: "continuous", borderWidth: 1, paddingHorizontal: 14 }}>
        <SettingsRow label="Your name in The Meadow" onPress={() => setModalVisible(true)} right={displayName || "Not set"} />
        <ToggleRow label="Ambient sounds" onValueChange={onToggleAudio} value={audioEnabled} />
        <ToggleRow label="Companion motion" onValueChange={onToggleAnimations} value={animationsEnabled} />
        <SettingsRow label="My journal entries" onPress={() => router.push("/journal/archive" as never)} right={`${journalEntryCount} entries >`} />
        <SettingsRow label="Clear Meadow data" onPress={confirmClear} right=">" warning />
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 56 }}>
          <Text selectable style={rowLabel}>
            Version
          </Text>
          <Text selectable style={rowValue}>
            {appVersion}
          </Text>
        </View>
      </View>
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={{ alignItems: "center", backgroundColor: "rgba(59,42,26,0.34)", flex: 1, justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: 16, borderCurve: "continuous", borderWidth: 1, gap: 14, padding: 18, width: "100%" }}>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28, textAlign: "center" }}>
              Your name in The Meadow
            </Text>
            <TextInput
              accessibilityLabel="Your name in The Meadow"
              onChangeText={setDraftName}
              placeholder="Leave blank to remain unnamed."
              placeholderTextColor={meadowTheme.colors.mutedInk}
              style={{
                backgroundColor: meadowTheme.colors.linenDeep,
                borderColor: meadowTheme.colors.line,
                borderRadius: 10,
                borderWidth: 1,
                color: meadowTheme.colors.ink,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 16,
                lineHeight: 24,
                minHeight: 48,
                paddingHorizontal: 12,
              }}
              value={draftName}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <MeadowButton label="Cancel" quiet onPress={() => setModalVisible(false)} />
              <MeadowButton label="Keep this" onPress={() => void keepName()} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingsRow({ label, onPress, right, warning }: { label: string; onPress: () => void; right: string; warning?: boolean }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        borderBottomColor: meadowTheme.colors.line,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: 56,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text selectable={false} style={rowLabel}>
        {label}
      </Text>
      <Text selectable={false} style={[rowValue, warning ? { color: meadowTheme.colors.clay } : null]}>
        {right}
      </Text>
    </Pressable>
  );
}

function ToggleRow({ label, onValueChange, value }: { label: string; onValueChange: (value: boolean) => Promise<void>; value: boolean }) {
  return (
    <View style={{ alignItems: "center", borderBottomColor: meadowTheme.colors.line, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 56 }}>
      <Text selectable style={rowLabel}>
        {label}
      </Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={(next) => void onValueChange(next)}
        thumbColor={meadowTheme.colors.panel}
        trackColor={{ false: meadowTheme.colors.fog, true: meadowTheme.colors.sage }}
        value={value}
      />
    </View>
  );
}

const sectionHeading = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 18,
  lineHeight: 24,
} as const;

const rowLabel = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 15,
  lineHeight: 21,
} as const;

const rowValue = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  lineHeight: 18,
  textAlign: "right",
} as const;
