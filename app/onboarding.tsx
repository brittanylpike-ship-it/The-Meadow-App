import AsyncStorage from "@react-native-async-storage/async-storage";
import { MeadowImage as Image, type ImageContentPosition } from "@/components/meadow-image";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { meadowTheme } from "@/constants/meadow-theme";

const ONBOARDING_KEY = "meadow_onboarding_complete";

const screens = [
  {
    body: "A quiet place to tend your grief, one season at a time.",
    hero: require("../assets/illustrations/onboarding/home-entry.png"),
    heroHeight: 220,
    heroPosition: "top center",
    title: "Welcome to The Meadow",
  },
  {
    body: "Each chapter holds five rituals that gently guide you through the five stages of grief — at your own pace, in your own time.",
    chapters: [
      ["🐇", "Frozen Ground"],
      ["🐦‍⬛", "Storm Garden"],
      ["🐌", "The Crossroads"],
      ["🦉", "The Moors"],
      ["🐝", "First Bloom"],
    ],
    hero: require("../assets/illustrations/onboarding/chapters-entry.png"),
    heroHeight: 180,
    heroPosition: "top center",
    title: "Five Chapters of Healing",
  },
  {
    cards: [
      {
        body: "Write freely. Track your moods. Receive gentle prompts.",
        hero: require("../assets/illustrations/onboarding/journal-entry.png"),
        heroPosition: "top center",
        title: "Your Journal",
      },
      {
        body: "Honour memories. Collect keepsakes. Find stillness.",
        hero: require("../assets/illustrations/onboarding/memory-garden-entry.png"),
        heroPosition: "top center",
        title: "Memory Garden",
      },
    ],
    title: "A Space That's Yours",
  },
  {
    body: "The Hearth is always open — gather around the fire with others who understand. Grief is not a race. The Meadow will be here.",
    crisis: "If you are in crisis, text HOME to 741741 or call 988.",
    hero: require("../assets/illustrations/onboarding/profile-entry.png"),
    heroHeight: 220,
    heroPosition: "top center",
    title: "You Are Not Alone",
  },
] as const;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const listRef = React.useRef<FlatList<(typeof screens)[number]>>(null);
  const [index, setIndex] = React.useState(0);

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
    const nextIndex = viewableItems[0]?.index;
    if (typeof nextIndex === "number") {
      setIndex(nextIndex);
    }
  }).current;

  async function completeOnboarding() {
    await AsyncStorage.setItem("meadow_onboarding_complete", "true");
    router.replace("/(auth)/login");
  }

  function goNext() {
    if (index >= screens.length - 1) {
      void completeOnboarding();
      return;
    }

    listRef.current?.scrollToIndex({ animated: true, index: index + 1 });
  }

  return (
    <SafeAreaView style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
      {index < screens.length - 1 ? (
        <Pressable
          accessibilityLabel="Skip"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => void completeOnboarding()}
          style={{ position: "absolute", right: 22, top: insets.top + 12, zIndex: 3 }}
        >
          <Text selectable={false} style={{ color: "rgba(59, 42, 26, 0.60)", fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            Skip
          </Text>
        </Pressable>
      ) : null}

      <FlatList
        ref={listRef}
        data={screens}
        horizontal
        keyExtractor={(item) => item.title}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        renderItem={({ item }) => <OnboardingPage height={height} item={item} width={width} />}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
      />

      <View
        style={{
          alignItems: "center",
          bottom: Math.max(insets.bottom, 16),
          gap: 18,
          left: 0,
          paddingHorizontal: 24,
          position: "absolute",
          right: 0,
        }}
      >
        <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
          {screens.map((item, dotIndex) => (
            <View
              key={item.title}
              style={{
                backgroundColor: dotIndex === index ? meadowTheme.colors.sage : "rgba(59, 42, 26, 0.30)",
                borderRadius: 999,
                height: dotIndex === index ? 8 : 6,
                width: dotIndex === index ? 8 : 6,
              }}
            />
          ))}
        </View>
        <Pressable
          accessibilityLabel={index === screens.length - 1 ? "Begin Your Journey" : "Next"}
          accessibilityRole="button"
          onPress={goNext}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: meadowTheme.colors.sage,
            borderRadius: 999,
            minWidth: index === screens.length - 1 ? 210 : 132,
            opacity: pressed ? 0.84 : 1,
            paddingHorizontal: 28,
            paddingVertical: 14,
          })}
        >
          <Text selectable={false} style={{ color: meadowTheme.colors.linen, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 22 }}>
            {index === screens.length - 1 ? "Begin Your Journey" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function OnboardingPage({ height, item, width }: { height: number; item: (typeof screens)[number]; width: number }) {
  const aspectRatio = 1024 / 1536;
  const stageHeight = Math.max(height, 920);
  const stageWidth = Math.min(width, stageHeight * aspectRatio);
  const plaqueTop = Math.min(stageHeight * 0.53, stageHeight - ("cards" in item ? 430 : 330));

  return (
    <View style={{ alignItems: "center", backgroundColor: meadowTheme.colors.linen, flex: 1, width }}>
      <View
        style={{
          backgroundColor: meadowTheme.colors.linen,
          height: stageHeight,
          overflow: "hidden",
          position: "relative",
          width: stageWidth,
        }}
      >
        <Image
          source={require("../assets/art/auth-entry.png")}
          style={{ height: stageHeight, width: stageWidth }}
          contentFit="cover"
          contentPosition="center"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <View
          style={{
            alignItems: "center",
            gap: 14,
            left: 0,
            paddingHorizontal: 28,
            position: "absolute",
            right: 0,
            top: plaqueTop,
          }}
        >
          <Text
            selectable
            style={{
              color: meadowTheme.colors.ink,
              fontFamily: meadowTheme.fonts.header,
              fontSize: item.title === "Five Chapters of Healing" || item.title === "A Space That's Yours" ? 28 : 32,
              lineHeight: item.title === "Five Chapters of Healing" || item.title === "A Space That's Yours" ? 34 : 38,
              textAlign: "center",
            }}
          >
            {item.title}
          </Text>
          {"body" in item ? (
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 25, maxWidth: 310, textAlign: "center" }}>
              {item.body}
            </Text>
          ) : null}
          {"chapters" in item ? <ChapterBadgeRow chapters={item.chapters} /> : null}
          {"cards" in item ? <JournalGardenCards cards={item.cards} /> : null}
          {"crisis" in item ? (
            <Text selectable style={{ color: "rgba(59, 42, 26, 0.60)", fontFamily: meadowTheme.fonts.body, fontSize: 12, lineHeight: 18, maxWidth: 300, textAlign: "center" }}>
              {item.crisis}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ChapterBadgeRow({ chapters }: { chapters: readonly (readonly [string, string])[] }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between", marginTop: 4, maxWidth: 360, width: "100%" }}>
      {chapters.map(([emoji, label]) => (
        <View key={label} style={{ alignItems: "center", flex: 1, gap: 5 }}>
          <Text selectable={false} style={{ fontSize: 22, lineHeight: 26 }}>
            {emoji}
          </Text>
          <Text selectable={false} style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 12, lineHeight: 15, textAlign: "center" }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function JournalGardenCards({
  cards,
}: {
  cards: readonly {
    body: string;
    hero: unknown;
    heroPosition: ImageContentPosition;
    title: string;
  }[];
}) {
  return (
    <View style={{ gap: 12, maxWidth: 360, width: "100%" }}>
      {cards.map((card) => (
        <View
          key={card.title}
          style={{
            alignItems: "center",
            backgroundColor: meadowTheme.colors.linen,
            borderColor: "rgba(59, 42, 26, 0.20)",
            borderRadius: 12,
            borderWidth: 1,
            flexDirection: "row",
            gap: 14,
            padding: 12,
          }}
        >
          <CardImage position={card.heroPosition} source={card.hero} />
          <View style={{ flex: 1, gap: 5 }}>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 20, lineHeight: 24 }}>
              {card.title}
            </Text>
            <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19 }}>
              {card.body}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function CardImage({ position, source }: { position: ImageContentPosition; source: unknown }) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <View style={{ backgroundColor: meadowTheme.colors.linen, borderRadius: 10, height: 80, width: 80 }} />;
  }

  return <Image source={source} onError={() => setFailed(true)} style={{ borderRadius: 10, height: 80, width: 80 }} contentFit="cover" contentPosition={position} />;
}
