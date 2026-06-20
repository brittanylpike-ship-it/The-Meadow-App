import React from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export type HearthRoom = "courtyard" | "post_office";

export type HearthPost = {
  id: string;
  user_id: string;
  room: HearthRoom;
  category: string;
  title: string | null;
  content: string;
  display_name: string;
  seal_count: number;
  reply_count: number;
  created_at: string;
};

export type HearthReply = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  display_name: string;
  seal_count: number;
  created_at: string;
};

type AddPostInput = {
  title?: string | null;
  content: string;
  category: string;
};

const mockPosts: HearthPost[] = [
  {
    id: "post-office-1",
    user_id: "wildflower_soul",
    room: "post_office",
    category: "grief",
    title: "Welcome to The Post Office",
    content: "Some days feel heavier than others. I am leaving a soft place to sit this down today.",
    display_name: "WildflowerSoul",
    seal_count: 42,
    reply_count: 2,
    created_at: "2026-06-12T10:00:00.000Z",
  },
  {
    id: "post-office-2",
    user_id: "sunlit_path",
    room: "post_office",
    category: "hope",
    title: "A small win",
    content: "I got out of bed. It may seem small, but today it felt like everything.",
    display_name: "SunlitPath",
    seal_count: 36,
    reply_count: 0,
    created_at: "2026-06-12T11:00:00.000Z",
  },
  {
    id: "courtyard-1",
    user_id: "meadow_willow",
    room: "courtyard",
    category: "general",
    title: null,
    content: "Feeling overwhelmed today. Anyone have gentle ways to reset when your mind will not stop?",
    display_name: "MeadowWillow",
    seal_count: 15,
    reply_count: 3,
    created_at: "2026-06-12T12:00:00.000Z",
  },
  {
    id: "courtyard-2",
    user_id: "gentle_rain",
    room: "courtyard",
    category: "general",
    title: null,
    content: "I painted a little reminder: you are allowed to grow at your own pace.",
    display_name: "GentleRain",
    seal_count: 31,
    reply_count: 1,
    created_at: "2026-06-12T13:00:00.000Z",
  },
];

const mockReplies: HearthReply[] = [
  {
    id: "reply-1",
    post_id: "post-office-1",
    user_id: "gentle_steps",
    content: "You are not alone. One breath, one step.",
    display_name: "GentleSteps",
    seal_count: 18,
    created_at: "2026-06-12T10:15:00.000Z",
  },
  {
    id: "reply-2",
    post_id: "post-office-1",
    user_id: "hopeful_heart",
    content: "I take it minute by minute some days.",
    display_name: "HopefulHeart",
    seal_count: 11,
    created_at: "2026-06-12T10:18:00.000Z",
  },
];

