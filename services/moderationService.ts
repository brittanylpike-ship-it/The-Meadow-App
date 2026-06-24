import type { ModerationFlagLevel, ReportContentType } from "@/lib/supabase/schema";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type ReportReason = "Unkind or harmful" | "Spam" | "Crisis concern" | "Privacy concern" | "Other";
export type ModerationResultFlagLevel = "clean" | ModerationFlagLevel;

export type ModerationResult = {
  approved: boolean;
  flagLevel: ModerationResultFlagLevel;
  reason: string | null;
};

export type ContentCheck = {
  ok: boolean;
  warning: string | null;
  cleanedBody: string;
  moderation: ModerationResult;
};

type ModerationLogInput = {
  authorId?: string;
  contentId?: string;
  contentText: string;
  contentType: ReportContentType;
  flagLevel: ModerationFlagLevel;
  reason: string;
};

const crisisPatterns = [
  /\bi want to die\b/i,
  /\bi'?m going to kill myself\b/i,
  /\bsuicide\b/i,
  /\bend my life\b/i,
  /\bcan't go on\b/i,
  /\bcan'?t go on\b/i,
];

const hardFlagPatterns = [
  /\bkill (you|them|her|him)\b/i,
  /\bgo kill yourself\b/i,
  /\bexplicit threat\b/i,
];

const softFlagPatterns = [
  /\byou are worthless\b/i,
  /\bi hate you\b/i,
  /\bshut up\b/i,
  /\bscam\b/i,
  /\bspam\b/i,
];

const anthropicModerationModel = "claude-haiku-4-5-20251001";
const moderationSystemPrompt =
  "You are the first safety layer for The Meadow, a gentle grief companion community. Screen user content before it is shared. Approve ordinary grief, sadness, anger, tenderness, questions, memories, and peer support. Soft-flag content that may need a human Meadow Keeper review. Hard-flag harassment, threats, spam, explicit abuse, or privacy harm. Mark crisis when content suggests immediate self-harm, suicide intent, or urgent danger. Return only JSON with approved, flagLevel, and reason.";

export async function moderateContent(text: string): Promise<ModerationResult> {
  const cleanedBody = text.trim();

  if (!cleanedBody) {
    return {
      approved: false,
      flagLevel: "hard_flag",
      reason: "Empty content cannot be posted.",
    };
  }

  const aiResult = await moderateWithConfiguredAi(cleanedBody);
  if (aiResult) {
    return aiResult;
  }

  const crisisMatch = crisisPatterns.find((pattern) => pattern.test(cleanedBody));
  if (crisisMatch) {
    return {
      approved: false,
      flagLevel: "crisis",
      reason: "Possible immediate crisis language.",
    };
  }

  const hardMatch = hardFlagPatterns.find((pattern) => pattern.test(cleanedBody));
  if (hardMatch) {
    return {
      approved: false,
      flagLevel: "hard_flag",
      reason: "Possible direct harm or threat.",
    };
  }

  const softMatch = softFlagPatterns.find((pattern) => pattern.test(cleanedBody));
  if (softMatch) {
    return {
      approved: true,
      flagLevel: "soft_flag",
      reason: "The message may need human review before it is shared.",
    };
  }

  return {
    approved: true,
    flagLevel: "clean",
    reason: null,
  };
}

export async function checkCommunityContent(body: string, maxLength: number): Promise<ContentCheck> {
  const cleanedBody = body.slice(0, maxLength).trim();
  const moderation = await moderateContent(cleanedBody);

  return {
    cleanedBody,
    moderation,
    ok: moderation.approved,
    warning: warningForModeration(moderation),
  };
}

export function warningForModeration(result: ModerationResult) {
  if (result.flagLevel === "soft_flag") {
    return "Posted. It will be held for a gentle review before others see it.";
  }

  if (result.flagLevel === "hard_flag") {
    return "This content couldn't be posted. Please review the Community Guidelines.";
  }

  if (result.flagLevel === "crisis") {
    return "It sounds like you might be going through something really heavy right now.";
  }

  return null;
}

