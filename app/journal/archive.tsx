import AsyncStorage from "@react-native-async-storage/async-storage";
import { MeadowImage as Image } from "@/components/meadow-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { MOOD_LABELS, type Mood } from "@/data/journal-prompts";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const vineDivider = require("@/assets/images/journal/vine-divider.png");
const moodIcons: Record<Mood, unknown> = {
  heavy: require("@/assets/images/journal/moods/heavy.png"),
  tender: require("@/assets/images/journal/moods/tender.png"),
  okay: require("@/assets/images/journal/moods/okay.png"),
  quiet: require("@/assets/images/journal/moods/quiet.png"),
  hopeful: require("@/assets/images/journal/moods/hopeful.png"),
  numb: require("@/assets/images/journal/moods/numb.png"),
};

type StoredJournalEntry = {
  id: string;
  body: string;
  mood: Mood | null;
  prompt: string | null;
  created_at: string;
};

export default function JournalArchiveScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = React.useState<StoredJournalEntry[]>([]);

  React.useEffect(() => {
    async function loadEntries() {
      try {
        const raw = await AsyncStorage.getItem("meadow_journal_entries");
        const parsed = raw ? (JSON.parse(raw) as StoredJournalEntry[]) : [];
        setEntries(Array.isArray(parsed) ? parsed : []);
      } catch {
        setEntries([]);
      }
    }

    void loadEntries();
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: "#F5F0E8", flex: 1 }}
      contentContainerStyle={{ paddingBottom: 104 + Math.max(insets.bottom, 0), paddingHorizontal: 20, paddingTop: 18 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable accessibilityLabel="Back to Journal" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => ({ alignSelf: "flex-start", opacity: pressed ? 0.72 : 1, paddingVertical: 8 })}>
        <Text selectable={false} style={{ color: "#5C6B4A", fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 22 }}>
          {"<- Back"}
        </Text>
      </Pressable>
      <Text selectable style={{ color: "#3D2E1E", fontFamily: meadowTheme.fonts.header, fontSize: 34, fontStyle: "italic", lineHeight: 42, marginTop: 8, textAlign: "center" }}>
        Journal Archive
      </Text>
      <Image source={vineDivider} contentFit="contain" style={{ alignSelf: "center", height: 34, width: 200 }} />
      <Text selectable style={{ color: "#8C7F72", fontFamily: meadowTheme.fonts.header, fontSize: 15, fontStyle: "italic", lineHeight: 23, textAlign: "center" }}>
        The pages you saved are kept here gently.
      </Text>

      <View style={{ gap: 12, marginTop: 20 }}>
        {entries.length ? (
          entries.map((entry) => <ArchiveEntry key={entry.id} entry={entry} />)
        ) : (
          <View style={{ backgroundColor: "#F8F4EE", borderColor: "#C8BFA8", borderRadius: 16, borderWidth: 1, padding: 18 }}>
            <Text selectable style={{ color: "#3D2E1E", fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 30, textAlign: "center" }}>
              No saved pages yet.
            </Text>
            <Text selectable style={{ color: "#8C7F72", fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 23, marginTop: 6, textAlign: "center" }}>
              When you save an entry, it will rest here.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function ArchiveEntry({ entry }: { entry: StoredJournalEntry }) {
  return (
    <View style={{ backgroundColor: "#F8F4EE", borderColor: "#C8BFA8", borderRadius: 16, borderWidth: 1, padding: 16 }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
        {entry.mood ? <Image source={moodIcons[entry.mood]} contentFit="cover" style={{ borderRadius: 14, height: 36, overflow: "hidden", width: 36 }} /> : null}
        <View style={{ flex: 1 }}>
          <Text selectable style={{ color: "#8C7F72", fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
            {formatDate(entry.created_at)}
          </Text>
          <Text selectable style={{ color: "#5C6B4A", fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
            {entry.mood ? MOOD_LABELS[entry.mood] : "Journal"}
          </Text>
        </View>
      </View>
      {entry.prompt ? (
        <Text selectable style={{ color: "#5C6B4A", fontFamily: meadowTheme.fonts.header, fontSize: 16, fontStyle: "italic", lineHeight: 24, marginTop: 12 }}>
          {entry.prompt}
        </Text>
      ) : null}
      <Text selectable style={{ color: "#3D2E1E", fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
        {entry.body}
      </Text>
    </View>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
