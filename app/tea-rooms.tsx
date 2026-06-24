import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect, router } from "expo-router";
import React from "react";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { SkeletonBox } from "@/components/SkeletonLoader";
import { CrisisSupportCard } from "@/components/Hearth/CrisisSupportCard";
import { SafetyBar } from "@/components/Hearth/SafetyBar";
import { SuccessFlash } from "@/components/SuccessFlash";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { TeaRoomMessage, useTeaRoom } from "@/hooks/useTeaRoom";
import { checkCommunityContent } from "@/services/moderationService";

const teaRoomsImage = require("@/assets/illustrations/tea-rooms.png");

const roomBlends = [
  { label: "Quiet Venting", value: "quiet-venting" },
  { label: "Grief & Loss", value: "grief-loss" },
  { label: "Gratitude Corner", value: "gratitude-corner" },
  { label: "Can't Sleep", value: "cant-sleep" },
  { label: "Just Listening", value: "just-listening" },
] as const;

const quickActions = ["Pour a Cup", "Take a Breath", "Send a Hug", "Thank You", "Pass the Honey"] as const;

export default function TeaRoomsScreen() {
  const { user, loading } = useAuth();
  const [roomBlend, setRoomBlend] = React.useState("quiet-venting");
  const [draft, setDraft] = React.useState("");
  const [roomInfoOpen, setRoomInfoOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [warning, setWarning] = React.useState<string | null>(null);
  const [crisisOpen, setCrisisOpen] = React.useState(false);
  const teaRoom = useTeaRoom(roomBlend);

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  async function send() {
    if (!draft.trim()) {
      return;
    }

    const check = await checkCommunityContent(draft, 500);
    setWarning(check.warning);
    if (check.moderation.flagLevel === "crisis") {
      setCrisisOpen(true);
      return;
    }

    if (!check.ok) {
      return;
    }

    const saved = await teaRoom.sendMessage(check.cleanedBody);
    setDraft("");
    setFlash(saved?.flagged ? "Sent. Held for gentle review." : "Sent.");
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await teaRoom.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[meadowTheme.colors.sage]} refreshing={refreshing} tintColor={meadowTheme.colors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 16, padding: 18, paddingBottom: 120 }}
    >
      <RoomHeader title="Tea Rooms" />
      <Image
        source={teaRoomsImage}
        style={{ backgroundColor: meadowTheme.colors.panel, borderRadius: meadowTheme.radius.panel, height: 200, width: "100%" }}
        contentFit="cover"
        accessibilityLabel="A storybook tea room with warm tables and teacups"
      />

      <Text selectable style={introText}>
        Pull up a chair. You are not alone here.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {roomBlends.map((blend) => (
          <Pill
            key={blend.value}
            active={blend.value === roomBlend}
            label={blend.label}
            onPress={() => setRoomBlend(blend.value)}
          />
        ))}
      </ScrollView>

      <View style={{ gap: 10, width: "100%" }}>
        {teaRoom.loading ? (
          <TeaRoomSkeletons />
        ) : teaRoom.messages.length ? (
          teaRoom.messages.map((message) => <MessageBubble key={message.id} message={message} currentUserId={user?.id} />)
        ) : (
          <EmptyState title="It's quiet in here." body="Pull up a chair. Say something." />
        )}
      </View>

      <Pressable
        accessibilityLabel="Room Info"
        accessibilityRole="button"
        accessibilityState={{ expanded: roomInfoOpen }}
        onPress={() => setRoomInfoOpen((open) => !open)}
        style={{ alignItems: "center", paddingVertical: 4 }}
      >
        <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {roomInfoOpen ? "Room Info -" : "Room Info +"}
        </Text>
      </Pressable>

      {roomInfoOpen ? (
        <View style={{ gap: 10 }}>
          <InfoPlaque title="About This Table" body="A gentle space to vent, release, and be heard without judgment. We listen. We support. We hold space." />
          <InfoPlaque title="Table Etiquette" body="Be kind and respectful. No fixing, just listening. Take what you need and leave what you do not." />
          <InfoPlaque title="Tools & Support" body="Crisis resources and report tools remain close by when you need them." />
          <Pressable accessibilityLabel="Rest on the Bench" accessibilityRole="button" style={quietButton}>
            <Text selectable={false} style={quietButtonText}>
              Rest on the Bench
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {quickActions.map((action) => (
          <Pressable key={action} accessibilityLabel={action} accessibilityRole="button" style={actionPill}>
            <Text selectable={false} style={actionText}>
              {action}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ alignItems: "center", flexDirection: "row", gap: 10, width: "100%" }}>
        <TextInput
          accessibilityLabel="Tea Room message"
          onChangeText={setDraft}
          placeholder="Share from the heart..."
          placeholderTextColor={meadowTheme.colors.mutedInk}
          style={{
            backgroundColor: meadowTheme.colors.panel,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.control,
            borderWidth: 1,
            color: meadowTheme.colors.ink,
            flex: 1,
            fontFamily: meadowTheme.fonts.body,
            fontSize: 14,
            minHeight: 48,
            paddingHorizontal: 16,
          }}
          value={draft}
        />
        <Pressable
          accessibilityLabel="Send Tea Room message"
          accessibilityRole="button"
          disabled={!draft.trim()}
          onPress={send}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: draft.trim() ? meadowTheme.colors.sage : meadowTheme.colors.fog,
            borderRadius: meadowTheme.radius.control,
            height: 48,
            justifyContent: "center",
            opacity: pressed ? 0.78 : 1,
            width: 56,
          })}
        >
          <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            Send
          </Text>
        </Pressable>
      </View>
      {warning ? (
        <Text selectable style={{ color: meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
          {warning}
        </Text>
      ) : null}
      <SafetyBar contentId={`tea-room-${roomBlend}`} contentType="message" />
      <CrisisSupportCard visible={crisisOpen} onClose={() => setCrisisOpen(false)} />
      <SuccessFlash message={flash} onDone={() => setFlash(null)} />
    </ScrollView>
  );
}

function TeaRoomSkeletons() {
  return (
    <View accessibilityLabel="The Tea Room is restoring messages" style={{ gap: 10 }}>
      {[44, 60, 44, 60].map((height, index) => (
        <SkeletonBox
          key={`${height}-${index}`}
          height={height}
          width={index % 2 === 0 ? "74%" : "84%"}
          style={{ alignSelf: index % 2 === 0 ? "flex-start" : "flex-end", borderRadius: 12 }}
        />
      ))}
    </View>
  );
}

function RoomHeader({ title }: { title: string }) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
      <Pressable accessibilityLabel="Back to The Hearth" accessibilityRole="button" hitSlop={8} onPress={() => router.push("/hearth" as never)} style={{ width: 104 }}>
        <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {"<- The Hearth"}
        </Text>
      </Pressable>
      <Text selectable style={{ color: meadowTheme.colors.ink, flex: 1, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30, textAlign: "center" }}>
        {title}
      </Text>
      <View style={{ width: 104 }} />
    </View>
  );
}

