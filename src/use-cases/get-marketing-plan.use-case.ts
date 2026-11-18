/**
 * @file get-marketing-plan.use-case.ts
 * @description Use Case for generating a marketing plan based on user input.
 * This file serves as the primary source of truth for this system capability.
 * It defines the inputs, outputs, and the central orchestration logic, acting
 * as an "executable specification".
 */

// =============================================================================
// L2. System Analysis: Data Requirements [REQ-D-01]
// =============================================================================

/**
 * Represents a single marketing hypothesis. [REQ-F-04]
 */
export interface Hypothesis {
  channel: string;          // e.g., "Telegram Ads", "Yandex Direct"
  targetSegment: string;    // e.g., "Product Managers in IT companies"
  keyNeed: string;          // e.g., "Reduce time on routine tasks"
  budget: number;           // Allocated budget for this hypothesis
  reason: string;           // Justification for why this hypothesis is proposed
  expectedMetrics: {        // Forecasted key metrics
    metricName: string;     // e.g., "CPL (Cost Per Lead)"
    value: string;          // e.g., "1000-1500 RUB"
  }[];
}

/**
 * Represents the final marketing plan delivered to the user.
 */
export interface MarketingPlan {
  hypotheses: Hypothesis[];
}

/**
 * Represents the data collected from the user to generate the plan.
 * This is the input for our use case.
 */
export interface GetMarketingPlanInput {
  industry: string;
  budget: number;
  marketingGoal: string;
}

/**
 * Represents the output of the use case.
 * For now, it's the MarketingPlan itself.
 */
export type GetMarketingPlanOutput = MarketingPlan;


// =============================================================================
// L3. Logical Architecture: Use Case Definition
// =============================================================================

import { generateHypotheses } from "../domain/hypothesis-generator.service";
import { BusinessLogicRepository } from "../domain/ports/business-logic.repository";

// ... (interfaces remain the same)

export type GetMarketingPlanDependencies = {
  businessLogicRepository: BusinessLogicRepository;
};

/**
 * Port: Defines the contract for the GetMarketingPlan use case.
 */
export type GetMarketingPlan = (
  deps: GetMarketingPlanDependencies,
  input: GetMarketingPlanInput
) => Promise<GetMarketingPlanOutput>;

/**
 * @description
 * This is the concrete implementation of the "Получение Маркетингового Плана"
 * use case. It now orchestrates domain services to generate a real plan.
 */
export const getMarketingPlan: GetMarketingPlan = async (deps, input) => {
  console.log(`Generating plan for input:`, JSON.stringify(input, null, 2));

  const rules = await deps.businessLogicRepository.getRulesForIndustry(input.industry);

  if (!rules) {
    console.warn(`No business rules found for industry: ${input.industry}`);
    // Return an empty plan or a default one
    return { hypotheses: [] };
  }

  const plan = generateHypotheses(input, rules);

  return plan;
};

