import { Redirect, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { getMockHearthPost, HearthReply, useHearthPosts, usePostReplies } from "@/hooks/useHearthPosts";

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const { user, loading } = useAuth();
  const posts = useHearthPosts("post_office");
  const replies = usePostReplies(postId);
  const [sealed, setSealed] = React.useState(false);
  const [replyDraft, setReplyDraft] = React.useState("");

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  const post = posts.posts.find((item) => item.id === postId) ?? getMockHearthPost(postId);

  async function leaveSeal() {
    if (!post || sealed) {
      return;
    }

    await posts.addSeal(post.id);
    setSealed(true);
  }

  async function sendReply() {
    if (!replyDraft.trim()) {
      return;
    }

    await replies.addReply(replyDraft);
    setReplyDraft("");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 16, padding: 18, paddingBottom: 120 }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
        <Pressable accessibilityLabel="Back to The Post Office" accessibilityRole="button" hitSlop={8} onPress={() => router.push("/post-office" as never)} style={{ width: 104 }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            {"<- Letters"}
          </Text>
        </Pressable>
        <Text selectable style={{ color: meadowTheme.colors.ink, flex: 1, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30, textAlign: "center" }}>
          The Letter
        </Text>
        <View style={{ width: 104 }} />
      </View>

      {posts.loading ? (
        <ActivityIndicator accessibilityLabel="The Post Office is opening this letter" color={meadowTheme.colors.sageDeep} />
      ) : (
        <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 12, padding: 16 }}>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17, textTransform: "uppercase" }}>
            {post.category}
          </Text>
          {post.title ? (
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30 }}>
              {post.title}
            </Text>
          ) : null}
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 25 }}>
            {post.content}
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
            {post.display_name} - {formatDate(post.created_at)}
          </Text>
          <Pressable
            accessibilityLabel="Leave a Seal"
            accessibilityRole="button"
            disabled={sealed}
            onPress={leaveSeal}
            style={{
              alignItems: "center",
              backgroundColor: sealed ? meadowTheme.colors.panelDeep : meadowTheme.colors.sage,
              borderColor: meadowTheme.colors.sage,
              borderRadius: meadowTheme.radius.panel,
              borderWidth: sealed ? 1 : 0,
              minHeight: 48,
              justifyContent: "center",
            }}
          >
            <Text selectable={false} style={{ color: sealed ? meadowTheme.colors.sage : meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14 }}>
              {sealed ? "Seal Left" : "Leave a Seal"}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={{ backgroundColor: meadowTheme.colors.line, height: 1 }} />

      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 25 }}>
        Replies
      </Text>
      {replies.loading ? (
        <ActivityIndicator accessibilityLabel="The Post Office is restoring replies" color={meadowTheme.colors.sageDeep} />
      ) : replies.replies.length ? (
        <View style={{ gap: 10 }}>
          {replies.replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} />
          ))}
        </View>
      ) : (
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
          No replies yet. Leave one gently.
        </Text>
      )}

      <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
        <TextInput
          accessibilityLabel="Leave a reply"
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
            minHeight: 48,
            paddingHorizontal: 16,
          }}
          value={replyDraft}
        />
        <Pressable accessibilityLabel="Send reply" accessibilityRole="button" disabled={!replyDraft.trim()} onPress={sendReply} style={{ alignItems: "center", backgroundColor: replyDraft.trim() ? meadowTheme.colors.sage : meadowTheme.colors.fog, borderRadius: meadowTheme.radius.control, height: 44, justifyContent: "center", width: 60 }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14 }}>
            Send
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ReplyCard({ reply }: { reply: HearthReply }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 5, padding: 12 }}>
      <Text selectable style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.header, fontSize: 15, lineHeight: 19 }}>
        {reply.display_name}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
        {reply.content}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
        {formatDate(reply.created_at)} - Seals {reply.seal_count}
      </Text>
    </View>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
