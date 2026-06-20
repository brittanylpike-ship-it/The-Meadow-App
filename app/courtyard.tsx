import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect, router } from "expo-router";
import React from "react";
import { Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { PressCard } from "@/components/PressCard";
import { SafetyBar } from "@/components/Hearth/SafetyBar";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { SuccessFlash } from "@/components/SuccessFlash";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { HearthPost, useHearthPosts } from "@/hooks/useHearthPosts";

const courtyardImage = require("@/assets/illustrations/courtyard.png");
const categories = ["Introductions", "Celebrations", "Support & Questions", "Creative Corner", "Events & Meetups"] as const;
const composerTools = ["Photo", "Poll", "Feeling", "Milestone"] as const;
const quickActions = ["Ask a Question", "Share a Win", "Find a Friend", "Start a Poll", "Share a Resource"] as const;

export default function CourtyardScreen() {
  const { user, loading } = useAuth();
  const posts = useHearthPosts("courtyard");
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  function sendInlineReply() {
    setReplyingTo(null);
    setReplyDraft("");
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await posts.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSeal(postId: string) {
    await posts.addSeal(postId);
    setFlash("Seal left.");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[meadowTheme.colors.sage]} refreshing={refreshing} tintColor={meadowTheme.colors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 16, padding: 18, paddingBottom: 120 }}
    >
      <RoomHeader title="The Courtyard" />
      <Image
        source={courtyardImage}
        style={{ backgroundColor: meadowTheme.colors.panel, borderRadius: meadowTheme.radius.panel, height: 200, width: "100%" }}
        contentFit="cover"
        accessibilityLabel="A storybook courtyard garden at dusk"
      />
      <Text selectable style={introText}>
        Connect. Share. Belong.
      </Text>

      <InfoPlaque title="Daily Prompt" body="What is one small thing that brought you peace today?" buttonLabel="Share Your Answer ->" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {categories.map((category) => (
          <Pressable key={category} accessibilityLabel={category} accessibilityRole="button" style={pill}>
            <Text selectable={false} style={pillText}>
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        accessibilityLabel="Share with the Courtyard"
        accessibilityRole="button"
        onPress={() => setComposerOpen(true)}
        style={({ pressed }) => ({
          backgroundColor: meadowTheme.colors.panel,
          borderColor: meadowTheme.colors.line,
          borderRadius: meadowTheme.radius.panel,
          borderWidth: 1,
          gap: 10,
          opacity: pressed ? 0.82 : 1,
          padding: 14,
          width: "100%",
        })}
      >
        <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
          <View style={{ backgroundColor: meadowTheme.colors.linenDeep, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.control, borderWidth: 1, height: 42, width: 42 }} />
          <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, flex: 1, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
            Share something from your heart...
          </Text>
          <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            Post
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {composerTools.map((tool) => (
            <View key={tool} style={smallPill}>
              <Text selectable={false} style={smallPillText}>
                {tool}
              </Text>
            </View>
          ))}
        </ScrollView>
      </Pressable>

      {posts.loading ? (
        <FeedSkeleton label="The Courtyard is restoring posts" />
      ) : posts.posts.length ? (
        <View style={{ gap: 12 }}>
          {posts.posts.map((post) => (
            <View key={post.id} style={{ gap: 8 }}>
              <PostCard
                post={post}
                onReply={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                onSeal={() => void handleSeal(post.id)}
              />
              {replyingTo === post.id ? (
                <View style={{ alignItems: "center", flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
                  <TextInput
                    accessibilityLabel="Courtyard reply"
                    onChangeText={setReplyDraft}
                    placeholder="Leave a reply..."
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
                      minHeight: 44,
                      paddingHorizontal: 14,
                    }}
                    value={replyDraft}
                  />
                  <Pressable accessibilityLabel="Send Courtyard reply" accessibilityRole="button" onPress={sendInlineReply} style={{ alignItems: "center", backgroundColor: meadowTheme.colors.sage, borderRadius: meadowTheme.radius.control, height: 42, justifyContent: "center", width: 56 }}>
                    <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14 }}>
                      Send
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState title="The courtyard is still." body="Share something to begin the gathering." />
      )}

      <Pressable accessibilityLabel="Load More Posts" accessibilityRole="button" style={greenButton}>
        <Text selectable={false} style={greenButtonText}>
          Load More Posts
        </Text>
      </Pressable>

      <InfoPlaque title="Who's Here Now" body="Members are gathered in the courtyard. Some are speaking. Some are simply resting nearby." />
      <InfoPlaque title="Upcoming Events" body="Morning gratitude, evening tea, and journaling workshops are gathered here when you are ready." />
      <InfoPlaque title="Popular Topics" body="Boundaries, self care, anxiety support, daily gratitude, and being new here." />
      <InfoPlaque title="Featured Member" body="A quiet thank-you for someone holding space and spreading kindness every day." />
      <InfoPlaque title="Kindness Jar" body="Acts of kindness fill this jar. Together, we overflow." />
      <InfoPlaque title="Community Poll" body="A gentle place to answer what nourishes you right now." />
      <InfoPlaque title="Kindness Check-In" body="A small place to notice the care you gave and received today." />
      <InfoPlaque title="Tiny Joys" body="I drank water and took a breath." />
      <InfoPlaque title="Gratitude Wall" body="Notes of thanks are held here without pressure." />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {quickActions.map((action) => (
          <Pressable key={action} accessibilityLabel={action} accessibilityRole="button" style={quickActionButton}>
            <Text selectable={false} style={quickActionText}>
              {action}
            </Text>
          </Pressable>
        ))}
      </View>

      <InfoPlaque title="Courtyard Guidelines" body="Be kind and respectful. Speak from your own experience. No advice unless asked. Give grace and take space." />

      <SafetyBar contentId="courtyard" contentType="post" />

      <ComposePostModal visible={composerOpen} onCancel={() => setComposerOpen(false)} onSave={posts.addPost} />
      <SuccessFlash message={flash} onDone={() => setFlash(null)} />
    </ScrollView>
  );
}

function PostCard({ onReply, onSeal, post }: { onReply: () => void; onSeal: () => void; post: HearthPost }) {
  return (
    <PressCard accessibilityLabel={`${post.display_name} courtyard post`} accessibilityRole="button" style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 8, padding: 14, width: "100%" }}>
      <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 17, lineHeight: 22 }}>
        {post.display_name}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
        {post.content}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
        {formatDate(post.created_at)}
      </Text>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 14 }}>
        <Pressable accessibilityLabel="Leave a seal" accessibilityRole="button" onPress={onSeal} hitSlop={8}>
          <Text selectable={false} style={{ color: meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
            Seals {post.seal_count}
          </Text>
        </Pressable>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
          Replies {post.reply_count}
        </Text>
        <Pressable accessibilityLabel="Reply" accessibilityRole="button" onPress={onReply} hitSlop={8}>
          <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
            Reply
          </Text>
        </Pressable>
      </View>
    </PressCard>
  );
}

function FeedSkeleton({ label }: { label: string }) {
  return (
    <View accessibilityLabel={label} style={{ gap: 12 }}>
      {[0, 1, 2].map((index) => (
        <View key={index} style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: 12, borderWidth: 1, padding: 14 }}>
          <SkeletonBox height={100} width="100%" />
        </View>
      ))}
    </View>
  );
}

function ComposePostModal({
  onCancel,
  onSave,
  visible,
}: {
  onCancel: () => void;
  onSave: (input: { title?: string | null; content: string; category: string }) => Promise<HearthPost | null>;
  visible: boolean;
}) {
  const [content, setContent] = React.useState("");
  const remaining = 500 - content.length;

  async function save() {
    if (!content.trim() || remaining < 0) {
      return;
    }

    await onSave({ content, category: "general" });
    setContent("");
    onCancel();
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <Pressable style={{ backgroundColor: "rgba(59, 42, 26, 0.28)", flex: 1, justifyContent: "flex-end" }} onPress={onCancel}>
        <Pressable style={{ backgroundColor: meadowTheme.colors.linen, borderTopLeftRadius: 18, borderTopRightRadius: 18, gap: 12, padding: 20, paddingBottom: 34 }}>
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28, textAlign: "center" }}>
            Share with the Courtyard
          </Text>
          <TextInput
            accessibilityLabel="Courtyard post"
            multiline
            onChangeText={(value) => setContent(value.slice(0, 500))}
            placeholder="What's on your heart today?"
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
              minHeight: 150,
              padding: 14,
              textAlignVertical: "top",
            }}
            value={content}
          />
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17, textAlign: "right" }}>
            {remaining} left
          </Text>
          <Pressable accessibilityLabel="Post to the Courtyard" accessibilityRole="button" disabled={!content.trim()} onPress={save} style={{ alignItems: "center", backgroundColor: content.trim() ? meadowTheme.colors.sage : meadowTheme.colors.fog, borderRadius: meadowTheme.radius.panel, minHeight: 50, justifyContent: "center" }}>
            <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15 }}>
              {"Post to the Courtyard ->"}
            </Text>
          </Pressable>
          <Pressable accessibilityLabel="Cancel Courtyard post" accessibilityRole="button" onPress={onCancel} style={{ alignItems: "center", padding: 8 }}>
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14 }}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
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
        <Pressable accessibilityLabel={buttonLabel} accessibilityRole="button" style={greenButton}>
          <Text selectable={false} style={greenButtonText}>
            {buttonLabel}
          </Text>
        </Pressable>
      ) : null}
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

