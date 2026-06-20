import { PressCard } from "@/components/PressCard";
import { meadowTheme } from "@/constants/meadow-theme";
import { ReportReason, submitReport } from "@/services/moderationService";
import { useAuth } from "@/features/auth/auth-context";
import React from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";

const reasons: ReportReason[] = ["Unkind or harmful", "Spam", "Crisis concern", "Privacy concern", "Other"];

export function SafetyBar({
  contentId = "hearth-room",
  contentType = "post",
}: {
  contentId?: string;
  contentType?: "letter" | "reply" | "message" | "post" | "comment";
}) {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = React.useState(false);
  const [crisisNotice, setCrisisNotice] = React.useState(false);

  async function chooseReason(reason: ReportReason) {
    const result = await submitReport({ reporterId: user?.id, contentId, contentType, reason });
    setReportOpen(false);
    setCrisisNotice(result.crisisConcern);
    Alert.alert("Thank you for caring for our community.");
  }

  return (
    <View style={{ gap: 8 }}>
      {crisisNotice ? (
        <View
          style={{
            backgroundColor: meadowTheme.colors.panelDeep,
            borderColor: meadowTheme.colors.lavender,
            borderRadius: meadowTheme.radius.panel,
            borderWidth: 1,
            padding: 12,
          }}
        >
          <Text selectable style={careText}>
            If you or someone you know is in crisis: call or text 988, or text HOME to 741741.
          </Text>
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: meadowTheme.colors.panel,
          borderColor: meadowTheme.colors.line,
          borderRadius: meadowTheme.radius.panel,
          borderWidth: 1,
          gap: 10,
          padding: 12,
        }}
      >
        <Text selectable style={careText}>
          Safety & Care in Our Community. Your wellbeing matters here.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <SafetyAction label="Report" onPress={() => setReportOpen(true)} />
          <SafetyAction label="Community Guidelines" />
          <SafetyAction label="Need Support" onPress={() => setCrisisNotice(true)} />
        </View>
      </View>

      <Modal animationType="slide" transparent visible={reportOpen} onRequestClose={() => setReportOpen(false)}>
        <View style={{ backgroundColor: "rgba(59, 42, 26, 0.26)", flex: 1, justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: meadowTheme.colors.panel,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              gap: 12,
              padding: 20,
            }}
          >
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30, textAlign: "center" }}>
              Why are you reporting this?
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {reasons.map((reason) => (
                <SafetyAction key={reason} label={reason} onPress={() => void chooseReason(reason)} />
              ))}
            </View>
            <Pressable accessibilityLabel="Let this report rest" accessibilityRole="button" hitSlop={8} onPress={() => setReportOpen(false)}>
              <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
                Let this rest
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SafetyAction({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <PressCard
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={{
        backgroundColor: meadowTheme.colors.linenDeep,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.control,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text selectable={false} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
        {label}
      </Text>
    </PressCard>
  );
}

const careText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 13,
  fontStyle: "italic",
  lineHeight: 20,
  textAlign: "center",
} as const;
