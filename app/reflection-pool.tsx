import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect, router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { MeadowDivider } from "@/components/meadow-screen";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { useMemoryGarden } from "@/hooks/useMemoryGarden";

const reflectionPoolImage = require("@/assets/illustrations/reflection-pool-thumb.png");

const activities = ["Skip a Stone", "Float a Leaf Boat", "Still Water"] as const;
type ReflectionActivity = (typeof activities)[number];

const activityCopy: Record<
  Exclude<ReflectionActivity, "Still Water">,
  {
    prompt: string;
    placeholder: string;
    button: string;
    confirmation: string;
  }
> = {
  "Skip a Stone": {
    prompt: "What is weighing on you right now? Write it here. Then let it go.",
    placeholder: "A worry. A name. A feeling.",
    button: "Skip the Stone ->",
    confirmation: "The stone has crossed the water.\nIt carries what you gave it.\nThe pond remembers, so you don't have to.",
  },
  "Float a Leaf Boat": {
    prompt: "Write something you are ready to release. Name it, then let the current take it.",
    placeholder: "Something I am ready to release...",
    button: "Set It Afloat ->",
    confirmation: "Your leaf boat is floating.\nWhatever you placed inside it\nis moving gently downstream.",
  },
};

export default function ReflectionPoolScreen() {
  const { user, loading } = useAuth();
  const { entries, loading: memoryLoading, refresh, addEntry } = useMemoryGarden("note");
  const [activity, setActivity] = React.useState<ReflectionActivity>("Skip a Stone");
  const [releaseText, setReleaseText] = React.useState("");
  const [confirmation, setConfirmation] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!confirmation) {
      return;
    }

    const timeout = setTimeout(() => setConfirmation(null), 3000);
    return () => clearTimeout(timeout);
  }, [confirmation]);

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  const releaseActivity = activity === "Still Water" ? null : activityCopy[activity];

  async function saveRelease() {
    if (!releaseActivity || !releaseText.trim()) {
      return;
    }

    await addEntry({ type: "note", content: releaseText.trim(), caption: activity });
    setReleaseText("");
    setConfirmation(releaseActivity.confirmation);
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[meadowTheme.colors.sage]} refreshing={refreshing} tintColor={meadowTheme.colors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 18, paddingBottom: 112 }}
    >
      <View style={{ gap: 14, paddingHorizontal: 18, paddingTop: 16 }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
          <Pressable
            accessibilityLabel="Back to Memory Garden"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/memory-garden" as never)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
              paddingVertical: 6,
              width: 104,
            })}
          >
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
              {"<- Memory Garden"}
            </Text>
          </Pressable>
          <Text selectable style={{ color: meadowTheme.colors.ink, flex: 1, fontFamily: meadowTheme.fonts.header, fontSize: 26, lineHeight: 31, textAlign: "center" }}>
            The Reflection Pool
          </Text>
          <View style={{ width: 104 }} />
        </View>

        <Image
          source={reflectionPoolImage}
          style={{ backgroundColor: meadowTheme.colors.linen, borderRadius: meadowTheme.radius.panel, height: 240, width: "100%" }}
          contentFit="cover"
          accessibilityLabel="A willow-edged watercolor pond for the Reflection Pool"
        />

        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, paddingHorizontal: 24, textAlign: "center" }}>
          Come here to move what's been still.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", paddingHorizontal: 18 }}>
        {activities.map((item) => {
          const active = item === activity;
          return (
            <Pressable
              key={item}
              accessibilityLabel={item}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setActivity(item);
                setConfirmation(null);
              }}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: active ? meadowTheme.colors.sage : meadowTheme.colors.panel,
                borderColor: meadowTheme.colors.sage,
                borderRadius: meadowTheme.radius.control,
                borderWidth: 1,
                minHeight: 42,
                justifyContent: "center",
                opacity: pressed ? 0.78 : 1,
                paddingHorizontal: 8,
                width: "31%",
              })}
            >
              <Text selectable={false} style={{ color: active ? meadowTheme.colors.linenDeep : meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 17, textAlign: "center" }}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        {activity === "Still Water" ? (
          <View
            style={{
              backgroundColor: meadowTheme.colors.panel,
              borderColor: meadowTheme.colors.line,
              borderRadius: meadowTheme.radius.panel,
              borderWidth: 1,
              gap: 14,
              padding: 18,
            }}
          >
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 27, textAlign: "center" }}>
              A moment of stillness.
            </Text>
            {["Breathe in for 4 counts.", "Hold for 4 counts.", "Breathe out for 6 counts."].map((step) => (
              <Text key={step} selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
                {step}
              </Text>
            ))}
            <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
              Repeat as many times as feels right.
            </Text>
            <MeadowButton label="I am ready to return ->" onPress={() => router.push("/memory-garden" as never)} />
          </View>
        ) : confirmation ? (
          <View
            style={{
              backgroundColor: meadowTheme.colors.panel,
              borderColor: meadowTheme.colors.line,
              borderRadius: meadowTheme.radius.panel,
              borderWidth: 1,
              gap: 14,
              padding: 18,
            }}
          >
            <MeadowDivider />
            <Text selectable style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15, fontStyle: "italic", lineHeight: 24, textAlign: "center" }}>
              {confirmation}
            </Text>
            <MeadowDivider />
            <Pressable accessibilityLabel="Throw Another" accessibilityRole="button" onPress={() => setConfirmation(null)} style={({ pressed }) => ({ alignSelf: "center", opacity: pressed ? 0.72 : 1, padding: 8 })}>
              <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
                Throw Another
              </Text>
            </Pressable>
          </View>
        ) : releaseActivity ? (
          <View style={{ gap: 14 }}>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 15, fontStyle: "italic", lineHeight: 22, textAlign: "center" }}>
              {releaseActivity.prompt}
            </Text>
            <TextInput
              accessibilityLabel={`${activity} release words`}
              multiline
              onChangeText={setReleaseText}
              placeholder={releaseActivity.placeholder}
              placeholderTextColor={meadowTheme.colors.mutedInk}
              style={{
                backgroundColor: meadowTheme.colors.panel,
                borderColor: meadowTheme.colors.line,
                borderRadius: meadowTheme.radius.panel,
                borderWidth: 1,
                color: meadowTheme.colors.ink,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 14,
                lineHeight: 21,
                minHeight: 108,
                padding: 14,
                textAlignVertical: "top",
              }}
              value={releaseText}
            />
            <MeadowButton label={releaseActivity.button} onPress={saveRelease} disabled={!releaseText.trim()} />
          </View>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        <MeadowDivider />
      </View>

      <View style={{ gap: 10, paddingHorizontal: 18 }}>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 23 }}>
          What You've Released
        </Text>
        {memoryLoading ? (
          <ActivityIndicator accessibilityLabel="The Reflection Pool is restoring released memories" color={meadowTheme.colors.sageDeep} />
        ) : entries.length ? (
          entries.slice(0, 5).map((entry) => (
            <View key={entry.id} style={{ borderBottomColor: meadowTheme.colors.line, borderBottomWidth: 1, gap: 4, paddingVertical: 10 }}>
              <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
                {formatDate(entry.created_at)}
              </Text>
              <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19 }}>
                {preview(entry.content)}
              </Text>
            </View>
          ))
        ) : (
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20, paddingVertical: 12, textAlign: "center" }}>
            Nothing released yet. The pond is waiting.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function MeadowButton({ disabled, label, onPress }: { disabled?: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: disabled ? meadowTheme.colors.fog : meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.panel,
        justifyContent: "center",
        minHeight: 52,
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: 16,
      })}
    >
      <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function preview(content: string) {
  return content.length > 60 ? `${content.slice(0, 60)}...` : content;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
