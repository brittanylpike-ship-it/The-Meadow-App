import type { ReportContentType } from "@/lib/supabase/schema";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type ReportReason = "Unkind or harmful" | "Spam" | "Crisis concern" | "Privacy concern" | "Other";

export type ContentCheck = {
  ok: boolean;
  warning: string | null;
  cleanedBody: string;
};

const profanitySoftWords = ["damn", "hell"];
const urlPattern = /https?:\/\/|www\./i;

export function checkCommunityContent(body: string, maxLength: number, allowLinks = false): ContentCheck {
  const trimmed = body.trim().slice(0, maxLength);
  const hasUrl = urlPattern.test(trimmed);
  const hasSoftFlag = profanitySoftWords.some((word) => new RegExp(`\\b${word}\\b`, "i").test(trimmed));

  if (hasUrl && !allowLinks) {
    return {
      ok: false,
      warning: "Links are kept out of this space so everyone can stay here gently.",
      cleanedBody: trimmed.replace(urlPattern, ""),
    };
  }

  return {
    ok: true,
    warning: hasSoftFlag ? "Your words may need a gentle review before posting." : null,
    cleanedBody: trimmed,
  };
}

export async function submitReport(input: {
  reporterId?: string;
  contentType: ReportContentType;
  contentId: string;
  reason: ReportReason;
}) {
  if (!hasSupabaseConfig || !supabase || !input.reporterId) {
    return { stored: false, crisisConcern: input.reason === "Crisis concern" };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: input.reporterId,
    content_type: input.contentType,
    content_id: input.contentId,
    reason: input.reason,
  });

  if (error) {
    throw error;
  }

  return { stored: true, crisisConcern: input.reason === "Crisis concern" };
}

export async function blockCommunityMember(blockerId: string | undefined, blockedId: string) {
  if (!hasSupabaseConfig || !supabase || !blockerId) {
    return { stored: false };
  }

  const { error } = await supabase.from("blocks").upsert(
    {
      blocker_id: blockerId,
      blocked_id: blockedId,
    },
    { onConflict: "blocker_id,blocked_id" }
  );

  if (error) {
    throw error;
  }

  return { stored: true };
}

export async function getBlockedMemberIds(userId?: string) {
  if (!hasSupabaseConfig || !supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);

  if (error) {
    return [];
  }

  return (data ?? []).map((row: { blocked_id: string }) => row.blocked_id);
}
