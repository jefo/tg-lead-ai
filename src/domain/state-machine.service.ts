// src/domain/state-machine.service.ts

import { DialogFlowConfig } from "./dialog-flow.config";
import { UserState } from "./types";

/**
 * Represents the result of a state transition.
 * Contains the name of the next state and a list of actions to be executed.
 */
export interface TransitionResult {
  nextStateName: string;
  actionsToExecute: string[];
  // Any data that needs to be passed along with the transition
  // For now, we'll rely on actions to update the state data directly.
}

/**
 * A pure domain service that encapsulates the logic for state transitions.
 * It takes the current state, an event, and the dialog flow configuration,
 * and returns the next state and actions to be performed.
 * It does NOT perform any side effects (like saving state or executing actions).
 */
export const runTransition = (
  config: DialogFlowConfig,
  currentState: UserState,
  event: string,
  data: string // Raw data from the event, if any
): TransitionResult => {
  const stateDefinition = config.states[currentState.name];
  if (!stateDefinition) {
    return { nextStateName: currentState.name, actionsToExecute: [] };
  }

  // Determine the transition based on the event or a wildcard
  const transition = stateDefinition.on?.[event] || stateDefinition.on?.['*'];

  // If no transition is found, stay in the current state and execute no actions.
  // The application layer will decide how to handle this (e.g., repeat message).
  if (!transition) {
    return {
      nextStateName: currentState.name,
      actionsToExecute: [],
    };
  }

  // Actions associated with the transition itself
  const transitionActions = transition.actions || [];

  // Entry actions for the target state
  const nextStateDefinition = config.states[transition.target];
  const entryActions = nextStateDefinition?.entry || [];

  return {
    nextStateName: transition.target,
    actionsToExecute: [...transitionActions, ...entryActions],
  };
};
