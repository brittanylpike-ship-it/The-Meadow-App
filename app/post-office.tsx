import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect, router } from "expo-router";
import React from "react";
import { Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { PressCard } from "@/components/PressCard";
import { CrisisSupportCard } from "@/components/Hearth/CrisisSupportCard";
import { SafetyBar } from "@/components/Hearth/SafetyBar";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { SuccessFlash } from "@/components/SuccessFlash";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { HearthPost, useHearthPosts } from "@/hooks/useHearthPosts";
import { checkCommunityContent } from "@/services/moderationService";

const postOfficeImage = require("@/assets/illustrations/post-office.png");

const categories = [
  { label: "ALL", value: "all" },
  { label: "INTRODUCTIONS", value: "grief" },
  { label: "RECOVERY & HEALING", value: "gratitude" },
  { label: "ANXIETY", value: "hope" },
  { label: "LONELINESS", value: "advice" },
  { label: "SELF GROWTH", value: "unsent" },
  { label: "MILESTONES", value: "hope" },
  { label: "RELATIONSHIPS", value: "gratitude" },
  { label: "OFF TOPIC", value: "all" },
] as const;

const composeCategories = ["grief", "gratitude", "hope", "advice", "unsent"] as const;
type PostCategory = (typeof composeCategories)[number] | "all";

const tools = ["My Letters", "My Seals", "Saved Letters", "Following", "Pen Pals"] as const;

export default function PostOfficeScreen() {
  const { user, loading } = useAuth();
  const [category, setCategory] = React.useState<PostCategory>("all");
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [mostSealedOpen, setMostSealedOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);
  const posts = useHearthPosts("post_office", category);
  const totalSeals = posts.posts.reduce((sum, post) => sum + post.seal_count, 0);

  if (!loading && !user) {
    return <Redirect href="/auth" />;
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
      <RoomHeader title="The Post Office" />
      <Image
        source={postOfficeImage}
        style={{ backgroundColor: meadowTheme.colors.panel, borderRadius: meadowTheme.radius.panel, height: 200, width: "100%" }}
        contentFit="cover"
        accessibilityLabel="A storybook post office with letters and wax seals"
      />
      <Text selectable style={introText}>
        A slow space for thoughtful words and kind replies.
      </Text>

      <Pressable
        accessibilityLabel="Create Letter"
        accessibilityRole="button"
        onPress={() => setComposerOpen(true)}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: meadowTheme.colors.sage,
          borderRadius: meadowTheme.radius.panel,
          minHeight: 50,
          justifyContent: "center",
          opacity: pressed ? 0.78 : 1,
        })}
      >
        <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
          Create Letter
        </Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {categories.map((item, index) => {
          const active = item.value === category && categories.findIndex((candidate) => candidate.value === category) === index;
          return (
            <Pill
              key={`${item.label}-${index}`}
              active={active}
              label={item.label}
              onPress={() => setCategory(item.value)}
            />
          );
        })}
      </ScrollView>

      <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 10, padding: 12 }}>
        <Text selectable style={sectionTitle}>
          Your Tools
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {tools.map((tool) => (
            <Pressable key={tool} accessibilityLabel={tool} accessibilityRole="button" style={smallToolPill}>
              <Text selectable={false} style={smallToolText}>
                {tool}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {totalSeals === 0 ? (
        <InfoPlaque title="What Are Seals?" body="Seals are how we uplift and thank letters that resonate with us. Tap the seal on any letter to show your support." />
      ) : null}

      {posts.loading ? (
        <FeedSkeleton label="The Post Office is restoring letters" />
      ) : posts.posts.length ? (
        <View style={{ gap: 12 }}>
          {posts.posts.map((post) => (
            <LetterCard key={post.id} post={post} onSeal={() => void handleSeal(post.id)} />
          ))}
        </View>
      ) : (
        <EmptyState title="The postbox is quiet." body="Be the first to leave a letter." buttonLabel="Write a Letter ->" onPress={() => setComposerOpen(true)} />
      )}

      <Pressable
        accessibilityLabel="Most Sealed"
        accessibilityRole="button"
        accessibilityState={{ expanded: mostSealedOpen }}
        onPress={() => setMostSealedOpen((open) => !open)}
        style={{ alignItems: "center", paddingVertical: 4 }}
      >
        <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {mostSealedOpen ? "Most Sealed -" : "Most Sealed +"}
        </Text>
      </Pressable>

      {mostSealedOpen ? (
        <InfoPlaque title="Most Sealed Letters" body="The letters receiving the most seals this week are gathered here gently, without ranking anyone's grief." />
      ) : null}

        {/* Safety & Care is shared across The Hearth. */}
        <SafetyBar contentId="post-office" contentType="letter" />

      <ComposeLetterModal visible={composerOpen} onCancel={() => setComposerOpen(false)} onSave={posts.addPost} />
      <SuccessFlash message={flash} onDone={() => setFlash(null)} />
    </ScrollView>
  );
}

function LetterCard({ onSeal, post }: { onSeal: () => void; post: HearthPost }) {
  return (
    <PressCard
      accessibilityLabel={post.title ?? "Open letter"}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/post-detail", params: { postId: post.id } } as never)}
      style={{
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.panel,
        borderWidth: 1,
        gap: 8,
        padding: 14,
      }}
    >
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17, textTransform: "uppercase" }}>
        {post.category}
      </Text>
      {post.title ? (
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 19, lineHeight: 24 }}>
          {post.title}
        </Text>
      ) : null}
      <Text selectable numberOfLines={3} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21 }}>
        {preview(post.content, 120)}
      </Text>
      <View style={{ gap: 4 }}>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
          {post.display_name}
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
          {formatDate(post.created_at)}
        </Text>
      </View>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <Pressable accessibilityLabel="Leave a seal" accessibilityRole="button" onPress={onSeal} hitSlop={8}>
          <Text selectable={false} style={{ color: meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
            Seal {post.seal_count}
          </Text>
        </Pressable>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
          Replies {post.reply_count}
        </Text>
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

function ComposeLetterModal({
  onCancel,
  onSave,
  visible,
}: {
  onCancel: () => void;
  onSave: (input: { title?: string | null; content: string; category: string; flagged?: boolean }) => Promise<HearthPost | null>;
  visible: boolean;
}) {
  const [category, setCategory] = React.useState("grief");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [warning, setWarning] = React.useState<string | null>(null);
  const [crisisOpen, setCrisisOpen] = React.useState(false);

  async function save() {
    if (!content.trim()) {
      return;
    }

    const check = await checkCommunityContent(content, 1000);
    setWarning(check.warning);
    if (check.moderation.flagLevel === "crisis") {
      setCrisisOpen(true);
      return;
    }

    if (!check.ok) {
      return;
    }

    await onSave({ title, content: check.cleanedBody, category, flagged: check.moderation.flagLevel === "soft_flag" });
    setTitle("");
    setContent("");
    onCancel();
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <Pressable style={{ backgroundColor: "rgba(59, 42, 26, 0.28)", flex: 1, justifyContent: "flex-end" }} onPress={onCancel}>
        <Pressable style={{ backgroundColor: meadowTheme.colors.linen, borderTopLeftRadius: 18, borderTopRightRadius: 18, gap: 12, padding: 20, paddingBottom: 34 }}>
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28, textAlign: "center" }}>
            Write Your Letter
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {composeCategories.map((item) => (
              <Pill key={item} active={item === category} label={labelForCategory(item)} onPress={() => setCategory(item)} />
            ))}
          </ScrollView>
          <Input value={title} onChangeText={setTitle} placeholder="Give your letter a title (optional)" label="Letter title" />
          <Input value={content} onChangeText={setContent} placeholder={"Dear reader,\nBegin wherever feels right..."} label="Letter content" multiline minHeight={160} />
          {warning ? (
            <Text selectable style={{ color: meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
              {warning}
            </Text>
          ) : null}
          <MeadowButton label="Send Your Letter ->" disabled={!content.trim()} onPress={save} />
          <Pressable accessibilityLabel="Cancel letter" accessibilityRole="button" onPress={onCancel} style={{ alignItems: "center", padding: 8 }}>
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14 }}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
      <CrisisSupportCard visible={crisisOpen} onClose={() => setCrisisOpen(false)} />
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

function Pill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={{ backgroundColor: active ? meadowTheme.colors.sage : meadowTheme.colors.panel, borderColor: meadowTheme.colors.sage, borderRadius: meadowTheme.radius.control, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 }}>
      <Text selectable={false} style={{ color: active ? meadowTheme.colors.linenDeep : meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 17 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Input({
  label,
  minHeight,
  multiline,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  minHeight?: number;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <TextInput
      accessibilityLabel={label}
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
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
        minHeight: minHeight ?? 48,
        padding: 14,
        textAlignVertical: multiline ? "top" : "center",
      }}
      value={value}
    />
  );
}

function MeadowButton({ disabled, label, onPress }: { disabled?: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" disabled={disabled} onPress={onPress} style={{ alignItems: "center", backgroundColor: disabled ? meadowTheme.colors.fog : meadowTheme.colors.sage, borderRadius: meadowTheme.radius.panel, minHeight: 50, justifyContent: "center" }}>
      <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function InfoPlaque({ body, title }: { body: string; title: string }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 6, padding: 14 }}>
      <Text selectable style={sectionTitle}>
        {title}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
        {body}
      </Text>
    </View>
  );
}

function EmptyState({ body, buttonLabel, onPress, title }: { body: string; buttonLabel: string; onPress: () => void; title: string }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 10, padding: 16 }}>
      <Text selectable style={sectionTitle}>
        {title}
      </Text>
      <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
        {body}
      </Text>
      <Pressable accessibilityLabel={buttonLabel} accessibilityRole="button" onPress={onPress} style={{ alignItems: "center", alignSelf: "center", backgroundColor: meadowTheme.colors.sage, borderRadius: meadowTheme.radius.control, minHeight: 42, justifyContent: "center", paddingHorizontal: 18 }}>
        <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function labelForCategory(category: PostCategory | string) {
  return category === "all" ? "ALL" : category.toUpperCase();
}

function preview(content: string, limit: number) {
  return content.length > limit ? `${content.slice(0, limit)}...` : content;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

const introText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  fontStyle: "italic" as const,
  lineHeight: 21,
  textAlign: "center" as const,
};

const sectionTitle = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 18,
  lineHeight: 23,
  textAlign: "center" as const,
};

const smallToolPill = {
  backgroundColor: meadowTheme.colors.linenDeep,
  borderColor: meadowTheme.colors.line,
  borderRadius: meadowTheme.radius.control,
  borderWidth: 1,
  paddingHorizontal: 12,
  paddingVertical: 8,
};

const smallToolText = {
  color: meadowTheme.colors.sage,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 12,
  lineHeight: 17,
};
