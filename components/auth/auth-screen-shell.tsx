import { MeadowImage as Image } from "@/components/meadow-image";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { meadowTheme } from "@/constants/meadow-theme";

export function AuthScreenShell({ children, layout = "standard" }: { children: React.ReactNode; layout?: "standard" | "tall" }) {
  const { height, width } = useWindowDimensions();
  const aspectRatio = 1024 / 1536;
  const compact = width < 700;
  const stageHeight = compact ? Math.max(height, layout === "tall" ? 940 : 812) : Math.min(height, 980);
  const stageWidth = Math.min(width, stageHeight * aspectRatio);
  const plaqueTop = compact
      ? layout === "tall"
        ? Math.min(stageHeight * 0.52, stageHeight - 500)
      : Math.min(stageHeight * 0.58, stageHeight - 340)
    : Math.min(stageHeight * 0.57, stageHeight - 430);

  return (
    <SafeAreaView style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}>
      <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: meadowTheme.colors.linen, flex: 1 }}
          contentContainerStyle={{ alignItems: "center", minHeight: height, paddingBottom: 0 }}
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
            <Image
              source={require("@/assets/art/auth-entry.png")}
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
                gap: 12,
                left: 0,
                paddingHorizontal: 28,
                position: "absolute",
                right: 0,
                top: plaqueTop,
              }}
            >
              <View style={{ gap: 10, maxWidth: 370, width: "100%" }}>{children}</View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ alignItems: "center", gap: 6, marginBottom: 2 }}>
      <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 34, lineHeight: 38, textAlign: "center" }}>
        {title}
      </Text>
      <Text selectable style={{ color: "rgba(59, 42, 26, 0.70)", fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
        {subtitle}
      </Text>
    </View>
  );
}

export function MeadowInput({
  accessibilityLabel,
  onChangeText,
  placeholder,
  secureTextEntry,
  value,
  right,
}: {
  accessibilityLabel: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={{ position: "relative" }}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize={accessibilityLabel === "Email" ? "none" : "sentences"}
        keyboardType={accessibilityLabel === "Email" ? "email-address" : "default"}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(59, 42, 26, 0.40)"
        secureTextEntry={secureTextEntry}
        style={{
          backgroundColor: "rgba(238, 232, 220, 0.72)",
          borderColor: "rgba(59, 42, 26, 0.30)",
          borderRadius: meadowTheme.radius.panel,
          borderWidth: 1,
          color: meadowTheme.colors.ink,
          fontFamily: meadowTheme.fonts.body,
          fontSize: 15,
          lineHeight: 22,
          paddingHorizontal: 16,
          paddingRight: right ? 52 : 16,
          paddingVertical: 12,
        }}
        value={value}
      />
      {right ? <View style={{ bottom: 0, justifyContent: "center", position: "absolute", right: 10, top: 0 }}>{right}</View> : null}
    </View>
  );
}

export function PasswordToggle({ hidden, onPress }: { hidden: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={hidden ? "Show password" : "Hide password"} accessibilityRole="button" hitSlop={8} onPress={onPress}>
      <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 18 }}>
        {hidden ? "◯" : "●"}
      </Text>
    </Pressable>
  );
}

export function MeadowSubmitButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(loading) }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: meadowTheme.colors.sage,
        borderRadius: meadowTheme.radius.control,
        minHeight: 50,
        justifyContent: "center",
        opacity: loading ? 0.72 : pressed ? 0.84 : 1,
        paddingVertical: 14,
      })}
    >
      {loading ? (
        <ActivityIndicator color={meadowTheme.colors.linen} />
      ) : (
        <Text selectable={false} style={{ color: meadowTheme.colors.linen, fontFamily: meadowTheme.fonts.body, fontSize: 16, lineHeight: 22 }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function InlineAuthError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <Text selectable style={{ color: "#8B2E2E", fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19, textAlign: "center" }}>
      {message}
    </Text>
  );
}

export function AuthDivider() {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: 12, marginVertical: 2 }}>
      <View style={{ backgroundColor: "rgba(59, 42, 26, 0.22)", flex: 1, height: 1 }} />
      <Text selectable={false} style={{ color: "rgba(59, 42, 26, 0.40)", fontFamily: meadowTheme.fonts.body, fontSize: 13 }}>
        or
      </Text>
      <View style={{ backgroundColor: "rgba(59, 42, 26, 0.22)", flex: 1, height: 1 }} />
    </View>
  );
}
