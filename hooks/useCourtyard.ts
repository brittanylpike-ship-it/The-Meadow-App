import { useHearthPosts } from "@/hooks/useHearthPosts";

export function useCourtyard(category = "all") {
  const posts = useHearthPosts("courtyard", category);

  return {
    posts: posts.posts,
    loading: posts.loading,
    error: posts.error,
    refresh: posts.refresh,
    createPost: posts.addPost,
    offerHeart: posts.addSeal,
    loadComments: posts.loadReplies,
    addComment: posts.addReply,
  };
}