function Pill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? meadowTheme.colors.sage : meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.control,
        borderWidth: 1,
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: 14,
        paddingVertical: 9,
      })}
    >
      <Text selectable={false} style={{ color: active ? meadowTheme.colors.linenDeep : meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function MessageBubble({ currentUserId, message }: { currentUserId?: string; message: TeaRoomMessage }) {
  const mine = Boolean(currentUserId && message.user_id === currentUserId);

  return (
    <View style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
      <View
        style={{
          backgroundColor: mine ? meadowTheme.colors.linenDeep : meadowTheme.colors.panel,
          borderColor: meadowTheme.colors.line,
          borderRadius: 12,
          borderWidth: 0.5,
          gap: 5,
          maxWidth: "94%",
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 16, lineHeight: 21 }}>
          {message.display_name}
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
          {message.content}
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17, textAlign: "right" }}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

function InfoPlaque({ body, title }: { body: string; title: string }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 6, padding: 14 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 23, textAlign: "center" }}>
        {title}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
        {body}
      </Text>
    </View>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 8, padding: 16 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25, textAlign: "center" }}>
        {title}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
        {body}
      </Text>
    </View>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

const introText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  fontStyle: "italic" as const,
  lineHeight: 21,
  textAlign: "center" as const,
};

const actionPill = {
  backgroundColor: meadowTheme.colors.panel,
  borderColor: meadowTheme.colors.line,
  borderRadius: meadowTheme.radius.control,
  borderWidth: 1,
  paddingHorizontal: 14,
  paddingVertical: 9,
};

const actionText = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  lineHeight: 20,
};

const quietButton = {
  alignItems: "center" as const,
  backgroundColor: meadowTheme.colors.sage,
  borderRadius: meadowTheme.radius.panel,
  minHeight: 48,
  justifyContent: "center" as const,
};

const quietButtonText = {
  color: meadowTheme.colors.linenDeep,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  lineHeight: 20,
};
