export function getHomeSyncNotice(syncSummary) {
  const pendingCount = syncSummary?.pendingCount ?? 0;

  if (pendingCount <= 0) {
    return null;
  }

  return {
    title: "Held here",
    body:
      pendingCount === 1
        ? "One memory is safe on this device and waiting for the wider Meadow."
        : `${pendingCount} memories are safe on this device and waiting for the wider Meadow.`,
  };
}