function formatDate(value: string) {
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

const pill = {
  backgroundColor: meadowTheme.colors.panel,
  borderColor: meadowTheme.colors.sage,
  borderRadius: meadowTheme.radius.control,
  borderWidth: 1,
  paddingHorizontal: 14,
  paddingVertical: 9,
};

const pillText = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  lineHeight: 20,
};

const smallPill = {
  backgroundColor: meadowTheme.colors.linenDeep,
  borderColor: meadowTheme.colors.line,
  borderRadius: meadowTheme.radius.control,
  borderWidth: 1,
  paddingHorizontal: 12,
  paddingVertical: 8,
};

const smallPillText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  lineHeight: 17,
};

const greenButton = {
  alignItems: "center" as const,
  alignSelf: "stretch" as const,
  backgroundColor: meadowTheme.colors.sage,
  borderRadius: meadowTheme.radius.panel,
  minHeight: 48,
  justifyContent: "center" as const,
};

const greenButtonText = {
  color: meadowTheme.colors.linenDeep,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  lineHeight: 20,
};

const quickActionButton = {
  alignItems: "center" as const,
  backgroundColor: meadowTheme.colors.panel,
  borderColor: meadowTheme.colors.sage,
  borderRadius: meadowTheme.radius.panel,
  borderWidth: 1,
  minHeight: 46,
  justifyContent: "center" as const,
  paddingHorizontal: 10,
  width: "48%" as const,
};

const quickActionText = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  lineHeight: 17,
  textAlign: "center" as const,
};
