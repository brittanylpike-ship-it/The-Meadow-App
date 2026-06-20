import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import type { ModerationLogRow, ReportContentType, ReportRow } from "@/lib/supabase/schema";
import { sendModerationAlert } from "@/services/moderationService";
import { hasSupabaseConfig, supabase } from "@/services/supabase";
import { Redirect, router } from "expo-router";
import React from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

type QueueItem = ModerationLogRow & {
  author_display_name?: string | null;
};

type UserReportItem = ReportRow & {
  content_text?: string | null;
  author_id?: string | null;
};

export default function ModerationQueueScreen() {
  const { user, loading } = useAuth();
  const subscription = useSubscription();
  const [isKeeper, setIsKeeper] = React.useState(false);
  const [checkingRole, setCheckingRole] = React.useState(true);
  const [queue, setQueue] = React.useState<QueueItem[]>([]);
  const [reports, setReports] = React.useState<UserReportItem[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function checkRole() {
      if (!hasSupabaseConfig || !supabase) {
        setIsKeeper(user?.email === "creator@qa.local");
        setCheckingRole(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const role = data.session?.user?.app_metadata?.role;
      if (mounted) {
        setIsKeeper(role === "meadow_keeper");
        setCheckingRole(false);
      }
    }

    void checkRole();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const canReview = Boolean(user && isKeeper && (subscription.isSubscriber || user.email === "creator@qa.local"));

  const refresh = React.useCallback(async () => {
    if (!hasSupabaseConfig || !supabase || !canReview) {
      setQueue([]);
      setReports([]);
      return;
    }

    const [moderationResult, reportsResult] = await Promise.all([
      supabase
        .from("moderation_log")
        .select("id,content_id,content_type,content_text,flag_level,ai_reason,author_id,reviewed,reviewed_by,reviewed_at,action_taken,created_at")
        .eq("reviewed", false)
        .order("created_at", { ascending: true }),
      supabase.from("reports").select("id,reporter_id,content_type,content_id,reason,created_at,reviewed").eq("reviewed", false).order("created_at", { ascending: true }),
    ]);

    if (moderationResult.error) {
      throw moderationResult.error;
    }

    if (reportsResult.error) {
      throw reportsResult.error;
    }

    setQueue((moderationResult.data ?? []) as QueueItem[]);
    setReports((reportsResult.data ?? []) as UserReportItem[]);
  }, [canReview]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  async function approve(item: QueueItem | UserReportItem) {
    if (!hasSupabaseConfig || !supabase || !user) return;

    await updateContentVisibility(item.content_type, item.content_id, { flagged: false });
    await markReviewed(item.id, user.id, "approved", isModerationLog(item));
    await refresh();
  }

  async function remove(item: QueueItem | UserReportItem) {
    if (!hasSupabaseConfig || !supabase || !user) return;

    await updateContentVisibility(item.content_type, item.content_id, { is_deleted: true });
    await markReviewed(item.id, user.id, "removed", isModerationLog(item));
    await refresh();
  }

  async function escalate(item: QueueItem | UserReportItem) {
    if (!hasSupabaseConfig || !supabase || !user) return;

    await sendModerationAlert({
      authorId: "author_id" in item ? item.author_id : null,
      contentText: "content_text" in item && item.content_text ? item.content_text : `Reported ${item.content_type}: ${item.content_id}`,
      flagLevel: "flag_level" in item ? item.flag_level : "user_report",
      reason: "ai_reason" in item ? item.ai_reason : item.reason,
      timestamp: item.created_at,
    });
    await markReviewed(item.id, user.id, "escalated", isModerationLog(item));
    await refresh();
  }

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  if (!checkingRole && !subscription.isLoading && !canReview) {
    return <Redirect href="/hearth" />;
  }

  const pendingCount = queue.length + reports.length;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[meadowTheme.colors.sage]} refreshing={refreshing} tintColor={meadowTheme.colors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 16, padding: 18, paddingBottom: 120 }}
    >
      <RoomHeader />
      <View style={headerPlaque}>
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 26, textAlign: "center" }}>
          Moderation Queue
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
          {pendingCount} items awaiting review
        </Text>
      </View>

      {queue.length ? (
        queue.map((item) => (
          <QueueCard key={item.id} item={item} onApprove={() => void approve(item)} onEscalate={() => void escalate(item)} onRemove={() => void remove(item)} />
        ))
      ) : (
        <EmptyQueue />
      )}

      <Text selectable style={sectionLabel}>
        USER REPORTS
      </Text>
      {reports.length ? (
        reports.map((item) => (
          <ReportCard key={item.id} item={item} onApprove={() => void approve(item)} onEscalate={() => void escalate(item)} onRemove={() => void remove(item)} />
        ))
      ) : (
        <Text selectable style={quietText}>
          No user reports are waiting.
        </Text>
      )}
    </ScrollView>
  );
}

