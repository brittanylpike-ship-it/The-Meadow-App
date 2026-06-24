import React from "react";
import { Pressable, Text } from "react-native";

import { meadowTheme } from "@/constants/meadow-theme";

type MeadowButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  quiet?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
};

export function MeadowButton({ label, onPress, disabled, quiet, accessibilityHint, accessibilityLabel }: MeadowButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: quiet ? meadowTheme.colors.panelDeep : meadowTheme.colors.sage,
        borderColor: quiet ? meadowTheme.colors.line : meadowTheme.colors.sageDeep,
        borderRadius: meadowTheme.radius.control,
        borderWidth: 1,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        paddingHorizontal: 16,
        paddingVertical: 12
      })}
    >
      <Text
        selectable={false}
        style={{
          color: quiet ? meadowTheme.colors.ink : meadowTheme.colors.linen,
          fontFamily: meadowTheme.fonts.body,
          fontSize: 16,
          lineHeight: 20,
          textAlign: "center"
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
