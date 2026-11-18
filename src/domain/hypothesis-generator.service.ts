// src/domain/hypothesis-generator.service.ts

import { MarketingPlan, Hypothesis } from "../use-cases/get-marketing-plan.use-case";
import { ClientProfileData } from "./types";
import { BusinessRules } from "./ports/business-logic.repository";

/**
 * This is a pure domain service. Its responsibility is to encapsulate the core
 * business logic of generating a marketing plan.
 */
export const generateHypotheses = (
    profile: ClientProfileData,
    rules: BusinessRules
): MarketingPlan => {
    
    const plan: MarketingPlan = { hypotheses: [] };

    if (!rules || !rules.hypotheses) {
        return plan;
    }

    // For now, a simple logic: take the first two hypotheses and split the budget.
    const budgetPerHypothesis = profile.budget ? profile.budget / rules.hypotheses.length : 0;

    plan.hypotheses = rules.hypotheses.map(h => ({
        ...h,
        budget: budgetPerHypothesis,
        // Mock metrics for now
        expectedMetrics: [
            { metricName: "Leads", value: "10-20" },
            { metricName: "CPL", value: `${Math.round(budgetPerHypothesis / 15)} RUB` }
        ]
    }));

    return plan;
}
