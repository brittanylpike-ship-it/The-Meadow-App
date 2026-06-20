export function getHomeSyncNotice(
  syncSummary: { pendingCount: number; status: string } | undefined | null
): {
  title: string;
  body: string;
} | null;
