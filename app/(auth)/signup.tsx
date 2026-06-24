import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import {
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

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordHidden, setPasswordHidden] = React.useState(true);
  const [confirmHidden, setConfirmHidden] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    if (loading) {
      return;
    }

    const validationError = validateSignup(displayName, email, password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (hasSupabaseConfig && supabase) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });

        if (authError) {
          throw authError;
        }

        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").upsert(
            {
              display_name: displayName.trim(),
              email: data.user.email,
              id: data.user.id,
            },
            { onConflict: "id" }
          );

          if (profileError) {
            throw profileError;
          }
        }
      } else {
        await signUp(email, password);
      }

      const onboardingSeen = await AsyncStorage.getItem("meadow_onboarding_complete");
      router.replace(onboardingSeen ? "/(tabs)" : "/onboarding");
    } catch (caught) {
      setError(getAuthErrorCopy(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell layout="tall">
      <AuthTitle title="The Meadow" subtitle="Return to the garden" />

      <View style={{ gap: 12 }}>
        <MeadowInput accessibilityLabel="Display name" onChangeText={setDisplayName} placeholder="Your name" value={displayName} />
        <MeadowInput accessibilityLabel="Email" onChangeText={setEmail} placeholder="your@email.com" value={email} />
        <MeadowInput
          accessibilityLabel="Password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={passwordHidden}
          value={password}
          right={<PasswordToggle hidden={passwordHidden} onPress={() => setPasswordHidden((current) => !current)} />}
        />
        <MeadowInput
          accessibilityLabel="Confirm password"
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          secureTextEntry={confirmHidden}
          value={confirmPassword}
          right={<PasswordToggle hidden={confirmHidden} onPress={() => setConfirmHidden((current) => !current)} />}
        />
      </View>

      <MeadowSubmitButton label="Create My Account" loading={loading} onPress={submit} />
      <InlineAuthError message={error} />

      <Link href="/(auth)/login" asChild>
        <Pressable accessibilityLabel="Already have an account? Sign in" accessibilityRole="link" hitSlop={8} style={{ alignItems: "center" }}>
          <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      </Link>
    </AuthScreenShell>
  );
}

function validateSignup(displayName: string, email: string, password: string, confirmPassword: string) {
  if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
    return "Please complete each field.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (password !== confirmPassword) {
    return "Passwords must match.";
  }

  return null;
}
