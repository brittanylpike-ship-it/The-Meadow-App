import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { MeadowButton } from "@/components/meadow-button";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { MeadowSceneImage } from "@/components/meadow-scene-image";
import { evergreenContexts, evergreenThoughts } from "@/constants/meadow-content";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { getEvergreenReturnState, getEvergreenSaveCopy } from "@/features/memory/evergreen-tree-memory.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";

export default function EvergreenTreeScreen() {
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const recordedVisitRef = useRef<string | null>(null);
  const [thought, setThought] = useState<string>(evergreenThoughts[0]);
  const [context, setContext] = useState<string>(evergreenContexts[0]);
  const [offering, setOffering] = useState("");

  const returnState = useMemo(() => {
    if (!meadow.state) return null;
    return getEvergreenReturnState(meadow.state);
  }, [meadow.state]);

  useEffect(() => {
    const visitKey = user?.id ? `${user.id}:evergreen_tree` : null;
    if (!visitKey || !meadow.state || recordedVisitRef.current === visitKey) return;

    recordedVisitRef.current = visitKey;
    meadow.markRitualVisited.mutate({ ritualId: "evergreen_tree" });
  }, [meadow, user?.id]);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  async function save() {
    await meadow.saveMemory.mutateAsync({
      thought,
      context,
      offering
    });
    setOffering("");
  }

  return (
    <MeadowScreen title="Evergreen Tree" subtitle={returnState?.message ?? "The tree is waiting quietly."}>
      <MeadowSceneImage sceneId="ritual_evergreen_tree" accessibilityLabel="A rendered Evergreen Tree ritual page" />

      {authLoading || meadow.loading || !returnState ? (
        <ActivityIndicator accessibilityLabel="The Meadow is restoring the Evergreen Tree" color={meadowTheme.colors.sageDeep} />
      ) : (
        <>
          {returnState.tags.length ? (
            <MeadowPanel>
              <Text selectable style={headerText}>
                What remained
              </Text>
              <View style={{ gap: 8 }}>
                {returnState.tags.map((tag) => (
                  <View
                    key={tag.id}
                    style={{
                      backgroundColor: meadowTheme.colors.panelDeep,
                      borderColor: meadowTheme.colors.line,
                      borderRadius: meadowTheme.radius.panel,
                      borderWidth: 1,
                      padding: 12
                    }}
                  >
                    <Text selectable style={bodyText}>
                      {tag.text}
                    </Text>
                    <Text selectable style={smallText}>
                      {tag.context} - {tag.dateLabel}
                    </Text>
                  </View>
                ))}
              </View>
            </MeadowPanel>
          ) : null}

          <MeadowPanel>
            <Text selectable style={headerText}>
              Which thought feels closest today?
            </Text>
            <ChoiceList values={evergreenThoughts} selected={thought} onSelect={setThought} />
          </MeadowPanel>

          <MeadowPanel>
            <Text selectable style={headerText}>
              When does this thought find you?
            </Text>
            <ChoiceList values={evergreenContexts} selected={context} onSelect={setContext} />
          </MeadowPanel>

          <MeadowPanel>
            <Text selectable style={headerText}>
              Leave something here?
            </Text>
            <TextInput
              accessibilityLabel="Leave something at the Evergreen Tree"
              accessibilityHint="Writes a private memory, name, date, sentence, or feeling."
              multiline
              onChangeText={setOffering}
              placeholder="Memory, name, date, sentence, feeling, or nothing today"
              placeholderTextColor={meadowTheme.colors.mutedInk}
              style={{
                backgroundColor: meadowTheme.colors.panelDeep,
                borderColor: meadowTheme.colors.line,
                borderRadius: meadowTheme.radius.control,
                borderWidth: 1,
                color: meadowTheme.colors.ink,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 16,
                minHeight: 92,
                padding: 12,
                textAlignVertical: "top"
              }}
              value={offering}
            />
            <MeadowButton label={getEvergreenSaveCopy(meadow.saveMemory.isPending)} onPress={save} disabled={meadow.saveMemory.isPending} />
          </MeadowPanel>

          <MeadowPanel>
            <Text selectable style={headerText}>
              Stillness
            </Text>
            <Text selectable style={bodyText}>
              Some parts of you are still waiting. That is not weakness. That is love.
            </Text>
          </MeadowPanel>

          <MeadowDivider />
        </>
      )}
    </MeadowScreen>
  );
}

function ChoiceList<T extends readonly string[]>({
  values,
  selected,
  onSelect
}: {
  values: T;
  selected: string;
  onSelect: (value: T[number]) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {values.map((value) => {
        const active = value === selected;
        return (
          <Pressable
            key={value}
            accessibilityLabel={`${value}${active ? ", selected" : ""}`}
            accessibilityHint="Selects this response for the Evergreen Tree."
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            hitSlop={6}
            onPress={() => onSelect(value)}
            style={({ pressed }) => ({
              backgroundColor: active ? meadowTheme.colors.sage : meadowTheme.colors.panelDeep,
              borderColor: active ? meadowTheme.colors.sageDeep : meadowTheme.colors.line,
              borderRadius: meadowTheme.radius.control,
              borderWidth: 1,
              opacity: pressed ? 0.82 : 1,
              paddingHorizontal: 12,
              paddingVertical: 10
            })}
          >
            <Text
              selectable={false}
              style={{
                color: active ? meadowTheme.colors.linen : meadowTheme.colors.ink,
                fontFamily: meadowTheme.fonts.body,
                fontSize: 15,
                lineHeight: 20
              }}
            >
              {value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const headerText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 23,
  lineHeight: 29
};

const bodyText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 16,
  lineHeight: 23
};

const smallText = {
  color: meadowTheme.colors.sageDeep,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 14,
  lineHeight: 19
};
