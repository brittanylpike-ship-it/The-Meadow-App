import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type TeaRoomMessage = {
  id: string;
  user_id: string;
  room_blend: string;
  content: string;
  display_name: string;
  created_at: string;
};

const mockTeaRoomMessages: TeaRoomMessage[] = [
  {
    id: "mock-tea-1",
    user_id: "meadow_willow",
    room_blend: "quiet-venting",
    content: "Today feels heavy, but this table helps me breathe.",
    display_name: "MeadowWillow",
    created_at: "2026-06-12T09:12:00.000Z",
  },
  {
    id: "mock-tea-2",
    user_id: "sunlit_path",
    room_blend: "quiet-venting",
    content: "I see you. One breath at a time.",
    display_name: "SunlitPath",
    created_at: "2026-06-12T09:14:00.000Z",
  },
  {
    id: "mock-tea-3",
    user_id: "gentle_rain",
    room_blend: "quiet-venting",
    content: "Same here today. Thank you for saying it out loud.",
    display_name: "GentleRain",
    created_at: "2026-06-12T09:15:00.000Z",
  },
];

export function useTeaRoom(roomBlend: string) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<TeaRoomMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fallbackMessages = React.useMemo(
    () => mockTeaRoomMessages.filter((message) => message.room_blend === roomBlend || message.room_blend === "quiet-venting"),
    [roomBlend]
  );

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!hasSupabaseConfig || !supabase || !user) {
      setMessages(fallbackMessages);
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from("tea_room_messages")
        .select("id,user_id,room_blend,content,created_at,profiles(display_name)")
        .eq("room_blend", roomBlend)
        .order("created_at", { ascending: true })
        .limit(50);

      if (queryError) {
        throw queryError;
      }

      setMessages(
        (data ?? []).map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          room_blend: row.room_blend,
          content: row.content,
          display_name: row.profiles?.display_name ?? "Meadow Friend",
          created_at: row.created_at,
        }))
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
      setMessages(fallbackMessages);
    } finally {
      setLoading(false);
    }
  }, [fallbackMessages, roomBlend, user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!hasSupabaseConfig || !supabase || !user) {
      return;
    }

    const client = supabase;
    const channel = client
      .channel(`tea-room-${roomBlend}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tea_room_messages", filter: `room_blend=eq.${roomBlend}` },
        (payload) => {
          const row = payload.new as any;
          setMessages((current) => [
            ...current,
            {
              id: row.id,
              user_id: row.user_id,
              room_blend: row.room_blend,
              content: row.content,
              display_name: row.display_name ?? "Meadow Friend",
              created_at: row.created_at ?? new Date().toISOString(),
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [roomBlend, user]);

  const sendMessage = React.useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return null;
      }

      const localMessage: TeaRoomMessage = {
        id: `local-tea-${Date.now()}`,
        user_id: user?.id ?? "local_mock",
        room_blend: roomBlend,
        content: trimmed,
        display_name: user?.email?.split("@")[0] ?? "You",
        created_at: new Date().toISOString(),
      };

      if (!hasSupabaseConfig || !supabase || !user) {
        setMessages((current) => [...current, localMessage]);
        return localMessage;
      }

      try {
        const { data, error: insertError } = await supabase
          .from("tea_room_messages")
          .insert({ user_id: user.id, room_blend: roomBlend, content: trimmed })
          .select("id,user_id,room_blend,content,created_at")
          .single();

        if (insertError) {
          throw insertError;
        }

        const savedMessage = {
          ...(data as Omit<TeaRoomMessage, "display_name">),
          display_name: localMessage.display_name,
        };
        setMessages((current) => [...current, savedMessage]);
        return savedMessage;
      } catch (caught) {
        setError(getErrorMessage(caught));
        setMessages((current) => [...current, localMessage]);
        return localMessage;
      }
    },
    [roomBlend, user]
  );

  return { messages, loading, error, refresh, sendMessage };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "The Tea Room is keeping this locally for now.";
}
