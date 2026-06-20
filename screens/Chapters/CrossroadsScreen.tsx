import { ChapterHubScreen } from "@/components/ChapterHubScreen";
import { chapterExperiences } from "@/constants/chapter-experience";
import React from "react";

export default function CrossroadsScreen() {
  return <ChapterHubScreen {...chapterExperiences[2]} />;
}
