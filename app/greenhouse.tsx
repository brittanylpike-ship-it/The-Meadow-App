import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect, router } from "expo-router";
import React from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { PressCard } from "@/components/PressCard";
import { SubscriberGate } from "@/components/Hearth/Greenhouse/SubscriberGate";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { SuccessFlash } from "@/components/SuccessFlash";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { HealingCircle, HealingCircleStatus, useHealingCircles } from "@/hooks/useHealingCircles";
import { useSubscription } from "@/hooks/useSubscription";

const greenhouseImage = require("@/assets/illustrations/greenhouse.png");

const filters = ["all", "live", "open", "full"] as const;
type GreenhouseFilter = (typeof filters)[number];

const navigationPills = ["Healing Circles", "Guided Workshops", "Upcoming Gatherings", "Past Gatherings", "Resource Library", "Ask a Guide"] as const;
const stats = [
  { label: "Upcoming Gatherings", value: "5" },
  { label: "Circles This Week", value: "3" },
  { label: "Workshops This Month", value: "7" },
  { label: "Community Growing", value: "286" },
] as const;

export default function GreenhouseScreen() {
  const { user, loading } = useAuth();
  const subscription = useSubscription();
  const { circles, userRegistrations, loading: circlesLoading, refresh, registerForCircle } = useHealingCircles();
  const [filter, setFilter] = React.useState<GreenhouseFilter>("all");
  const [refreshing, setRefreshing] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  const filteredCircles = circles.filter((circle) => filter === "all" || circle.status === filter);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleReserve(circleId: string) {
    await registerForCircle(circleId);
    setFlash("Seat reserved.");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[meadowTheme.colors.sage]} refreshing={refreshing} tintColor={meadowTheme.colors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 16, padding: 18, paddingBottom: 120 }}
    >
      <RoomHeader title="The Greenhouse" />
      <Image
        source={greenhouseImage}
        style={{ backgroundColor: meadowTheme.colors.panel, borderRadius: meadowTheme.radius.panel, height: 200, width: "100%" }}
        contentFit="cover"
        accessibilityLabel="A storybook greenhouse sanctuary"
      />
      <Text selectable style={introText}>
        A sanctuary for healing circles, guided workshops, and meaningful community growth.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {navigationPills.map((item) => (
          <Pressable key={item} accessibilityLabel={item} accessibilityRole="button" style={navPill}>
            <Text selectable={false} style={navPillText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {subscription.isSubscriber ? (
        <InfoPlaque title="Subscriber Sanctuary" body="This space is for subscribers. Thank you for being part of this circle." buttonLabel="Learn More" />
      ) : (
        <SubscriberGate />
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {stats.map((stat) => (
          <View key={stat.label} style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 4, minHeight: 92, padding: 12, width: "48%" }}>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 28, lineHeight: 32, textAlign: "center" }}>
              {stat.value}
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 19, textAlign: "center" }}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map((item) => (
          <Pill key={item} active={item === filter} label={labelForFilter(item)} onPress={() => setFilter(item)} />
        ))}
      </ScrollView>

      {circlesLoading ? (
        <GreenhouseSkeletons />
      ) : (
        <View style={{ gap: 12, width: "100%" }}>
          {filteredCircles.map((circle) => (
            <CircleCard
              key={circle.id}
              circle={circle}
              reserved={userRegistrations.includes(circle.id)}
              onReserve={() => void handleReserve(circle.id)}
            />
          ))}
        </View>
      )}

      <InfoPlaque title="Today in the Greenhouse" body="Anxiety & Overwhelm Circle, Evening Meditation with Sage, and Journaling Together are gathered here for the day." />
      <InfoPlaque title="Featured Workshop" body="Tools for Emotional Regulation with Sage Willow. A guided space to breathe, name, and steady what is here." buttonLabel="Reserve a Seat" />
      <InfoPlaque title="In the Sanctuary" body="You have full access to circles, workshops, and resources in the Greenhouse." />
      <InfoPlaque title="Garden Progress" body="Together we bloom. The garden grows as people show up with care." />
      <InfoPlaque title="Community Garden" body="A shared place to see what has been watered, tended, and held by the circle." buttonLabel="View Garden" />
      <InfoPlaque title="Water Reminder" body="You are safe here. You are seen here. You belong here." buttonLabel="Water Now" />
      <SuccessFlash message={flash} onDone={() => setFlash(null)} />
    </ScrollView>
  );
}

