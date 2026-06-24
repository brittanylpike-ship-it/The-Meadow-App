import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("onboarding exists as a four-screen first-launch carousel", () => {
  assert.equal(existsSync("app/onboarding.tsx"), true);

  const source = readFileSync("app/onboarding.tsx", "utf8");

  assert.match(source, /meadow_onboarding_complete/);
  assert.match(source, /FlatList/);
  assert.match(source, /Welcome to The Meadow/);
  assert.match(source, /Five Chapters of Healing/);
  assert.match(source, /A Space That's Yours/);
  assert.match(source, /You Are Not Alone/);
  assert.match(source, /Begin Your Journey/);
  assert.match(source, /AsyncStorage\.setItem\("meadow_onboarding_complete", "true"\)/);
  assert.ok(source.includes('router.replace("/(auth)/login")'));
});

test("auth group contains login, signup, and forgot-password screens", () => {
  for (const file of ["app/(auth)/_layout.tsx", "app/(auth)/login.tsx", "app/(auth)/signup.tsx", "app/(auth)/forgot-password.tsx"]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }

  const login = readFileSync("app/(auth)/login.tsx", "utf8");
  const signup = readFileSync("app/(auth)/signup.tsx", "utf8");
  const forgot = readFileSync("app/(auth)/forgot-password.tsx", "utf8");
  const shell = readFileSync("components/auth/auth-screen-shell.tsx", "utf8");

  assert.match(login, /signInWithPassword/);
  assert.match(login, /enterCreatorPreview/);
  assert.match(login, /NODE_ENV === "production"/);
  assert.match(login, /Forgot password\?/);
  assert.ok(login.includes('router.replace("/(tabs)")'));
  assert.match(shell, /KeyboardAvoidingView/);
  assert.match(login, /accessibilityLabel="Email"/);

  assert.match(signup, /signUp/);
  assert.match(signup, /display_name/);
  assert.match(signup, /from\("profiles"\)\.upsert/);
  assert.match(signup, /Password must be at least 8 characters\./);
  assert.match(signup, /Passwords must match\./);

  assert.match(forgot, /resetPasswordForEmail/);
  assert.match(forgot, /meadow:\/\/reset-password/);
  assert.match(forgot, /Check your inbox/);
});

test("root and tab shell route auth screens without bottom navigation", () => {
  const root = readFileSync("app/_layout.tsx", "utf8");
  const tabBar = readFileSync("components/meadow-tab-bar.tsx", "utf8");

  assert.equal(existsSync("app/index.tsx"), true);
  assert.match(readFileSync("app/index.tsx", "utf8"), /<Redirect href="\/\(tabs\)" \/>/);
  assert.match(root, /<Stack\.Screen name="onboarding" options=\{\{ headerShown: false \}\}/);
  assert.ok(root.includes('<Stack.Screen name="(auth)" options={{ headerShown: false }} />'));
  assert.match(root, /AuthRouteObserver/);
  assert.match(root, /onAuthStateChange/);
  assert.match(root, /meadow_onboarding_complete/);
  assert.match(root, /isSeededQaSession/);
  assert.match(root, /readLocalSessionSnapshot/);
  assert.ok(tabBar.includes('pathname.startsWith("/(auth)")'));
});
