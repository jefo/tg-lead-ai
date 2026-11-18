/**
 * @file handle-user-interaction.use-case.ts
 * @description The main orchestrator use case that manages the user dialogue by running
 * a declarative state machine.
 */

import type { GetMarketingPlanInput, MarketingPlan } from "./get-marketing-plan.use-case";
import type { QualifyLeadInput, QualifyLeadOutput } from "./qualify-lead.use-case";
import type { BusinessLogicRepository } from "../domain/ports/business-logic.repository";
import type { UserProfileRepository, NotificationService } from "./qualify-lead.use-case";
import { dialogFlow } from "../domain/dialog-flow.config";
import { UserState } from "../domain/types";
import { runTransition } from "../domain/state-machine.service"; // NEW IMPORT

// =============================================================================
// DTOs
// =============================================================================

export interface HandleInteractionInput {
  userId: string;
  // The event triggered by the user's input (e.g., button text or a command)
  event: string;
  // The raw data from the user's input
  data: string;
}

// =============================================================================
// Dependencies Port
// =============================================================================

export type StateRepository = {
  getState: (userId: string) => Promise<UserState | null>;
  setState: (userId: string, state: UserState) => Promise<void>;
};

// A map of action names to their implementations
export type ActionMap = {
  [key: string]: (deps: any, state: UserState, data: string) => Promise<Partial<UserState>>;
};

export interface HandleInteractionDependencies {
  stateRepository: StateRepository;
  getMarketingPlan: (input: GetMarketingPlanInput) => Promise<MarketingPlan>;
  qualifyLead: (deps: any, input: QualifyLeadInput) => Promise<QualifyLeadOutput>;
  actions: ActionMap;
  businessLogicRepository?: BusinessLogicRepository;
  userProfileRepository?: UserProfileRepository;
  notificationService?: NotificationService;
}

// =============================================================================
// Use Case Definition
// =============================================================================

export type HandleInteraction = (
  deps: HandleInteractionDependencies,
  input: HandleInteractionInput
) => Promise<UserState>; // Return type is now UserState

export const handleInteraction: HandleInteraction = async (deps, input) => {
  const { userId, event, data } = input;

  // 1. Get current state or initialize a new one
  let currentState = await deps.stateRepository.getState(userId);
  if (!currentState || !dialogFlow.states[currentState.name]) {
    currentState = { name: dialogFlow.initial, userId, data: {} };
    await deps.stateRepository.setState(userId, currentState);
  }

  console.log(`User: ${userId}, State: ${currentState.name}, Event: ${event}`);

  // 2. Run the state transition logic (now in the domain service)
  const { nextStateName, actionsToExecute } = runTransition(dialogFlow, currentState, event, data);

  // 3. Execute actions associated with the transition
  let updatedData = { ...currentState.data };
  let entryUpdatedData = {}; // Data updated by entry actions

  for (const actionName of actionsToExecute) {
    const action = deps.actions[actionName];
    if (action) {
      const partialState = await action(
        deps,
        { name: nextStateName, userId: currentState.userId ?? userId, data: updatedData },
        data,
      );
      // Merge data from actions into updatedData
      updatedData = { ...updatedData, ...partialState.data };
      // If the action returns other properties (like 'plan'), merge them into entryUpdatedData
      if (partialState.plan) {
          entryUpdatedData = { ...entryUpdatedData, plan: partialState.plan };
      }
    } else {
      throw new Error(`Action '${actionName}' not implemented`);
    }
  }
  
  // 4. Save the new state
  const finalState: UserState = {
    name: nextStateName,
    userId: currentState.userId ?? userId,
    data: updatedData,
    ...entryUpdatedData,
  };
  await deps.stateRepository.setState(userId, finalState);
  console.log(`New state for user ${userId}: ${finalState.name}`);

  // 5. Return the final state object.
  return finalState;
};
