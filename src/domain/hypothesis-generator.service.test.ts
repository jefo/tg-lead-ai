import { describe, it, expect } from 'bun:test';
import { generateHypotheses } from './hypothesis-generator.service';
import { ClientProfileData } from './types';
import { BusinessRules } from './ports/business-logic.repository';

describe('generateHypotheses Domain Service', () => {

    it('should generate a plan with hypotheses based on rules', () => {
        // Arrange
        const profile: ClientProfileData = { budget: 100000 };
        const rules: BusinessRules = {
            hypotheses: [
                { channel: 'A', reason: 'R1', targetSegment: 'S1', keyNeed: 'N1' },
                { channel: 'B', reason: 'R2', targetSegment: 'S2', keyNeed: 'N2' },
            ]
        };

        // Act
        const plan = generateHypotheses(profile, rules);

        // Assert
        expect(plan.hypotheses).toHaveLength(2);
        expect(plan.hypotheses[0]!.channel).toBe('A');
    });

    it('should split the budget evenly among hypotheses', () => {
        // Arrange
        const profile: ClientProfileData = { budget: 100000 };
        const rules: BusinessRules = {
            hypotheses: [
                { channel: 'A', reason: 'R1', targetSegment: 'S1', keyNeed: 'N1' },
                { channel: 'B', reason: 'R2', targetSegment: 'S2', keyNeed: 'N2' },
            ]
        };

        // Act
        const plan = generateHypotheses(profile, rules);

        // Assert
        expect(plan.hypotheses[0]!.budget).toBe(50000);
        expect(plan.hypotheses[1]!.budget).toBe(50000);
    });

    it('should return an empty plan if no rules are provided', () => {
        // Arrange
        const profile: ClientProfileData = { budget: 100000 };
        const rules: BusinessRules = { hypotheses: [] };

        // Act
        const plan = generateHypotheses(profile, rules);

        // Assert
        expect(plan.hypotheses).toBeEmpty();
    });

});
