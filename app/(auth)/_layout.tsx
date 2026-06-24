import { Stack } from "expo-router";

import { meadowTheme } from "@/constants/meadow-theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: meadowTheme.colors.linen },
        headerShown: false,
      }}
    />
  );
}
