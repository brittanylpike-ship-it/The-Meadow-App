import { Redirect } from "expo-router";
import React from "react";

import { ChapterSelectionScreen } from "@/screens/MemoryGarden/ChapterSelectionScreen";
import { useAuth } from "@/features/auth/auth-context";

export default function MemoryGardenScreen() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  return <ChapterSelectionScreen />;
}
