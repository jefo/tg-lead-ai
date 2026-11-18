/**
 * @file qualify-lead.use-case.ts
 * @description Use Case for qualifying a user as a lead and notifying the system owner.
 */

import { MarketingPlan, GetMarketingPlanInput } from "./get-marketing-plan.use-case";

// =============================================================================
// DTOs
// =============================================================================

/**
 * Input for the QualifyLead use case.
 * It needs to identify the user to retrieve their full profile.
 */
export interface QualifyLeadInput {
  userId: string;
}

/**
 * Output for the QualifyLead use case.
 */
export interface QualifyLeadOutput {
  success: boolean;
  message: string;
}

// =============================================================================
// Dependencies Port
// =============================================================================

// We'll define more concrete repository interfaces in the domain layer later.
export interface UserProfileRepository {
  findByUserId(userId: string): Promise<{ profile: GetMarketingPlanInput, plan: MarketingPlan } | null>;
}

export interface NotificationService {
  send(subject: string, message: string): Promise<void>;
}

/**
 * Dependencies required by the qualifyLead use case.
 * These will be injected when the use case is called.
 */
export interface QualifyLeadDependencies {
  userProfileRepository: UserProfileRepository;
  notificationService: NotificationService;
}

// =============================================================================
// Use Case Definition
// =============================================================================

/**
 * Port: Defines the contract for the QualifyLead use case.
 */
export type QualifyLead = (
  deps: QualifyLeadDependencies,
  input: QualifyLeadInput
) => Promise<QualifyLeadOutput>;

/**
 * @description
 * Concrete implementation of the QualifyLead use case.
 * Orchestrates fetching user data, formatting it, and sending a notification.
 *
 * @param {QualifyLeadDependencies} deps - The injected dependencies.
 * @param {QualifyLeadInput} input - The input data for the use case.
 * @returns {Promise<QualifyLeadOutput>} The result of the operation.
 */
export const qualifyLead: QualifyLead = async (deps, input) => {
  console.log(`Qualifying lead for user: ${input.userId}`);

  const userData = await deps.userProfileRepository.findByUserId(input.userId);

  if (!userData) {
    console.error(`User profile not found for userId: ${input.userId}`);
    return { success: false, message: "User profile not found." };
  }

  const { profile, plan } = userData;

  // Format the notification message
  const subject = `New Qualified Lead: ${profile.industry}`;
  const message = `
    A new lead has been qualified!

    ## Client Profile ##
    Industry: ${profile.industry}
    Budget: ${profile.budget}
    Goal: ${profile.marketingGoal}

    ## Generated Plan ##
    ${plan.hypotheses.map(h => `- ${h.channel} targeting ${h.targetSegment}`).join("\n    ")}
  `;

  try {
    await deps.notificationService.send(subject, message);
    console.log(`Notification sent for user: ${input.userId}`);
    return { success: true, message: "Notification sent successfully." };
  } catch (error) {
    console.error("Failed to send notification", error);
    return { success: false, message: "Failed to send notification." };
  }
};
