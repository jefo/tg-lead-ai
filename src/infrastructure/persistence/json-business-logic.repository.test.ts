import { describe, it, expect } from 'bun:test';
import { jsonBusinessLogicRepository } from './json-business-logic.repository';

describe('jsonBusinessLogicRepository', () => {

    it('should return rules for a known industry', async () => {
        // Arrange
        const industry = 'E-commerce';

        // Act
        const rules = await jsonBusinessLogicRepository.getRulesForIndustry(industry);

        // Assert
        expect(rules).not.toBeNull();
        expect(rules?.hypotheses).toBeArray();
        expect(rules?.hypotheses.length).toBeGreaterThan(0);
        expect(rules?.hypotheses[0]!.channel).toBe('Telegram Ads');
    });

    it('should return null for an unknown industry', async () => {
        // Arrange
        const industry = 'NonExistentIndustry';

        // Act
        const rules = await jsonBusinessLogicRepository.getRulesForIndustry(industry);

        // Assert
        expect(rules).toBeNull();
    });

});
