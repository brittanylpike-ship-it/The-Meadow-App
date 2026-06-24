export function createEmptySyncQueue(userId) {
  return {
    userId,
    pending: [],
    lastSyncedMemoryId: null,
  };
}

export function queueMeadowMemorySync(queue, state, queuedAt, error) {
  const memoryId = latestMemoryId(state);
  const existing = queue.pending.find((item) => item.memoryId === memoryId);

  if (existing) {
    return {
      ...queue,
      pending: queue.pending.map((item) =>
        item.memoryId === memoryId
          ? {
              ...item,
              state,
              attemptCount: item.attemptCount + 1,
              lastError: error,
              updatedAt: queuedAt,
            }
          : item
      ),
    };
  }

  return {
    ...queue,
    pending: [
      ...queue.pending,
      {
        id: `sync_${memoryId}`,
        memoryId,
        kind: "meadow_memory",
        state,
        attemptCount: 1,
        lastError: error,
        createdAt: queuedAt,
        updatedAt: queuedAt,
      },
    ],
  };
}

export function queueEvergreenSync(queue, state, queuedAt, error) {
  return queueMeadowMemorySync(queue, state, queuedAt, error);
}

export function markSyncSucceeded(queue, memoryId) {
  return {
    ...queue,
    pending: queue.pending.filter((item) => item.memoryId !== memoryId),
    lastSyncedMemoryId: memoryId,
  };
}

export function getSyncQueueSummary(queue) {
  const pendingCount = queue.pending.length;

  if (pendingCount === 0) {
    return {
      pendingCount,
      status: "settled",
      label: "The Meadow is remembered here.",
    };
  }

  return {
    pendingCount,
    status: "waiting",
    label:
      pendingCount === 1
        ? "One memory is waiting for the wider Meadow."
        : `${pendingCount} memories are waiting for the wider Meadow.`,
  };
}

function latestMemoryId(state) {
  const latest = state.memoryObjects[state.memoryObjects.length - 1];
  if (!latest?.id) {
    throw new Error("Cannot queue sync without a remembered memory.");
  }
  return latest.id;
}