export async function writeModerationLog(input: ModerationLogInput) {
  if (!hasSupabaseConfig || !supabase || !input.authorId || !isUuid(input.authorId)) {
    return { stored: false };
  }

  const { error } = await supabase.from("moderation_log").insert({
    ai_reason: input.reason,
    author_id: input.authorId,
    content_id: input.contentId,
    content_text: input.contentText,
    content_type: input.contentType,
    flag_level: input.flagLevel,
  });

  if (error) {
    throw error;
  }

  if (input.flagLevel === "crisis") {
    await sendModerationAlert({
      authorId: input.authorId,
      contentText: input.contentText,
      flagLevel: input.flagLevel,
      reason: input.reason,
    });
  }

  return { stored: true };
}

export async function submitReport(input: {
  reporterId?: string;
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
}) {
  if (!hasSupabaseConfig || !supabase || !input.reporterId || !isUuid(input.reporterId)) {
    return { stored: false, crisisConcern: input.reason === "Crisis concern" };
  }

  const { error } = await supabase.from("reports").insert({
    content_id: input.contentId,
    content_type: input.contentType,
    reason: input.reason,
    reporter_id: input.reporterId,
  });

  if (error) {
    throw error;
  }

  return { stored: true, crisisConcern: input.reason === "Crisis concern" };
}

export async function sendModerationAlert(input: {
  authorId?: string | null;
  contentText: string;
  flagLevel: ModerationFlagLevel | string;
  reason?: string | null;
  timestamp?: string | null;
}) {
  if (!hasSupabaseConfig || !supabase) {
    return { sent: false };
  }

  const { error } = await supabase.functions.invoke("send-moderation-alert", {
    body: {
      authorId: input.authorId,
      contentText: input.contentText,
      reason: input.reason,
      subject: `Meadow Moderation Alert - ${input.flagLevel}`,
      timestamp: input.timestamp ?? new Date().toISOString(),
      to: "brittanylpike@gmail.com",
    },
  });

  if (error) {
    throw error;
  }

  return { sent: true };
}

export async function blockCommunityMember(blockerId: string | undefined, blockedId: string) {
  if (!hasSupabaseConfig || !supabase || !blockerId || !isUuid(blockerId) || !isUuid(blockedId)) {
    return { stored: false };
  }

  const { error } = await supabase.from("blocks").upsert(
    {
      blocked_id: blockedId,
      blocker_id: blockerId,
    },
    { onConflict: "blocker_id,blocked_id" }
  );

  if (error) {
    throw error;
  }

  return { stored: true };
}

export async function getBlockedMemberIds(userId?: string) {
  if (!hasSupabaseConfig || !supabase || !userId || !isUuid(userId)) {
    return [];
  }

  const { data, error } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);

  if (error) {
    return [];
  }

  return (data ?? []).map((row: { blocked_id: string }) => row.blocked_id);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function moderateWithConfiguredAi(text: string): Promise<ModerationResult | null> {
  const endpoint = process.env.EXPO_PUBLIC_ANTHROPIC_MODERATION_ENDPOINT;
  if (!endpoint) {
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      body: JSON.stringify({
        model: anthropicModerationModel,
        systemPrompt: moderationSystemPrompt,
        text,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Partial<ModerationResult>;
    if (typeof payload.approved !== "boolean" || !isModerationFlagLevel(payload.flagLevel)) {
      return null;
    }

    return {
      approved: payload.approved,
      flagLevel: payload.flagLevel,
      reason: typeof payload.reason === "string" ? payload.reason : null,
    };
  } catch {
    return null;
  }
}

function isModerationFlagLevel(value: unknown): value is ModerationResultFlagLevel {
  return value === "clean" || value === "soft_flag" || value === "hard_flag" || value === "crisis";
}
