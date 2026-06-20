import { Link, router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthDivider,
  AuthScreenShell,
  AuthTitle,
  InlineAuthError,
  MeadowInput,
  MeadowSubmitButton,
  PasswordToggle,
} from "@/components/auth/auth-screen-shell";
import { meadowTheme } from "@/constants/meadow-theme";
import { useAuth } from "@/features/auth/auth-context";
import { getAuthErrorCopy } from "@/features/auth/auth-error-copy.mjs";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export default function LoginScreen() {
  const { enterCreatorPreview, signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordHidden, setPasswordHidden] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function enterCreatorPlace() {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    await enterCreatorPreview();
    router.replace("/(tabs)");
  }

  async function submit() {
    if (loading) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (hasSupabaseConfig && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) {
          throw authError;
        }
      } else {
        await signIn(email, password);
      }

      router.replace("/(tabs)");
    } catch (caught) {
      setError(getAuthErrorCopy(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell>
      <AuthTitle title="The Meadow" subtitle="Return to the garden" />

      <View style={{ gap: 12 }}>
        <MeadowInput accessibilityLabel="Email" onChangeText={setEmail} placeholder="your@email.com" value={email} />
        <MeadowInput
          accessibilityLabel="Password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={passwordHidden}
          value={password}
          right={<PasswordToggle hidden={passwordHidden} onPress={() => setPasswordHidden((current) => !current)} />}
        />
      </View>

      <Link href="/(auth)/forgot-password" asChild>
        <Pressable accessibilityLabel="Forgot password?" accessibilityRole="link" hitSlop={8} style={{ alignSelf: "flex-end", marginTop: -6 }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 13, lineHeight: 19 }}>
            Forgot password?
          </Text>
        </Pressable>
      </Link>

      {process.env.NODE_ENV !== "production" ? (
        <Pressable
          accessibilityLabel="Enter creator mode"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => void enterCreatorPlace()}
          style={({ pressed }) => ({
            alignItems: "center",
            borderColor: "rgba(61, 90, 62, 0.42)",
            borderRadius: meadowTheme.radius.control,
            borderWidth: 1,
            opacity: pressed ? 0.74 : 1,
            paddingVertical: 12,
          })}
        >
          <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 20 }}>
            Creator entry
          </Text>
        </Pressable>
      ) : null}

      <MeadowSubmitButton label="Sign In" loading={loading} onPress={submit} />
      <InlineAuthError message={error} />
      <AuthDivider />

      <Link href="/(auth)/signup" asChild>
        <Pressable accessibilityLabel="Create an account" accessibilityRole="link" hitSlop={8} style={{ alignItems: "center" }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
            Create an account
          </Text>
        </Pressable>
      </Link>
    </AuthScreenShell>
  );
}
