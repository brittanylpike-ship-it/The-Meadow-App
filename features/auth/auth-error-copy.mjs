export function getAuthErrorCopy(error) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "That entrance did not open. Check the email and password, then try again gently.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "There may already be a place here for that email. Try returning instead.";
  }

  return "The gate did not open. Try again gently.";
}
