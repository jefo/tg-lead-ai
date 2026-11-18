// src/use-cases/actions.ts

import { ActionMap } from "./handle-user-interaction.use-case";
import { UserState } from "../domain/types";

/**
 * This map contains the concrete implementations of all actions
 * defined in the dialog-flow.config.ts. The state machine runner
 * will call these functions based on the configuration.
 */
export const actionMap: ActionMap = {
  saveIndustry: async (deps, state, data) => {
    console.log(`[Action] saveIndustry: ${data}`);
    return { data: { ...state.data, industry: data } };
  },

  saveBudget: async (deps, state, data) => {
    console.log(`[Action] saveBudget: ${data}`);
    // In a real app, we'd parse the budget range into a number
    const budgetMap: { [key: string]: number } = {
        '< 100 000 ₽': 50000,
        '100 000 - 500 000 ₽': 300000,
        '> 500 000 ₽': 750000,
    }
    return { data: { ...state.data, budget: budgetMap[data] || 0 } };
  },

  saveGoal: async (deps, state, data) => {
    console.log(`[Action] saveGoal: ${data}`);
    return { data: { ...state.data, marketingGoal: data } };
  },

  triggerPlanGeneration: async (deps, state) => {
    console.log('[Action] triggerPlanGeneration');
    const plan = await deps.getMarketingPlan(state.data);
    // This action returns the generated plan, which will be merged into the final state.
    return { plan };
  },

  notifyOwner: async (deps, state) => {
    console.log('[Action] notifyOwner');
    await deps.qualifyLead(deps, { userId: state.userId ?? 'unknown' });
    return {};
  },
};
