import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { getSubscriptionSnapshot, type SubscriptionSnapshot } from "@/services/subscriptionService";

export function useSubscription() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = React.useState<SubscriptionSnapshot>({
    isSubscriber: false,
    status: "none",
    plan: null,
    planEndsAt: null,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      setSnapshot(await getSubscriptionSnapshot(user?.id));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...snapshot,
    isLoading,
    refresh,
  };
}
