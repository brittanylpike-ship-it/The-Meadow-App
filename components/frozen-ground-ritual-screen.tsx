import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { MeadowButton } from "@/components/meadow-button";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { MeadowSceneImage, type MeadowSceneId } from "@/components/meadow-scene-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import {
  getFrozenGroundRitualById,
  getFrozenGroundRitualReturnState,
  getFrozenGroundRitualSaveCopy,
  type FrozenGroundRitualId
} from "@/features/memory/frozen-ground-ritual-memory.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";

type FrozenGroundRitualScreenProps = {
  ritualId: FrozenGroundRitualId;
};

const frozenGroundRitualSceneIds: Record<FrozenGroundRitualId, MeadowSceneId> = {
  frosted_window: "ritual_frosted_window",
  frozen_pond: "ritual_frozen_pond",
  quiet_hour: "ritual_quiet_hour",
  footprints: "ritual_footprints",
};

export function FrozenGroundRitualScreen({ ritualId }: FrozenGroundRitualScreenProps) {
  const ritual = getFrozenGroundRitualById(ritualId);
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const recordedVisitRef = useRef<string | null>(null);
  const [response, setResponse] = useState(ritual.options[0]);
  const [detail, setDetail] = useState("");

  const returnState = useMemo(() => {
    if (!meadow.state) return null;
    return getFrozenGroundRitualReturnState(meadow.state, ritualId);
  }, [meadow.state, ritualId]);

  useEffect(() => {
    const visitKey = user?.id ? `${user.id}:${ritualId}` : null;
    if (!visitKey || !meadow.state || recordedVisitRef.current === visitKey) return;

    recordedVisitRef.current = visitKey;
    meadow.markRitualVisited.mutate({ ritualId });
  }, [meadow, ritualId, user?.id]);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  async function save() {
    await meadow.saveFrozenGroundRitual.mutateAsync({
      ritualId,
      response,
      detail
    });
    setDetail("");
  }

  return (
    <MeadowScreen title={ritual.title} subtitle={returnState?.message ?? `${ritual.title} is waiting quietly.`}>
      <MeadowSceneImage sceneId={frozenGroundRitualSceneIds[ritualId]} accessibilityLabel={`A rendered ${ritual.title} ritual page`} />

      {authLoading || meadow.loading || !returnState ? (
        <MeadowPanel>
          <ActivityIndicator accessibilityLabel="The Meadow is restoring this ritual" color={meadowTheme.colors.sageDeep} />
        </MeadowPanel>
      ) : (
        <>
          {returnState.entries.length ? (
            <MeadowPanel>
              <Text selectable style={headerText}>
                What remained
              </Text>
              <View style={{ gap: 8 }}>
                {returnState.entries.map((entry) => (
                  <View
                    key={entry.id}
                    style={{
                      backgroundColor: meadowTheme.colors.panelDeep,
                      borderColor: meadowTheme.colors.line,
                      borderRadius: meadowTheme.radius.panel,
                      borderWidth: 1,
                      padding: 12
                    }}
                  >
                    <Text selectable style={bodyText}>
                      {entry.text}
                    </Text>
                    <Text selectable style={smallText}>
                      {entry.dateLabel}
                    </Text>
                  </View>
                ))}
              </View>
            </MeadowPanel>
          ) : null}

          <MeadowPanel>
            <Text selectable style={headerText}>
              What the place shows
            </Text>
            <Text selectable style={bodyText}>
              {returnState.visualStateLabel}
            </Text>
            <Text selectable style={smallText}>
              {returnState.witnessLabel}
            </Text>
          </MeadowPanel>

          <MeadowPanel>
            <Text selectable style={headerText}>
              {ritual.prompt}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {ritual.options.map((option) => {
                const active = option === response;
                return (
                  <Pressable
                    key={option}
                    accessibilityLabel={`${option}${active ? ", selected" : ""}`}
                    accessibilityHint={`Selects this response for ${ritual.title}.`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    hitSlop={6}
                    onPress={() => setResponse(option)}
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
                    <Text selectable={false} style={{ color: active ? meadowTheme.colors.linen : meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 20 }}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </MeadowPanel>

          <MeadowPanel>
            <Text selectable style={headerText}>
              Leave it here
            </Text>
            <TextInput
              accessibilityLabel={`Leave something in ${ritual.title}`}
              accessibilityHint="Writes a private note for this ritual."
              multiline
              onChangeText={setDetail}
              placeholder="A word, image, sentence, or nothing more today"
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
              value={detail}
            />
            <MeadowButton
              label={getFrozenGroundRitualSaveCopy(ritualId, meadow.saveFrozenGroundRitual.isPending)}
              onPress={save}
              disabled={meadow.saveFrozenGroundRitual.isPending}
            />
          </MeadowPanel>

          <MeadowDivider />
        </>
      )}
    </MeadowScreen>
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
