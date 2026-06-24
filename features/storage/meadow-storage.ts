import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createEmptyMeadowState,
  type MeadowState
} from "@/features/memory/evergreen-tree-memory.mjs";
import {
  createEmptySyncQueue,
  markSyncSucceeded,
  queueMeadowMemorySync,
  type MeadowSyncQueue
} from "@/features/sync/sync-queue.mjs";
import { loadRemoteMeadowState } from "@/services/meadow-remote";
import { syncMeadowMemory } from "@/services/meadow-sync";

const meadowStateKey = (userId: string) => `the-meadow:world:${userId}`;
const syncQueueKey = (userId: string) => `the-meadow:sync:${userId}`;

export async function loadMeadowState(user: string | { id: string; email?: string | null }): Promise<MeadowState> {
  const userId = typeof user === "string" ? user : user.id;
  await retryPendingSyncs(userId);

  if (typeof user !== "string") {
    try {
      const remote = await loadRemoteMeadowState(user);
      if (remote) {
        await persistMeadowState(remote);
        return remote;
      }
    } catch {
    }
  }

  const stored = await AsyncStorage.getItem(meadowStateKey(userId));

  if (!stored) {
    return createEmptyMeadowState(userId, new Date().toISOString());
  }

  return JSON.parse(stored) as MeadowState;
}

export async function persistMeadowState(state: MeadowState): Promise<void> {
  await AsyncStorage.setItem(meadowStateKey(state.userId), JSON.stringify(state));
}

export async function queueMeadowStateForSync(state: MeadowState, error: unknown): Promise<void> {
  const queue = await loadSyncQueue(state.userId);
  const next = queueMeadowMemorySync(queue, state, new Date().toISOString(), errorMessage(error));
  await persistSyncQueue(next);
}

export async function retryPendingSyncs(userId: string): Promise<void> {
  const queue = await loadSyncQueue(userId);

  if (queue.pending.length === 0) {
    return;
  }

  let next = queue;

  for (const item of queue.pending) {
    try {
      await syncMeadowMemory(item.state);
      next = markSyncSucceeded(next, item.memoryId);
    } catch (error) {
      next = queueMeadowMemorySync(next, item.state, new Date().toISOString(), errorMessage(error));
    }
  }

  await persistSyncQueue(next);
}

export async function loadSyncQueue(userId: string): Promise<MeadowSyncQueue> {
  const stored = await AsyncStorage.getItem(syncQueueKey(userId));
  return stored ? (JSON.parse(stored) as MeadowSyncQueue) : createEmptySyncQueue(userId);
}

async function persistSyncQueue(queue: MeadowSyncQueue): Promise<void> {
  await AsyncStorage.setItem(syncQueueKey(queue.userId), JSON.stringify(queue));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