function CircleCard({ circle, onReserve, reserved }: { circle: HealingCircle; onReserve: () => void; reserved: boolean }) {
  const disabled = circle.status === "full" || reserved;
  const seatsRemaining = Math.max(circle.max_seats - circle.current_seats, 0);

  return (
    <PressCard
      accessibilityLabel={circle.title}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onReserve}
      style={{
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.panel,
        borderWidth: 1,
        gap: 9,
        padding: 14,
        width: "100%",
      }}
    >
      <View style={{ gap: 4 }}>
        <Text selectable style={{ color: statusColor(circle.status), fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
          {statusLabel(circle.status)}
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
          {seatsRemaining} seats open
        </Text>
      </View>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25 }}>
        {circle.title}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21 }}>
        Hosted by {circle.host_name}
      </Text>
      <Text selectable numberOfLines={3} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
        {circle.description}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
        {formatDateTime(circle.scheduled_at)} - {circle.duration_minutes} min
      </Text>
      <Pressable
        accessibilityLabel={buttonLabel(circle.status, reserved)}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onReserve}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: disabled ? meadowTheme.colors.panelDeep : meadowTheme.colors.sage,
          borderColor: meadowTheme.colors.sage,
          borderRadius: meadowTheme.radius.panel,
          borderWidth: reserved ? 1 : 0,
          minHeight: 46,
          justifyContent: "center",
          opacity: pressed ? 0.78 : 1,
        })}
      >
        <Text selectable={false} style={{ color: disabled ? meadowTheme.colors.sage : meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {buttonLabel(circle.status, reserved)}
        </Text>
      </Pressable>
    </PressCard>
  );
}

function GreenhouseSkeletons() {
  return (
    <View accessibilityLabel="The Greenhouse is restoring circles" style={{ gap: 12 }}>
      {[0, 1, 2].map((index) => (
        <View key={index} style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: 12, borderWidth: 1, padding: 14 }}>
          <SkeletonBox height={120} width="100%" />
        </View>
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
    <Pressable accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={{ backgroundColor: active ? meadowTheme.colors.sage : meadowTheme.colors.panel, borderColor: meadowTheme.colors.sage, borderRadius: meadowTheme.radius.control, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 }}>
      <Text selectable={false} style={{ color: active ? meadowTheme.colors.linenDeep : meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function InfoPlaque({ body, buttonLabel, title }: { body: string; buttonLabel?: string; title: string }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 8, padding: 14, width: "100%" }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 23, textAlign: "center" }}>
        {title}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
        {body}
      </Text>
      {buttonLabel ? (
        <Pressable accessibilityLabel={buttonLabel} accessibilityRole="button" style={{ alignItems: "center", alignSelf: "center", backgroundColor: meadowTheme.colors.sage, borderRadius: meadowTheme.radius.control, minHeight: 40, justifyContent: "center", paddingHorizontal: 18 }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            {buttonLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function buttonLabel(status: HealingCircleStatus, reserved: boolean) {
  if (reserved) return "Seat Reserved";
  if (status === "live") return "Join Circle ->";
  if (status === "full") return "Circle is Full";
  return "Reserve My Seat ->";
}

function labelForFilter(filter: GreenhouseFilter) {
  if (filter === "all") return "All Circles";
  if (filter === "live") return "In Progress";
  if (filter === "open") return "Open to Join";
  return "Completed";
}

function statusLabel(status: HealingCircleStatus) {
  if (status === "live") return "LIVE NOW";
  if (status === "full") return "FULL";
  return "UPCOMING";
}

function statusColor(status: HealingCircleStatus) {
  if (status === "live") return meadowTheme.colors.clay;
  if (status === "full") return meadowTheme.colors.mutedInk;
  return meadowTheme.colors.sage;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

const introText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  fontStyle: "italic" as const,
  lineHeight: 21,
  textAlign: "center" as const,
};

const navPill = {
  backgroundColor: meadowTheme.colors.panel,
  borderColor: meadowTheme.colors.line,
  borderRadius: meadowTheme.radius.control,
  borderWidth: 1,
  paddingHorizontal: 14,
  paddingVertical: 9,
};

const navPillText = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  lineHeight: 20,
};
