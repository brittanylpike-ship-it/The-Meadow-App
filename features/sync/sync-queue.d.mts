import type { MeadowState } from "@/features/memory/evergreen-tree-memory.mjs";

export type MeadowSyncQueue = {
  userId: string;
  pending: Array<{
    id: string;
    memoryId: string;
    kind: "evergreen_tree_memory";
    state: MeadowState;
    attemptCount: number;
    lastError: string;
    createdAt: string;
    updatedAt: string;
  }>;
  lastSyncedMemoryId: string | null;
};

export function createEmptySyncQueue(userId: string): MeadowSyncQueue;
export function queueEvergreenSync(queue: MeadowSyncQueue, state: MeadowState, queuedAt: string, error: string): MeadowSyncQueue;
export function queueMeadowMemorySync(queue: MeadowSyncQueue, state: MeadowState, queuedAt: string, error: string): MeadowSyncQueue;
export function markSyncSucceeded(queue: MeadowSyncQueue, memoryId: string): MeadowSyncQueue;
export function getSyncQueueSummary(queue: MeadowSyncQueue): {
  pendingCount: number;
  status: "settled" | "waiting";
  label: string;
};
