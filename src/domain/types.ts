// src/domain/types.ts

import { MarketingPlan } from "../use-cases/get-marketing-plan.use-case";

/**
 * Represents the data collected from the user during the dialog.
 */
export interface ClientProfileData {
  industry?: string;
  budget?: number;
  marketingGoal?: string;
}

/**
 * Represents the persistent state of a user's dialog.
 * It includes the state name and the data collected so far.
 */
export type UserState = {
  name: string; // e.g., 'AWAITING_INDUSTRY'
  userId?: string;
  data: ClientProfileData;
  plan?: MarketingPlan;
};
