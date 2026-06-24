import { Link } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthScreenShell,
  AuthTitle,
  InlineAuthError,
  MeadowInput,
  MeadowSubmitButton,
} from "@/components/auth/auth-screen-shell";
import { meadowTheme } from "@/constants/meadow-theme";
import { hasSupabaseConfig, supabase } from "@/services/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    if (loading) {
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (hasSupabaseConfig && supabase) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: "meadow://reset-password" });
        if (resetError) {
          throw resetError;
        }
      }

      setSent(true);
    } catch {
      setError("We could not send that link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell>
      {sent ? (
        <View style={{ alignItems: "center", gap: 14 }}>
          <Text selectable={false} style={{ fontSize: 34, lineHeight: 38 }}>
            🍃
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.header, fontSize: 24, lineHeight: 30, textAlign: "center" }}>
            Check your inbox
          </Text>
          <Text selectable style={{ color: meadowTheme.colors.ink, fontFamily: meadowTheme.fonts.body, fontSize: 15, lineHeight: 23, textAlign: "center" }}>
            A reset link is on its way.
          </Text>
          <BackToSignIn />
        </View>
      ) : (
        <>
          <AuthTitle title="Reset Your Password" subtitle="We'll send a link to your email." />
          <MeadowInput accessibilityLabel="Email" onChangeText={setEmail} placeholder="your@email.com" value={email} />
          <MeadowSubmitButton label="Send Reset Link" loading={loading} onPress={submit} />
          <InlineAuthError message={error} />
          <BackToSignIn />
        </>
      )}
    </AuthScreenShell>
  );
}

function BackToSignIn() {
  return (
    <Link href="/(auth)/login" asChild>
      <Pressable accessibilityLabel="Back to Sign In" accessibilityRole="link" hitSlop={8} style={{ alignItems: "center" }}>
        <Text selectable={false} style={{ color: meadowTheme.colors.sage, fontFamily: meadowTheme.fonts.body, fontSize: 14, lineHeight: 21 }}>
          Back to Sign In
        </Text>
      </Pressable>
    </Link>
  );
}
