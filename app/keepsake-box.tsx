import { MeadowImage as Image } from "@/components/meadow-image";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router } from "expo-router";
import React from "react";
import { Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { MeadowDivider } from "@/components/meadow-screen";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { SuccessFlash } from "@/components/SuccessFlash";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { MemoryGardenEntry, MemoryGardenEntryType, useMemoryGarden } from "@/hooks/useMemoryGarden";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

const keepsakeBoxImage = require("@/assets/illustrations/keepsake-box-thumb.png");

const filters = [
  { label: "ALL", value: "all" },
  { label: "PHOTOS", value: "photo" },
  { label: "NOTES", value: "note" },
  { label: "FLOWERS", value: "flower" },
  { label: "VOICE", value: "voice" },
] as const;

type KeepsakeFilter = (typeof filters)[number]["value"];
type ComposerMode = "photo" | "note" | "flower" | "voice" | null;

export default function KeepsakeBoxScreen() {
  const { user, loading } = useAuth();
  const [filter, setFilter] = React.useState<KeepsakeFilter>("all");
  const { entries, loading: memoryLoading, refresh, addEntry } = useMemoryGarden(filter === "all" ? undefined : filter);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [composerMode, setComposerMode] = React.useState<ComposerMode>(null);
  const [content, setContent] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [savedNote, setSavedNote] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [pendingPhotoUri, setPendingPhotoUri] = React.useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = React.useState("");

  React.useEffect(() => {
    if (!savedNote) {
      return;
    }

    const timeout = setTimeout(() => setSavedNote(null), 2800);
    return () => clearTimeout(timeout);
  }, [savedNote]);

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  async function saveKeepsake() {
    if (!composerMode || !content.trim()) {
      return;
    }

    const type: MemoryGardenEntryType = composerMode === "voice" ? "voice" : composerMode;
    const entryCaption = composerMode === "voice" ? "Voice Note" : caption.trim() || defaultCaption(composerMode);
    await addEntry({ type, content: content.trim(), caption: entryCaption });
    setContent("");
    setCaption("");
    setComposerMode(null);
    setSavedNote("Held in the Keepsake Box.");
    setFlash("Added to your keepsake box.");
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleAddPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "The Meadow needs access to your photos to add memories to your Keepsake Box.", [{ text: "OK" }]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    setPhotoCaption("");
    setPendingPhotoUri(result.assets[0].uri);
  }

  async function uploadPhoto(uri: string, caption: string) {
    try {
      const cleanCaption = caption.trim();

      if (!hasSupabaseConfig || !supabase) {
        await addEntry({
          type: "photo",
          content: "https://picsum.photos/400/300",
          caption: photoCaption,
        });
        closePhotoCaptionSheet();
        setSavedNote("Held in the Keepsake Box.");
        setFlash("Added to your keepsake box.");
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        Alert.alert("Could not save photo", "Please try again.");
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = extensionForUri(uri);
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("memory-garden-photos")
        .upload(fileName, blob, { contentType: `image/${fileExt}`, upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("memory-garden-photos").getPublicUrl(fileName);

      await addEntry({
        type: "photo",
        content: publicUrl,
        caption: cleanCaption,
      });

      await refresh();
      closePhotoCaptionSheet();
      setSavedNote("Held in the Keepsake Box.");
      setFlash("Added to your keepsake box.");
    } catch {
      Alert.alert("Could not save photo", "Please try again.");
    }
  }

  function closePhotoCaptionSheet() {
    setPendingPhotoUri(null);
    setPhotoCaption("");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl colors={[meadowTheme.colors.sage]} refreshing={refreshing} tintColor={meadowTheme.colors.sage} onRefresh={() => void handleRefresh()} />}
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{ gap: 18, paddingBottom: 112 }}
    >
      <View style={{ gap: 14, paddingHorizontal: 18, paddingTop: 16 }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
          <Pressable
            accessibilityLabel="Back to Memory Garden"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/memory-garden" as never)}
            style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1, paddingVertical: 6, width: 104 })}
          >
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
              {"<- Memory Garden"}
            </Text>
          </Pressable>
          <Text selectable style={{ color: meadowTheme.colors.ink, flex: 1, fontFamily: meadowTheme.fonts.header, fontSize: 26, lineHeight: 31, textAlign: "center" }}>
            The Keepsake Box
          </Text>
          <Pressable
            accessibilityLabel="Add to Your Keepsake Box"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => ({ alignItems: "flex-end", opacity: pressed ? 0.72 : 1, paddingVertical: 6, width: 104 })}
          >
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
              + Add
            </Text>
          </Pressable>
        </View>

        <Image
          source={keepsakeBoxImage}
          style={{ backgroundColor: meadowTheme.colors.linen, borderRadius: meadowTheme.radius.panel, height: 200, width: "100%" }}
          contentFit="cover"
          accessibilityLabel="A watercolor wooden keepsake box"
        />
        <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 13, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
          Nothing you loved is lost here.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
        {filters.map((item) => {
          const active = item.value === filter;
          return (
            <Pressable
              key={item.value}
              accessibilityLabel={`Filter ${item.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item.value)}
              style={({ pressed }) => ({
                backgroundColor: active ? meadowTheme.colors.sage : meadowTheme.colors.panel,
                borderColor: meadowTheme.colors.sage,
                borderRadius: meadowTheme.radius.control,
                borderWidth: 1,
                minHeight: 40,
                opacity: pressed ? 0.78 : 1,
                paddingHorizontal: 18,
                paddingVertical: 10,
              })}
            >
              <Text selectable={false} style={{ color: active ? meadowTheme.colors.linenDeep : meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 17 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {composerMode ? (
        <View
          style={{
            backgroundColor: meadowTheme.colors.panel,
            borderColor: meadowTheme.colors.line,
            borderRadius: meadowTheme.radius.panel,
            borderWidth: 1,
            gap: 12,
            marginHorizontal: 18,
            padding: 16,
          }}
        >
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 27, textAlign: "center" }}>
            {composerTitle(composerMode)}
          </Text>
          <TextInput
            accessibilityLabel={composerTitle(composerMode)}
            multiline
            onChangeText={setContent}
            placeholder={composerPlaceholder(composerMode)}
            placeholderTextColor={meadowTheme.colors.mutedInk}
            style={{
              backgroundColor: meadowTheme.colors.linenDeep,
              borderColor: meadowTheme.colors.line,
              borderRadius: meadowTheme.radius.panel,
              borderWidth: 1,
              color: meadowTheme.colors.ink,
              fontFamily: meadowTheme.fonts.body,
              fontSize: 14,
              lineHeight: 21,
              minHeight: 96,
              padding: 14,
              textAlignVertical: "top",
            }}
            value={content}
          />
          {composerMode === "flower" || composerMode === "photo" ? (
            <TextInput
              accessibilityLabel={composerMode === "flower" ? "What this flower remembers" : "Photo caption"}
              onChangeText={setCaption}
              placeholder={composerMode === "flower" ? "What does it remind you of?" : "Caption"}
              placeholderTextColor={meadowTheme.colors.mutedInk}
              style={{
                backgroundColor: meadowTheme.colors.linenDeep,
                borderColor: meadowTheme.colors.line,
                borderRadius: meadowTheme.radius.panel,
                borderWidth: 1,
                color: meadowTheme.colors.ink,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 14,
                minHeight: 48,
                paddingHorizontal: 14,
              }}
              value={caption}
            />
          ) : null}
          <MeadowButton label="Save to Keepsake Box" onPress={saveKeepsake} disabled={!content.trim()} />
        </View>
      ) : null}

      {savedNote ? (
        <View style={{ backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, marginHorizontal: 18, padding: 14 }}>
          <Text selectable style={{ color: meadowTheme.colors.sageDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 21, textAlign: "center" }}>
            {savedNote}
          </Text>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 18 }}>
        {memoryLoading ? (
          <KeepsakeSkeletons />
        ) : entries.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {entries.map((entry) => (
              <KeepsakeCard key={entry.id} entry={entry} />
            ))}
          </View>
        ) : (
          <View style={{ alignItems: "center", backgroundColor: meadowTheme.colors.panel, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, gap: 12, padding: 18 }}>
            <View style={{ backgroundColor: meadowTheme.colors.panelDeep, borderColor: meadowTheme.colors.line, borderRadius: meadowTheme.radius.panel, borderWidth: 1, height: 120, width: 120 }} />
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 21, lineHeight: 26, textAlign: "center" }}>
              Your box is waiting.
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 22, textAlign: "center" }}>
              Add a photo, a note, or a memory to begin.
            </Text>
            <Pressable accessibilityLabel="Add Something" accessibilityRole="button" onPress={() => setSheetOpen(true)} style={{ alignItems: "center", backgroundColor: meadowTheme.colors.sage, borderRadius: meadowTheme.radius.control, minHeight: 42, justifyContent: "center", paddingHorizontal: 18 }}>
              <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
                {"Add Something ->"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <AddMemorySheet
        visible={sheetOpen}
        onCancel={() => setSheetOpen(false)}
        onSelect={(mode) => {
          setSheetOpen(false);
          if (mode === "photo") {
            void handleAddPhoto();
            return;
          }
          setContent("");
          setCaption("");
          setComposerMode(mode);
        }}
      />
      <PhotoCaptionSheet
        photoCaption={photoCaption}
        pendingPhotoUri={pendingPhotoUri}
        onCancel={closePhotoCaptionSheet}
        onChangeCaption={setPhotoCaption}
        onSave={() => pendingPhotoUri && void uploadPhoto(pendingPhotoUri, photoCaption)}
      />
      <SuccessFlash message={flash} onDone={() => setFlash(null)} />
    </ScrollView>
  );
}

function KeepsakeSkeletons() {
  return (
    <View accessibilityLabel="The Keepsake Box is restoring memories" style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {[0, 1, 2, 3].map((index) => (
        <SkeletonBox key={index} height={120} width="48%" />
      ))}
    </View>
  );
}

function KeepsakeCard({ entry }: { entry: MemoryGardenEntry }) {
  return (
    <View
      style={{
        backgroundColor: meadowTheme.colors.panel,
        borderColor: meadowTheme.colors.line,
        borderRadius: meadowTheme.radius.panel,
        borderWidth: 0.5,
        overflow: "hidden",
        width: "48%",
      }}
    >
      {entry.type === "photo" ? <PhotoMemory entry={entry} /> : null}
      {entry.type === "note" ? <NoteMemory entry={entry} /> : null}
      {entry.type === "flower" ? <FlowerMemory entry={entry} /> : null}
      {entry.type === "voice" ? <VoiceMemory entry={entry} /> : null}
      <View style={{ gap: 3, padding: 8 }}>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
          {entry.caption || defaultCaption(entry.type)}
        </Text>
        <Text selectable style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>
          {formatDate(entry.created_at)}
        </Text>
      </View>
    </View>
  );
}

function PhotoMemory({ entry }: { entry: MemoryGardenEntry }) {
  if (entry.content.startsWith("http") || entry.content.startsWith("file")) {
    return <Image source={{ uri: entry.content }} style={{ backgroundColor: meadowTheme.colors.linenDeep, height: 120, width: "100%" }} contentFit="cover" accessibilityLabel={entry.caption ?? "Photo keepsake"} />;
  }

  return (
    <View style={{ alignItems: "center", backgroundColor: meadowTheme.colors.linenDeep, height: 120, justifyContent: "center", padding: 12 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 18, textAlign: "center" }} numberOfLines={4}>
        {entry.content}
      </Text>
    </View>
  );
}

function NoteMemory({ entry }: { entry: MemoryGardenEntry }) {
  return (
    <View style={{ backgroundColor: meadowTheme.colors.linenDeep, minHeight: 120, padding: 12 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19 }} numberOfLines={3}>
        {entry.content}
      </Text>
    </View>
  );
}

function FlowerMemory({ entry }: { entry: MemoryGardenEntry }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: meadowTheme.colors.panelDeep, minHeight: 120, justifyContent: "center", padding: 12 }}>
      <View style={{ backgroundColor: meadowTheme.colors.clay, borderRadius: meadowTheme.radius.control, height: 46, opacity: 0.7, width: 46 }} />
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 18, lineHeight: 23, marginTop: 8, textAlign: "center" }} numberOfLines={2}>
        {entry.content}
      </Text>
    </View>
  );
}

function VoiceMemory({ entry }: { entry: MemoryGardenEntry }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: meadowTheme.colors.fog, minHeight: 120, justifyContent: "center", padding: 12 }}>
      <View style={{ flexDirection: "row", gap: 5 }}>
        {[22, 42, 30, 50, 24].map((height, index) => (
          <View key={`${entry.id}-${height}-${index}`} style={{ backgroundColor: meadowTheme.colors.sage, borderRadius: 8, height, width: 7 }} />
        ))}
      </View>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 18, marginTop: 10, textAlign: "center" }} numberOfLines={2}>
        {entry.content}
      </Text>
    </View>
  );
}

function AddMemorySheet({ onCancel, onSelect, visible }: { onCancel: () => void; onSelect: (mode: Exclude<ComposerMode, null>) => void; visible: boolean }) {
  const options: Array<{ label: string; mode: Exclude<ComposerMode, null>; subcopy: string }> = [
    { label: "Add a Photo", mode: "photo", subcopy: "Choose an image and give it a gentle caption." },
    { label: "Write a Note", mode: "note", subcopy: "Keep words you want to return to." },
    { label: "Press a Flower", mode: "flower", subcopy: "Name a small bloom and what it remembers." },
    { label: "Add a Voice Note", mode: "voice", subcopy: "Write what you would like to say." },
  ];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <Pressable accessibilityLabel="Close add memory sheet" style={{ backgroundColor: "rgba(59, 42, 26, 0.28)", flex: 1, justifyContent: "flex-end" }} onPress={onCancel}>
        <Pressable
          accessibilityLabel="Add to Your Keepsake Box"
          style={{
            backgroundColor: meadowTheme.colors.linen,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            gap: 8,
            padding: 20,
            paddingBottom: 34,
          }}
        >
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28, textAlign: "center" }}>
            Add to Your Keepsake Box
          </Text>
          <MeadowDivider />
          {options.map((option) => (
            <Pressable
              key={option.mode}
              accessibilityLabel={option.label}
              accessibilityRole="button"
              onPress={() => onSelect(option.mode)}
              style={({ pressed }) => ({
                borderBottomColor: meadowTheme.colors.line,
                borderBottomWidth: 1,
                minHeight: 56,
                opacity: pressed ? 0.72 : 1,
                paddingVertical: 10,
              })}
            >
              <Text selectable={false} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
                {option.label}
              </Text>
              <Text selectable={false} style={{ color: meadowTheme.colors.mutedInk, fontFamily: meadowTheme.fonts.body, fontSize: 12, fontStyle: "italic", lineHeight: 17 }}>
                {option.subcopy}
              </Text>
            </Pressable>
          ))}
          <Pressable accessibilityLabel="Cancel" accessibilityRole="button" onPress={onCancel} style={({ pressed }) => ({ alignItems: "center", opacity: pressed ? 0.72 : 1, paddingTop: 12 })}>
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PhotoCaptionSheet({
  onCancel,
  onChangeCaption,
  onSave,
  pendingPhotoUri,
  photoCaption,
}: {
  onCancel: () => void;
  onChangeCaption: (caption: string) => void;
  onSave: () => void;
  pendingPhotoUri: string | null;
  photoCaption: string;
}) {
  return (
    <Modal animationType="slide" transparent visible={Boolean(pendingPhotoUri)} onRequestClose={onCancel}>
      <Pressable accessibilityLabel="Close photo caption sheet" style={{ backgroundColor: "rgba(59, 42, 26, 0.28)", flex: 1, justifyContent: "flex-end" }} onPress={onCancel}>
        <Pressable
          accessibilityLabel="Add photo caption"
          style={{
            backgroundColor: meadowTheme.colors.linen,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            gap: 12,
            padding: 20,
            paddingBottom: 34,
          }}
        >
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 22, lineHeight: 28, textAlign: "center" }}>
            Add a Photo
          </Text>
          {pendingPhotoUri ? (
            <Image
              source={{ uri: pendingPhotoUri }}
              style={{ backgroundColor: meadowTheme.colors.panelDeep, borderRadius: 12, height: 180, width: "100%" }}
              contentFit="cover"
              accessibilityLabel="Selected keepsake photo preview"
            />
          ) : null}
          <TextInput
            accessibilityLabel="Photo caption"
            onChangeText={onChangeCaption}
            placeholder="Add a caption... (optional)"
            placeholderTextColor={meadowTheme.colors.mutedInk}
            style={{
              backgroundColor: meadowTheme.colors.linenDeep,
              borderColor: meadowTheme.colors.line,
              borderRadius: meadowTheme.radius.panel,
              borderWidth: 1,
              color: meadowTheme.colors.ink,
              fontFamily: meadowTheme.fonts.body,
              fontSize: 14,
              minHeight: 48,
              paddingHorizontal: 14,
            }}
            value={photoCaption}
          />
          <MeadowButton label="Save to Keepsake Box ->" onPress={onSave} />
          <Pressable accessibilityLabel="Cancel photo" accessibilityRole="button" onPress={onCancel} style={({ pressed }) => ({ alignItems: "center", opacity: pressed ? 0.72 : 1, paddingTop: 8 })}>
            <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MeadowButton({ disabled, label, onPress }: { disabled?: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: disabled ? meadowTheme.colors.fog : meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.panel,
        justifyContent: "center",
        minHeight: 52,
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: 16,
      })}
    >
      <Text selectable={false} style={{ color: meadowTheme.colors.linenDeep, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function composerTitle(mode: Exclude<ComposerMode, null>) {
  if (mode === "photo") return "Add a Photo";
  if (mode === "note") return "Write a Note";
  if (mode === "flower") return "Press a Flower";
  return "Add a Voice Note";
}

function composerPlaceholder(mode: Exclude<ComposerMode, null>) {
  if (mode === "photo") return "Paste a photo link or describe the image you want to keep...";
  if (mode === "note") return "Write whatever you want to keep...";
  if (mode === "flower") return "What flower is this?";
  return "For now, write what you'd like to say.";
}

function defaultCaption(type: MemoryGardenEntryType | Exclude<ComposerMode, null>) {
  if (type === "photo") return "Photo";
  if (type === "flower") return "Pressed Flower";
  if (type === "voice") return "Voice Note";
  return "Note";
}

function extensionForUri(uri: string) {
  const cleanPath = uri.split("?")[0] ?? uri;
  const extension = cleanPath.split(".").pop()?.toLowerCase();

  if (extension === "png") return "png";
  if (extension === "webp") return "webp";
  if (extension === "heic") return "heic";
  return "jpg";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
