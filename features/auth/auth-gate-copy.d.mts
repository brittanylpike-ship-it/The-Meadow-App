export function getAuthGateCopy(
  mode: "local" | "supabase",
  isCreating: boolean
): {
  subtitle: string;
  title: string;
  primaryAction: string;
  secondaryAction: string;
};
