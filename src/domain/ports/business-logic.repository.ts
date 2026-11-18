// src/domain/ports/business-logic.repository.ts

import { Hypothesis } from "../../use-cases/get-marketing-plan.use-case";

export type BusinessRules = {
  hypotheses: Omit<Hypothesis, 'budget' | 'expectedMetrics'>[];
};

export type BusinessLogicRepository = {
  getRulesForIndustry: (industry: string) => Promise<BusinessRules | null>;
};