export function useHearthPosts(room: HearthRoom, category?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = React.useState<HearthPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fallbackPosts = React.useMemo(
    () => mockPosts.filter((post) => post.room === room && (!category || category === "all" || post.category === category)),
    [category, room]
  );

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!hasSupabaseConfig || !supabase || !user) {
      setPosts(fallbackPosts);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("hearth_posts")
        .select("id,user_id,room,category,title,content,seal_count,reply_count,created_at,profiles(display_name)")
        .eq("room", room)
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error: queryError } = await query;
      if (queryError) {
        throw queryError;
      }

      setPosts(
        (data ?? []).map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          room: row.room,
          category: row.category,
          title: row.title,
          content: row.content,
          display_name: row.profiles?.display_name ?? "Meadow Friend",
          seal_count: row.seal_count ?? 0,
          reply_count: row.reply_count ?? 0,
          created_at: row.created_at,
        }))
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  }, [category, fallbackPosts, room, user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const addPost = React.useCallback(
    async (input: AddPostInput) => {
      const trimmed = input.content.trim();
      if (!trimmed) {
        return null;
      }

      const localPost: HearthPost = {
        id: `local-post-${Date.now()}`,
        user_id: user?.id ?? "local_mock",
        room,
        category: input.category,
        title: input.title?.trim() || null,
        content: trimmed,
        display_name: user?.email?.split("@")[0] ?? "You",
        seal_count: 0,
        reply_count: 0,
        created_at: new Date().toISOString(),
      };

      if (!hasSupabaseConfig || !supabase || !user) {
        setPosts((current) => [localPost, ...current]);
        return localPost;
      }

      try {
        const { data, error: insertError } = await supabase
          .from("hearth_posts")
          .insert({
            user_id: user.id,
            room,
            category: input.category,
            title: input.title?.trim() || null,
            content: trimmed,
          })
          .select("id,user_id,room,category,title,content,seal_count,reply_count,created_at")
          .single();

        if (insertError) {
          throw insertError;
        }

        const savedPost = { ...(data as Omit<HearthPost, "display_name">), display_name: localPost.display_name };
        setPosts((current) => [savedPost, ...current]);
        return savedPost;
      } catch (caught) {
        setError(getErrorMessage(caught));
        setPosts((current) => [localPost, ...current]);
        return localPost;
      }
    },
    [room, user]
  );

  const addSeal = React.useCallback(
    async (postId: string) => {
      setPosts((current) => current.map((post) => (post.id === postId ? { ...post, seal_count: post.seal_count + 1 } : post)));

      if (!hasSupabaseConfig || !supabase || !user) {
        return;
      }

      try {
        const { error: sealError } = await supabase.from("post_seals").insert({ post_id: postId, user_id: user.id });
        if (sealError) {
          throw sealError;
        }

        const post = posts.find((item) => item.id === postId);
        if (post) {
          await supabase.from("hearth_posts").update({ seal_count: post.seal_count + 1 }).eq("id", postId);
        }
      } catch (caught) {
        setError(getErrorMessage(caught));
      }
    },
    [posts, user]
  );

  return { posts, loading, error, refresh, addPost, addSeal };
}

export function usePostReplies(postId?: string) {
  const { user } = useAuth();
  const [replies, setReplies] = React.useState<HearthReply[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fallbackReplies = React.useMemo(() => mockReplies.filter((reply) => reply.post_id === postId), [postId]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!postId || !hasSupabaseConfig || !supabase || !user) {
      setReplies(fallbackReplies);
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from("hearth_replies")
        .select("id,post_id,user_id,content,seal_count,created_at,profiles(display_name)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setReplies(
        (data ?? []).map((row: any) => ({
          id: row.id,
          post_id: row.post_id,
          user_id: row.user_id,
          content: row.content,
          display_name: row.profiles?.display_name ?? "Meadow Friend",
          seal_count: row.seal_count ?? 0,
          created_at: row.created_at,
        }))
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
      setReplies(fallbackReplies);
    } finally {
      setLoading(false);
    }
  }, [fallbackReplies, postId, user]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const addReply = React.useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!postId || !trimmed) {
        return null;
      }

      const localReply: HearthReply = {
        id: `local-reply-${Date.now()}`,
        post_id: postId,
        user_id: user?.id ?? "local_mock",
        content: trimmed,
        display_name: user?.email?.split("@")[0] ?? "You",
        seal_count: 0,
        created_at: new Date().toISOString(),
      };

      if (!hasSupabaseConfig || !supabase || !user) {
        setReplies((current) => [...current, localReply]);
        return localReply;
      }

      try {
        const { data, error: insertError } = await supabase
          .from("hearth_replies")
          .insert({ post_id: postId, user_id: user.id, content: trimmed })
          .select("id,post_id,user_id,content,seal_count,created_at")
          .single();

        if (insertError) {
          throw insertError;
        }

        const savedReply = { ...(data as Omit<HearthReply, "display_name">), display_name: localReply.display_name };
        setReplies((current) => [...current, savedReply]);
        return savedReply;
      } catch (caught) {
        setError(getErrorMessage(caught));
        setReplies((current) => [...current, localReply]);
        return localReply;
      }
    },
    [postId, user]
  );

  return { replies, loading, error, refresh, addReply };
}

export function getMockHearthPost(postId?: string) {
  return mockPosts.find((post) => post.id === postId) ?? mockPosts[0];
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "The Hearth is keeping this locally for now.";
}
