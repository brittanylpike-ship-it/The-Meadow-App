import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";

import type { SubscriptionPlan, SubscriptionRow, SubscriptionStatus } from "@/lib/supabase/schema";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type SubscriptionSnapshot = {
  isSubscriber: boolean;
  status: SubscriptionStatus | "none";
  plan: SubscriptionPlan | null;
  planEndsAt: string | null;
  monthlyPriceLabel: string;
  yearlyPriceLabel: string;
};

const subscriptionCacheKey = "meadow_subscription_snapshot";
const defaultMonthlyPriceLabel = process.env.EXPO_PUBLIC_HEARTH_MONTHLY_PRICE ?? "$4.99";
const defaultYearlyPriceLabel = process.env.EXPO_PUBLIC_HEARTH_YEARLY_PRICE ?? "$44.99";

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
  await AsyncStorage.setItem(subscriptionCacheKey, JSON.stringify(withPriceDefaults(snapshot)));
}

async function readCachedSubscription(): Promise<SubscriptionSnapshot> {
  const fallback: SubscriptionSnapshot = {
    isSubscriber: false,
    monthlyPriceLabel: defaultMonthlyPriceLabel,
    status: "none",
    plan: null,
    planEndsAt: null,
    yearlyPriceLabel: defaultYearlyPriceLabel,
  };

  try {
    const cached = await AsyncStorage.getItem(subscriptionCacheKey);
    return cached ? withPriceDefaults({ ...fallback, ...JSON.parse(cached) }) : fallback;
  } catch {
    return fallback;
  }
}

function mapSubscription(row: SubscriptionRow | null): SubscriptionSnapshot {
  if (!row) {
    return {
      isSubscriber: false,
      monthlyPriceLabel: defaultMonthlyPriceLabel,
      status: "none",
      plan: null,
      planEndsAt: null,
      yearlyPriceLabel: defaultYearlyPriceLabel,
    };
  }

  return {
    isSubscriber: row.status === "active" || row.status === "trialing",
    monthlyPriceLabel: defaultMonthlyPriceLabel,
    status: row.status,
    plan: row.plan,
    planEndsAt: row.current_period_end,
    yearlyPriceLabel: defaultYearlyPriceLabel,
  };
}

export function getHearthPriceLine(snapshot: Pick<SubscriptionSnapshot, "monthlyPriceLabel" | "yearlyPriceLabel">) {
  return `${snapshot.monthlyPriceLabel}/month or ${snapshot.yearlyPriceLabel}/year`;
}

export async function startHearthSubscriptionPurchase() {
  const purchaseUrl = process.env.EXPO_PUBLIC_HEARTH_SUBSCRIPTION_URL;

  if (!purchaseUrl) {
    return { started: false };
  }

  const supported = await Linking.canOpenURL(purchaseUrl);
  if (!supported) {
    return { started: false };
  }

  await Linking.openURL(purchaseUrl);
  return { started: true };
}

function withPriceDefaults(snapshot: SubscriptionSnapshot): SubscriptionSnapshot {
  return {
    ...snapshot,
    monthlyPriceLabel: snapshot.monthlyPriceLabel ?? defaultMonthlyPriceLabel,
    yearlyPriceLabel: snapshot.yearlyPriceLabel ?? defaultYearlyPriceLabel,
  };
}
