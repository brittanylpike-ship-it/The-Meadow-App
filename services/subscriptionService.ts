import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SubscriptionPlan, SubscriptionRow, SubscriptionStatus } from "@/lib/supabase/schema";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type SubscriptionSnapshot = {
  isSubscriber: boolean;
  status: SubscriptionStatus | "none";
  plan: SubscriptionPlan | null;
  planEndsAt: string | null;
};

const subscriptionCacheKey = "meadow_subscription_snapshot";

export async function getSubscriptionSnapshot(userId?: string): Promise<SubscriptionSnapshot> {
  const cached = await readCachedSubscription();

  if (!hasSupabaseConfig || !supabase || !userId) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id,user_id,status,plan,current_period_end,stripe_subscription_id,created_at")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const snapshot = mapSubscription(data as SubscriptionRow | null);
    await AsyncStorage.setItem(subscriptionCacheKey, JSON.stringify(snapshot));
    return snapshot;
  } catch {
    return cached;
  }
}

export async function cacheSubscriptionSnapshot(snapshot: SubscriptionSnapshot) {
  await AsyncStorage.setItem(subscriptionCacheKey, JSON.stringify(snapshot));
}

async function readCachedSubscription(): Promise<SubscriptionSnapshot> {
  const fallback: SubscriptionSnapshot = {
    isSubscriber: false,
    status: "none",
    plan: null,
    planEndsAt: null,
  };

  try {
    const cached = await AsyncStorage.getItem(subscriptionCacheKey);
    return cached ? { ...fallback, ...JSON.parse(cached) } : fallback;
  } catch {
    return fallback;
  }
}

function mapSubscription(row: SubscriptionRow | null): SubscriptionSnapshot {
  if (!row) {
    return {
      isSubscriber: false,
      status: "none",
      plan: null,
      planEndsAt: null,
    };
  }

  return {
    isSubscriber: row.status === "active" || row.status === "trialing",
    status: row.status,
    plan: row.plan,
    planEndsAt: row.current_period_end,
  };
}
