import { useHearthPosts } from "@/hooks/useHearthPosts";

export function useLetters(cubby = "all") {
  const posts = useHearthPosts("post_office", cubby);

  return {
    letters: posts.posts,
    loading: posts.loading,
    error: posts.error,
    refresh: posts.refresh,
    createLetter: posts.addPost,
    sealLetter: posts.addSeal,
    loadReplies: posts.loadReplies,
    addReply: posts.addReply,
  };
}
