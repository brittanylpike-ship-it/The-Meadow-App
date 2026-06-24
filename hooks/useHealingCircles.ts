import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type HealingCircleStatus = "live" | "open" | "full";

export type HealingCircle = {
  id: string;
  title: string;
  host_name: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  max_seats: number;
  current_seats: number;
  status: HealingCircleStatus;
};

const mockHealingCircles: HealingCircle[] = [
  {
    id: "anxiety-overwhelm",
    title: "Anxiety & Overwhelm Circle",
    host_name: "Sage Willow",
    description: "A gentle space to share what feels heavy.",
    scheduled_at: "2026-06-15T19:00:00.000Z",
    duration_minutes: 75,
    max_seats: 10,
    current_seats: 8,
    status: "live",
  },
  {
    id: "morning-grounding",
    title: "Morning Grounding Circle",
    host_name: "Meadow Keeper",
    description: "Start your day with intention, breath, and community.",
    scheduled_at: "2026-06-16T08:30:00.000Z",
    duration_minutes: 60,
    max_seats: 10,
    current_seats: 4,
    status: "open",
  },
  {
    id: "inner-child",
    title: "Inner Child Healing Circle",
    host_name: "River Fern",
    description: "Reconnect with your younger self.",
    scheduled_at: "2026-06-17T18:30:00.000Z",
    duration_minutes: 90,
    max_seats: 10,
    current_seats: 10,
    status: "full",
  },
  {
    id: "grief-release",
    title: "Grief & Release Circle",
    host_name: "Sage Willow",
    description: "A compassionate space to honor, share, and gently release.",
    scheduled_at: "2026-06-18T19:00:00.000Z",
    duration_minutes: 75,
    max_seats: 10,
    current_seats: 2,
    status: "open",
  },
  {
    id: "new-beginnings",
    title: "New Beginnings Circle",
    host_name: "Meadow Keeper",
    description: "Step into growth, hope, and the next chapter together.",
    scheduled_at: "2026-06-19T18:30:00.000Z",
    duration_minutes: 75,
    max_seats: 10,
    current_seats: 5,
    status: "open",
  },
];

export function useHealingCircles() {
  const { user } = useAuth();
  const [circles, setCircles] = React.useState<HealingCircle[]>([]);
  const [userRegistrations, setUserRegistrations] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!hasSupabaseConfig || !supabase || !user) {
      setCircles(mockHealingCircles);
      setUserRegistrations([]);
      setLoading(false);
      return;
    }

    try {
      const [{ data: circleRows, error: circlesError }, { data: registrationRows, error: registrationsError }] = await Promise.all([
        supabase.from("healing_circles").select("*").order("scheduled_at", { ascending: true }),
        supabase.from("circle_registrations").select("circle_id").eq("user_id", user.id),
      ]);

      if (circlesError) {
        throw circlesError;
      }

      if (registrationsError) {
        throw registrationsError;
      }

      setCircles((circleRows ?? []) as HealingCircle[]);
      setUserRegistrations((registrationRows ?? []).map((row: any) => row.circle_id));
    } catch (caught) {
      setError(getErrorMessage(caught));
      setCircles(mockHealingCircles);
      setUserRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const registerForCircle = React.useCallback(
    async (circleId: string) => {
      if (userRegistrations.includes(circleId)) {
        setError("Already reserved.");
        return;
      }

      const circle = circles.find((item) => item.id === circleId);
      if (!circle || circle.status === "full") {
        return;
      }

      setUserRegistrations((current) => [...current, circleId]);
      setCircles((current) =>
        current.map((item) => (item.id === circleId ? { ...item, current_seats: Math.min(item.current_seats + 1, item.max_seats) } : item))
      );

      if (!hasSupabaseConfig || !supabase || !user) {
        return;
      }

      try {
        const { error: registrationError } = await supabase.from("circle_registrations").insert({ circle_id: circleId, user_id: user.id });
        if (registrationError) {
          throw registrationError;
        }

        await supabase.from("healing_circles").update({ current_seats: circle.current_seats + 1 }).eq("id", circleId);
      } catch (caught) {
        setError(getErrorMessage(caught));
      }
    },
    [circles, user, userRegistrations]
  );

  return { circles, userRegistrations, loading, error, refresh, registerForCircle };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "The Greenhouse is keeping this locally for now.";
}
