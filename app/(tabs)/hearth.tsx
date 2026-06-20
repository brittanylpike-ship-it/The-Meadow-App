import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect, router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { PressCard } from "@/components/PressCard";
import { MeadowDivider } from "@/components/meadow-screen";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { getHearthStatus } from "@/features/memory/hearth-status.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";

const hearthImage = require("@/assets/illustrations/hearth-panels.png");

const rooms = [
  {
    title: "Tea Rooms",
    subtitle: "A quiet place to talk, vent, and be heard.",
    route: "/tea-rooms",
    marker: "01",
  },
  {
    title: "The Greenhouse",
    subtitle: "Guided healing circles with a host. Reserve your seat.",
    route: "/greenhouse",
    marker: "02",
  },
  {
    title: "The Post Office",
    subtitle: "Write letters. Read letters. Leave a seal of kindness.",
    route: "/post-office",
    marker: "03",
  },
  {
    title: "The Courtyard",
    subtitle: "An open garden where the community gathers.",
    route: "/courtyard",
    marker: "04",
  },
] as const;

export default function HearthScreen() {
  const { user, loading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  const status = getHearthStatus(meadow.state, meadow.syncSummary);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 18, padding: 18, paddingBottom: 120 }}
    >
      <View style={{ gap: 8, paddingTop: 6 }}>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 32, lineHeight: 39, textAlign: "center" }}>
          The Hearth
        </Text>
        <MeadowDivider />
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
          You are not alone here. Come as you are.
        </Text>
      </View>

      <Image
        source={hearthImage}
        style={{ backgroundColor: meadowTheme.colors.panel, borderRadius: meadowTheme.radius.panel, height: 200, width: "100%" }}
        contentFit="cover"
        accessibilityLabel="A storybook Hearth with four community room panels"
      />

      {loading || meadow.loading ? (
        <ActivityIndicator accessibilityLabel="The Meadow is restoring the Hearth" color={meadowTheme.colors.sageDeep} />
      ) : (
        <View
          style={{
            backgroundColor: meadowTheme.colors.panel,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.panel,
            borderWidth: 1,
            gap: 8,
            padding: 14,
          }}
        >
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25, textAlign: "center" }}>
            {status.title}
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
            {status.body}
          </Text>
        </View>
      )}

      <View style={{ gap: 12 }}>
        {rooms.map((room) => (
          <PressCard
            key={room.route}
            accessibilityLabel={room.title}
            accessibilityHint={`Enter ${room.title}.`}
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => router.push(room.route as never)}
            style={{
              backgroundColor: meadowTheme.colors.panel,
              borderColor: meadowTheme.colors.line,
              borderRadius: 12,
              borderWidth: 0.5,
              flexDirection: "row",
              gap: 14,
              padding: 16,
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: meadowTheme.colors.linenDeep,
                borderColor: meadowTheme.colors.line,
                borderRadius: meadowTheme.radius.control,
                borderWidth: 1,
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              <Text selectable={false} style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 22 }}>
                {room.marker}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25 }}>
                {room.title}
              </Text>
              <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
                {room.subtitle}
              </Text>
            </View>
            <Text selectable={false} style={{ alignSelf: "center", color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
              {"Enter ->"}
            </Text>
          </PressCard>
        ))}
      </View>
    </ScrollView>
  );
}