function QueueCard({ item, onApprove, onEscalate, onRemove }: { item: QueueItem; onApprove: () => void; onEscalate: () => void; onRemove: () => void }) {
  return (
    <View style={cardStyle}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Badge label={labelForContentType(item.content_type)} />
        <Badge label={item.flag_level === "soft_flag" ? "SOFT FLAG" : item.flag_level.toUpperCase()} tone={item.flag_level === "crisis" ? "crisis" : "soft"} />
      </View>
      <Text selectable style={contentText}>
        {item.content_text}
      </Text>
      <Text selectable style={reasonText}>
        {item.ai_reason}
      </Text>
      <Text selectable style={quietText}>
        {formatDate(item.created_at)} - {item.author_display_name ?? item.author_id}
      </Text>
      <ActionRow onApprove={onApprove} onEscalate={onEscalate} onRemove={onRemove} />
    </View>
  );
}

function ReportCard({ item, onApprove, onEscalate, onRemove }: { item: UserReportItem; onApprove: () => void; onEscalate: () => void; onRemove: () => void }) {
  return (
    <View style={cardStyle}>
      <Badge label={labelForContentType(item.content_type)} />
      <Text selectable style={contentText}>
        {item.content_text ?? `Reported content id: ${item.content_id}`}
      </Text>
      <Text selectable style={reasonText}>
        {item.reason}
      </Text>
      <Text selectable style={quietText}>
        {formatDate(item.created_at)}
      </Text>
      <ActionRow onApprove={onApprove} onEscalate={onEscalate} onRemove={onRemove} />
    </View>
  );
}

function ActionRow({ onApprove, onEscalate, onRemove }: { onApprove: () => void; onEscalate: () => void; onRemove: () => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <ActionButton label="Approve" onPress={onApprove} />
      <ActionButton label="Remove" onPress={onRemove} />
      <ActionButton label="Escalate" onPress={onEscalate} />
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.control,
        minHeight: 42,
        justifyContent: "center",
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: 14,
      })}
    >
      <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "soft" | "crisis" }) {
  const color = tone === "crisis" ? meadowTheme.colors.lavender : tone === "soft" ? meadowTheme.colors.clay : meadowTheme.colors.sage;
  return (
    <View style={{ backgroundColor: meadowTheme.colors.linenDeep, borderColor: color, borderRadius: meadowTheme.radius.control, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text selectable={false} style={{ color, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
        {label}
      </Text>
    </View>
  );
}

function EmptyQueue() {
  return (
    <View style={cardStyle}>
      <Text selectable style={contentText}>
        The queue is quiet.
      </Text>
      <Text selectable style={quietText}>
        Nothing is waiting for review right now.
      </Text>
    </View>
  );
}

function RoomHeader() {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
      <Pressable accessibilityLabel="Back to The Hearth" accessibilityRole="button" hitSlop={8} onPress={() => router.push("/hearth" as never)} style={{ width: 104 }}>
        <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {"<- The Hearth"}
        </Text>
      </Pressable>
      <View style={{ flex: 1 }} />
      <View style={{ width: 104 }} />
    </View>
  );
}

async function updateContentVisibility(contentType: ReportContentType, contentId: string | null, patch: Record<string, boolean>) {
  if (!hasSupabaseConfig || !supabase || !contentId) return;

  const table = tableForContentType(contentType);
  const { error } = await supabase.from(table).update(patch).eq("id", contentId);
  if (error) {
    Alert.alert("This item could not be updated yet.");
    throw error;
  }
}

async function markReviewed(id: string, reviewerId: string, action: "approved" | "removed" | "escalated", moderationLog: boolean) {
  if (!hasSupabaseConfig || !supabase) return;

  const table = moderationLog ? "moderation_log" : "reports";
  const patch = moderationLog
    ? { action_taken: action, reviewed: true, reviewed_at: new Date().toISOString(), reviewed_by: reviewerId }
    : { reviewed: true };
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) {
    Alert.alert("This review could not be saved yet.");
    throw error;
  }
}

function tableForContentType(contentType: ReportContentType) {
  if (contentType === "letter" || contentType === "post") return "hearth_posts";
  if (contentType === "message") return "tea_room_messages";
  return "hearth_replies";
}

function isModerationLog(item: QueueItem | UserReportItem): item is QueueItem {
  return "flag_level" in item;
}

function labelForContentType(contentType: ReportContentType) {
  if (contentType === "letter") return "Letter";
  if (contentType === "message") return "Message";
  if (contentType === "post") return "Post";
  return "Comment";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

const headerPlaque = {
  backgroundColor: meadowTheme.colors.panel,
  borderColor: meadowTheme.colors.line,
  borderRadius: meadowTheme.radius.panel,
  borderWidth: 1,
  gap: 6,
  padding: 16,
} as const;

const cardStyle = {
  backgroundColor: meadowTheme.colors.panel,
  borderColor: meadowTheme.colors.line,
  borderRadius: meadowTheme.radius.panel,
  borderWidth: 1,
  gap: 10,
  padding: 14,
} as const;

const contentText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 15,
  lineHeight: 23,
} as const;

const reasonText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  fontStyle: "italic",
  lineHeight: 18,
} as const;

const quietText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  lineHeight: 18,
} as const;

const sectionLabel = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  letterSpacing: 1,
  lineHeight: 18,
  textAlign: "center",
} as const;
