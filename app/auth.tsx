import { MeadowImage as Image } from "@/components/meadow-image";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import { Image as NativeImage, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { getAuthErrorCopy } from "@/features/auth/auth-error-copy.mjs";

const AUTH_COPY = {
  title: "The Meadow",
  subtitle: "A private place that remembers what you leave with care.",
  formTitle: "Begin here",
  emailPlaceholder: "Email",
  passwordPlaceholder: "Password",
  primaryButton: "Enter The Meadow",
  secondaryButton: "I already have a place here",
};

export default function AuthScreen() {
  const { user, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { height, width } = useWindowDimensions();
  const compact = width < 680;
  const authArtworkAspectRatio = 1024 / 1536;
  const desktopStageWidth = Math.min(width - 48, (height - 24) * authArtworkAspectRatio, 620);
  const stageWidth = compact ? width : desktopStageWidth;
  const stageHeight = compact ? Math.max(height, 760) : desktopStageWidth / authArtworkAspectRatio;
  if (user) {
    return <Redirect href="/" />;
  }

  async function submit() {
    setError(null);
    try {
      if (isCreating) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (caught) {
      setError(getAuthErrorCopy(caught));
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        padding: compact ? 0 : 12,
      }}
    >
      <View
        style={{
          backgroundColor: meadowTheme.colors.linen,
          height: stageHeight,
          overflow: "hidden",
          position: "relative",
          width: stageWidth,
        }}
      >
        <NativeImage
          source={require("@/assets/art/auth-entry.png")}
          style={{
            height: stageHeight,
            position: "absolute",
            width: stageWidth,
          }}
          resizeMode={compact ? "cover" : "contain"}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <View
          style={{
            alignItems: "center",
            left: 0,
            paddingHorizontal: compact ? 22 : 40,
            position: "absolute",
            right: 0,
            top: compact ? Math.min(stageHeight * 0.505, stageHeight - 420) : 54,
          }}
        >
          <Image
            source={require("@/assets/art/vine-divider.png")}
            style={{ height: compact ? 18 : 24, opacity: 0.86, width: compact ? 180 : 240 }}
            contentFit="contain"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <View style={{ alignItems: "center", gap: 8 }}>
            <Text
              selectable
              style={{
                color: meadowTheme.colors.ink,
                fontFamily: meadowTheme.fonts.header,
                fontSize: compact ? 34 : 56,
                lineHeight: compact ? 40 : 64,
                textAlign: "center",
                textShadowColor: "rgba(242, 237, 228, 0.72)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              {AUTH_COPY.title}
            </Text>
            <Text selectable style={bodyText}>
              {AUTH_COPY.subtitle}
            </Text>
          </View>
        </View>

        <View
          style={{
            alignItems: "center",
            bottom: compact ? 8 : 118,
            gap: 6,
            left: compact ? 24 : 90,
            position: "absolute",
            right: compact ? 24 : 90,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(242, 237, 228, 0.78)",
              borderColor: "rgba(85, 115, 91, 0.22)",
              borderRadius: meadowTheme.radius.panel,
              borderWidth: 1,
              boxShadow: "0 8px 22px rgba(37, 51, 31, 0.10)",
              gap: 12,
              maxWidth: 370,
              paddingHorizontal: compact ? 16 : 18,
              paddingVertical: compact ? 14 : 16,
              width: "100%",
            }}
          >
            <Text selectable style={panelTitleText}>
              {AUTH_COPY.formTitle}
            </Text>
            <View style={{ gap: 10 }}>
              <TextInput
                accessibilityLabel="Email"
                accessibilityHint="Enter the email for this private Meadow."
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder={AUTH_COPY.emailPlaceholder}
                placeholderTextColor={meadowTheme.colors.mutedInk}
                style={inputStyle}
                value={email}
              />
              <TextInput
                accessibilityLabel="Password"
                accessibilityHint="Enter a password with at least six characters."
                onChangeText={setPassword}
                placeholder={AUTH_COPY.passwordPlaceholder}
                placeholderTextColor={meadowTheme.colors.mutedInk}
                secureTextEntry
                style={inputStyle}
                value={password}
              />
            </View>

            {error ? (
              <Text selectable style={{ color: meadowTheme.colors.clay, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 21 }}>
                {error}
              </Text>
            ) : null}

            <View style={{ gap: 8 }}>
              <AuthStoryButton label={AUTH_COPY.primaryButton} onPress={submit} disabled={!email || password.length < 6} />
              <AuthStoryButton label={AUTH_COPY.secondaryButton} quiet onPress={() => setIsCreating(!isCreating)} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function AuthStoryButton({
  label,
  onPress,
  disabled,
  quiet,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  quiet?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: quiet ? "rgba(242, 237, 228, 0.46)" : meadowTheme.colors.sageDeep,
        borderColor: quiet ? "rgba(85, 115, 91, 0.32)" : "rgba(37, 51, 31, 0.44)",
        borderRadius: meadowTheme.radius.control,
        borderWidth: 1,
        boxShadow: quiet ? "inset 0 1px 2px rgba(37, 51, 31, 0.04)" : "0 3px 8px rgba(37, 51, 31, 0.16)",
        opacity: disabled ? 0.58 : pressed ? 0.82 : 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
      })}
    >
      <Text
        selectable={false}
        style={{
          color: quiet ? meadowTheme.colors.ink : meadowTheme.colors.linen,
          fontFamily: meadowTheme.fonts.body,
          fontSize: 16,
          lineHeight: 20,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const bodyText = {
  color: meadowTheme.colors.mutedInk,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 16,
  lineHeight: 22,
  maxWidth: 370,
  textAlign: "center" as const,
};

const panelTitleText = {
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.header,
  fontSize: 25,
  lineHeight: 30,
  textAlign: "center" as const,
};

const inputStyle = {
  backgroundColor: "rgba(238, 232, 220, 0.86)",
  borderColor: "rgba(85, 115, 91, 0.24)",
  borderRadius: meadowTheme.radius.control,
  borderWidth: 1,
  boxShadow: "inset 0 2px 5px rgba(37, 51, 31, 0.08)",
  color: meadowTheme.colors.ink,
  fontFamily: meadowTheme.fonts.body,
  fontSize: 16,
  paddingHorizontal: 14,
  paddingVertical: 11
};
