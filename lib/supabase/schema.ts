export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing";
export type SubscriptionPlan = "greenhouse_monthly" | "greenhouse_annual";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

export type LetterRow = {
  id: string;
  author_id: string;
  display_name: string;
  avatar_seed: string;
  cubby: string;
  body: string;
  seal_count: number;
  reply_count: number;
  is_pinned: boolean;
  pinned_by: string | null;
  created_at: string;
  is_deleted: boolean;
};

export type LetterReplyRow = {
  id: string;
  letter_id: string;
  author_id: string;
  display_name: string;
  avatar_seed: string;
  body: string;
  seal_count: number;
  created_at: string;
  is_deleted: boolean;
};

export type TeaTableRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  member_count: number;
  is_subscriber_only: boolean;
  sort_order: number;
};

export type TeaMessageRow = {
  id: string;
  table_id: string;
  author_id: string;
  display_name: string;
  avatar_seed: string;
  body: string;
  reaction_counts: Record<string, number>;
  created_at: string;
  is_deleted: boolean;
};

export type HealingCircleStatus = "open" | "filling_fast" | "live" | "completed";

export type HealingCircleRow = {
  id: string;
  name: string;
  description: string;
  illustration_asset: string | null;
  scheduled_at: string;
  duration_minutes: number;
  capacity: number;
  enrolled_count: number;
  status: HealingCircleStatus;
  facilitator_name: string;
  is_subscriber_only: boolean;
};

export type WorkshopRow = {
  id: string;
  title: string;
  facilitator_name: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  is_live: boolean;
  replay_url: string | null;
  thumbnail_asset: string | null;
  is_subscriber_only: boolean;
};

export type CourtyardPostType = "text" | "photo" | "poll" | "feeling" | "milestone";
export type CourtyardCategory = "introductions" | "celebrations" | "support_questions" | "creative_corner" | "events_meetups";

export type CourtyardPostRow = {
  id: string;
  author_id: string;
  display_name: string;
  avatar_seed: string;
  post_type: CourtyardPostType;
  body: string;
  media_url: string | null;
  category: CourtyardCategory;
  heart_count: number;
  comment_count: number;
  created_at: string;
  is_deleted: boolean;
  is_pinned: boolean;
};

export type ReportContentType = "letter" | "reply" | "message" | "post" | "comment";

export type ReportRow = {
  id: string;
  reporter_id: string;
  content_type: ReportContentType;
  content_id: string;
  reason: string;
  created_at: string;
  reviewed: boolean;
};

export type BlockRow = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};
