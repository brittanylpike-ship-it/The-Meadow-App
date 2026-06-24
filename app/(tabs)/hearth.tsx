import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect, router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { PressCard } from "@/components/PressCard";
import { MeadowDivider } from "@/components/meadow-screen";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { getHearthStatus } from "@/features/memory/hearth-status.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";
import { useSubscription } from "@/hooks/useSubscription";
import { getHearthPriceLine, startHearthSubscriptionPurchase } from "@/services/subscriptionService";

const hearthImage = require("@/assets/illustrations/hearth-panels.png");
const greenhouseImage = require("@/assets/illustrations/greenhouse.png");

const rooms = [
  {
    bullets: ["Live conversations", "Gentle tea tables", "Real companionship"],
    title: "Tea Rooms",
    subtitle: "A quiet place to talk, vent, and be heard.",
    route: "/tea-rooms",
    marker: "01",
  },
  {
    bullets: ["Healing circles", "Guided workshops", "Shared growth"],
    title: "The Greenhouse",
    subtitle: "Guided healing circles with a host. Reserve your seat.",
    route: "/greenhouse",
    marker: "02",
  },
  {
    bullets: ["Letters", "Seals", "Thoughtful replies"],
    title: "The Post Office",
    subtitle: "Write letters. Read letters. Leave a seal of kindness.",
    route: "/post-office",
    marker: "03",
  },
  {
    bullets: ["Milestones", "Kindness posts", "Shared gathering"],
    title: "The Courtyard",
    subtitle: "An open garden where the community gathers.",
    route: "/courtyard",
    marker: "04",
  },
] as const;

export default function HearthScreen() {
  const { user, loading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const subscription = useSubscription();

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

      {loading || meadow.loading || subscription.isLoading ? (
        <HearthSkeleton />
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
          <HearthRoomCard key={room.route} locked={!subscription.isSubscriber} room={room} />
        ))}
      </View>

      {!subscription.isSubscriber ? <HearthSubscriptionCard priceLine={getHearthPriceLine(subscription)} /> : null}
    </ScrollView>
  );
}

function HearthSkeleton() {
  return (
    <View accessibilityLabel="The Meadow is restoring the Hearth" style={{ gap: 12 }}>
      {[0, 1, 2, 3].map((index) => (
        <View key={index} style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: 12, borderWidth: 1, padding: 12 }}>
          <SkeletonBox height={200} width="100%" />
        </View>
      ))}
    </View>
  );
}

function HearthRoomCard({ locked, room }: { locked: boolean; room: (typeof rooms)[number] }) {
  return (
    <View style={{ gap: 8 }}>
      <PressCard
        accessibilityLabel={locked ? `${room.title} locked` : room.title}
        accessibilityHint={locked ? "Join The Hearth to enter this space." : `Enter ${room.title}.`}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        disabled={locked}
        hitSlop={6}
        onPress={() => router.push(room.route as never)}
        style={{
          backgroundColor: meadowTheme.colors.panel,
          borderColor: meadowTheme.colors.line,
          borderRadius: 12,
          borderWidth: 0.5,
          flexDirection: "row",
          gap: 14,
          opacity: locked ? 0.5 : 1,
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
        {locked ? (
          <Text selectable={false} style={{ alignSelf: "flex-start", color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            {"\uD83D\uDD12"}
          </Text>
        ) : (
          <Text selectable={false} style={{ alignSelf: "center", color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            {"Enter ->"}
          </Text>
        )}
      </PressCard>
      {locked ? (
        <View style={{ gap: 3, paddingHorizontal: 8 }}>
          {room.bullets.map((bullet) => (
            <Text key={bullet} selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
              {bullet}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function HearthSubscriptionCard({ priceLine }: { priceLine: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: meadowTheme.colors.subscriptionPanel,
        borderColor: meadowTheme.colors.sage,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 12,
        padding: 24,
      }}
    >
      <Image
        source={greenhouseImage}
        style={{ backgroundColor: meadowTheme.colors.panel, borderRadius: 24, height: 48, width: 48 }}
        contentFit="cover"
        accessibilityLabel="A small Greenhouse illustration"
      />
      <Text selectable style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 26, textAlign: "center" }}>
        The Hearth is for subscribers.
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 22, textAlign: "center" }}>
        The Post Office. Tea Rooms. The Greenhouse. The Courtyard. All four spaces. One subscription.
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.header, fontSize: 16, lineHeight: 22, textAlign: "center" }}>
        {priceLine}
      </Text>
      <Pressable
        accessibilityLabel="Join The Hearth"
        accessibilityRole="button"
        onPress={() => void startHearthSubscriptionPurchase()}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: meadowTheme.colors.sageDeep,
          borderRadius: 14,
          justifyContent: "center",
          minHeight: 52,
          opacity: pressed ? 0.78 : 1,
          width: "100%",
        })}
      >
        <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.header, fontSize: 15, lineHeight: 21 }}>
          {"Join The Hearth ->"}
        </Text>
      </Pressable>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, fontStyle: "italic", lineHeight: 18, textAlign: "center" }}>
        Cancel anytime through your App Store or Google Play account.
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, fontStyle: "italic", lineHeight: 18, textAlign: "center" }}>
        The Meadow is a wellness companion. The Hearth is its community. The rest of the app -- chapters, rituals, journal, companions -- is always free.
      </Text>
    </View>
  );
}
