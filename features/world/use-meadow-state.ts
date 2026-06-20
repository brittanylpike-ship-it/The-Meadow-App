import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  markMeadowChapterVisited,
  markMeadowRitualVisited,
  saveEvergreenMemory,
  type EvergreenMemoryInput,
  type MeadowState
} from "@/features/memory/evergreen-tree-memory.mjs";
import { saveFrozenGroundRitualMemory, type FrozenGroundRitualId } from "@/features/memory/frozen-ground-ritual-memory.mjs";
import { saveStormGardenRitualMemory, type StormGardenRitualId } from "@/features/memory/storm-garden-memory.mjs";
import { saveCrossroadsRitualMemory, type CrossroadsRitualId } from "@/features/memory/crossroads-memory.mjs";
import { saveMoorsRitualMemory, type MoorsRitualId } from "@/features/memory/moors-memory.mjs";
import { saveFirstBloomRitualMemory, type FirstBloomRitualId } from "@/features/memory/first-bloom-memory.mjs";
import { getSyncQueueSummary } from "@/features/sync/sync-queue.mjs";
import {
  loadMeadowState,
  loadSyncQueue,
  persistMeadowState,
  queueMeadowStateForSync,
  retryPendingSyncs
} from "@/features/storage/meadow-storage";
import { syncMeadowMemory } from "@/services/meadow-sync";

const queryKey = (userId: string) => ["meadow-state", userId] as const;
const syncQueueKey = (userId: string) => ["meadow-sync-queue", userId] as const;

type MeadowStateUser = string | { id: string; email?: string | null };

export function useMeadowState(user: MeadowStateUser | undefined) {
  const queryClient = useQueryClient();
  const userId = typeof user === "string" ? user : user?.id;

  const query = useQuery({
    enabled: Boolean(userId),
    queryKey: userId ? queryKey(userId) : ["meadow-state", "none"],
    queryFn: () => loadMeadowState(user!)
  });

  const syncQueue = useQuery({
    enabled: Boolean(userId),
    queryKey: userId ? syncQueueKey(userId) : ["meadow-sync-queue", "none"],
    queryFn: () => loadSyncQueue(userId!)
  });

  const retrySync = useMutation({
    mutationFn: async () => {
      await retryPendingSyncs(userId!);
      return loadSyncQueue(userId!);
    },
    onSuccess(next) {
      queryClient.setQueryData(syncQueueKey(next.userId), next);
    }
  });

  const saveMemory = useMutation({
    mutationFn: async (input: Omit<EvergreenMemoryInput, "createdAt">) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = saveEvergreenMemory(current, {
        ...input,
        createdAt: new Date().toISOString()
      });
      await persistMeadowState(next);
      await syncMeadowMemory(next).catch((error) => {
        return queueMeadowStateForSync(next, error).then(() => {
          queryClient.invalidateQueries({ queryKey: syncQueueKey(next.userId) });
        });
      });
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  const markChapterVisited = useMutation({
    mutationFn: async (input: { chapterId: "frozen_ground" | "storm_garden" | "crossroads" | "the_moors" | "first_bloom" }) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = markMeadowChapterVisited(current, input.chapterId, new Date().toISOString());
      await persistMeadowState(next);
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  const markRitualVisited = useMutation({
    mutationFn: async (input: { ritualId: "evergreen_tree" | FrozenGroundRitualId }) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = markMeadowRitualVisited(current, input.ritualId, new Date().toISOString());
      await persistMeadowState(next);
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  const saveFrozenGroundRitual = useMutation({
    mutationFn: async (input: { ritualId: FrozenGroundRitualId; response: string; detail?: string }) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = saveFrozenGroundRitualMemory(current, input.ritualId, {
        response: input.response,
        detail: input.detail,
        createdAt: new Date().toISOString()
      });
      await persistMeadowState(next);
      await syncMeadowMemory(next).catch((error) => {
        return queueMeadowStateForSync(next, error).then(() => {
          queryClient.invalidateQueries({ queryKey: syncQueueKey(next.userId) });
        });
      });
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  const saveStormGardenRitual = useMutation({
    mutationFn: async (input: { ritualId: StormGardenRitualId; response: string; detail?: string }) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = saveStormGardenRitualMemory(current, input.ritualId, {
        response: input.response,
        detail: input.detail,
        createdAt: new Date().toISOString()
      });
      await persistMeadowState(next);
      await syncMeadowMemory(next).catch((error) => {
        return queueMeadowStateForSync(next, error).then(() => {
          queryClient.invalidateQueries({ queryKey: syncQueueKey(next.userId) });
        });
      });
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  const saveCrossroadsRitual = useMutation({
    mutationFn: async (input: { ritualId: CrossroadsRitualId; response: string; detail?: string }) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = saveCrossroadsRitualMemory(current, input.ritualId, {
        response: input.response,
        detail: input.detail,
        createdAt: new Date().toISOString()
      });
      await persistMeadowState(next);
      await syncMeadowMemory(next).catch((error) => {
        return queueMeadowStateForSync(next, error).then(() => {
          queryClient.invalidateQueries({ queryKey: syncQueueKey(next.userId) });
        });
      });
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  const saveMoorsRitual = useMutation({
    mutationFn: async (input: { ritualId: MoorsRitualId; response: string; detail?: string }) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = saveMoorsRitualMemory(current, input.ritualId, {
        response: input.response,
        detail: input.detail,
        createdAt: new Date().toISOString()
      });
      await persistMeadowState(next);
      await syncMeadowMemory(next).catch((error) => {
        return queueMeadowStateForSync(next, error).then(() => {
          queryClient.invalidateQueries({ queryKey: syncQueueKey(next.userId) });
        });
      });
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  const saveFirstBloomRitual = useMutation({
    mutationFn: async (input: { ritualId: FirstBloomRitualId; response: string; detail?: string }) => {
      const current = query.data ?? (await loadMeadowState(userId!));
      const next = saveFirstBloomRitualMemory(current, input.ritualId, {
        response: input.response,
        detail: input.detail,
        createdAt: new Date().toISOString()
      });
      await persistMeadowState(next);
      await syncMeadowMemory(next).catch((error) => {
        return queueMeadowStateForSync(next, error).then(() => {
          queryClient.invalidateQueries({ queryKey: syncQueueKey(next.userId) });
        });
      });
      return next;
    },
    onSuccess(next: MeadowState) {
      queryClient.setQueryData(queryKey(next.userId), next);
    }
  });

  return {
    state: query.data,
    loading: query.isLoading,
    error: query.error,
    saveMemory,
    saveFrozenGroundRitual,
    saveStormGardenRitual,
    saveCrossroadsRitual,
    saveMoorsRitual,
    saveFirstBloomRitual,
    markChapterVisited,
    markRitualVisited,
    syncSummary: syncQueue.data ? getSyncQueueSummary(syncQueue.data) : null,
    retrySync
  };
}
