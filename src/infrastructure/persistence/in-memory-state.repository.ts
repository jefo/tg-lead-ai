// src/infrastructure/persistence/in-memory-state.repository.ts

import { StateRepository } from "../../use-cases/handle-user-interaction.use-case";
import { UserState } from "../../domain/types";

/**
 * A simple in-memory store for user states, using a Map.
 * In a real application, this would be replaced with a database implementation (e.g., Redis, PostgreSQL).
 */
const stateStore: Map<string, UserState> = new Map();

export const inMemoryStateRepository: StateRepository = {
  getState: async (userId: string): Promise<UserState | null> => {
    const state = stateStore.get(userId);
    console.log(`[StateRepo] getState for ${userId}:`, state ? { ...state } : null);
    // Return a copy to prevent accidental mutation
    return state ? { ...state } : null;
  },
  setState: async (userId: string, state: UserState): Promise<void> => {
    console.log(`[StateRepo] setState for ${userId}:`, state);
    stateStore.set(userId, state);
  },
};
