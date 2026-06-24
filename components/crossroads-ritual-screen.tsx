import { Redirect } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { MeadowButton } from "@/components/meadow-button";
import { MeadowDivider, MeadowPanel, MeadowScreen } from "@/components/meadow-screen";
import { MeadowSceneImage, type MeadowSceneId } from "@/components/meadow-scene-image";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import {
  getCrossroadsRitualById,
  getCrossroadsRitualReturnState,
  getCrossroadsRitualSaveCopy,
  type CrossroadsRitualId
} from "@/features/memory/crossroads-memory.mjs";
import { useMeadowState } from "@/features/world/use-meadow-state";

type CrossroadsRitualScreenProps = {
  ritualId: CrossroadsRitualId;
};

const crossroadsRitualSceneIds: Record<CrossroadsRitualId, MeadowSceneId> = {
  worn_path: "ritual_worn_path",
  offering: "ritual_offering",
  candle: "ritual_candle",
  searching_for_signs: "ritual_searching_for_signs",
  waiting_gate: "ritual_waiting_gate",
};

export function CrossroadsRitualScreen({ ritualId }: CrossroadsRitualScreenProps) {
  const ritual = getCrossroadsRitualById(ritualId);
  const { user, loading: authLoading } = useAuth();
  const meadow = useMeadowState(user ?? undefined);
  const [response, setResponse] = useState(ritual.options[0]);
  const [detail, setDetail] = useState("");

  const returnState = useMemo(() => {
    if (!meadow.state) return null;
    return getCrossroadsRitualReturnState(meadow.state, ritualId);
  }, [meadow.state, ritualId]);

  if (!authLoading && !user) {
    return <Redirect href="/auth" />;
  }

  async function save() {
    await meadow.saveCrossroadsRitual.mutateAsync({
      ritualId,
      response,
      detail
    });
    setDetail("");
  }

  return (
    <MeadowScreen title={ritual.title} subtitle={returnState?.message ?? `${ritual.title} is waiting at the crossing.`}>
      <MeadowSceneImage sceneId={crossroadsRitualSceneIds[ritualId]} accessibilityLabel={`A rendered ${ritual.title} ritual page`} />

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
              What the crossing shows
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
              label={getCrossroadsRitualSaveCopy(ritualId, meadow.saveCrossroadsRitual.isPending)}
              onPress={save}
              disabled={meadow.saveCrossroadsRitual.isPending}
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
