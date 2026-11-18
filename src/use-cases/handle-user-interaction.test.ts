import { describe, it, expect, mock } from 'bun:test';
import { handleInteraction, HandleInteractionDependencies, ActionMap } from './handle-user-interaction.use-case';
import { UserState } from '../domain/types';

// Helper to create mock dependencies
const createMockDeps = (stateRepo?: any, actions?: ActionMap): HandleInteractionDependencies => ({
  stateRepository: stateRepo || {
    getState: mock(async () => null),
    setState: mock(async () => {}),
  },
  actions: actions || {},
  getMarketingPlan: mock(async () => { throw new Error('getMarketingPlan not implemented'); }),
  qualifyLead: mock(async () => { throw new Error('qualifyLead not implemented'); }),
});

describe('handleInteraction Use Case', () => {

  it('should start the dialog from scratch if no state is found', async () => {
    // Arrange
    const mockStateRepo = {
      getState: mock(async () => null), // No state found
      setState: mock(async () => {}),
    };
    const deps = createMockDeps(mockStateRepo);
    const input = { userId: 'new-user', event: 'any-event', data: '' };

    // Act
    const finalState = await handleInteraction(deps, input);

    // Assert
    expect(finalState.name).toBe('AWAITING_START');
    expect(mockStateRepo.setState).toHaveBeenCalledWith('new-user', expect.objectContaining({ name: 'AWAITING_START' }));
  });

  it('should transition from AWAITING_START to AWAITING_INDUSTRY', async () => {
    // Arrange
    const initialState: UserState = { name: 'AWAITING_START', data: {} };
    const mockStateRepo = {
      getState: mock(async () => initialState),
      setState: mock(async () => {}),
    };
    const deps = createMockDeps(mockStateRepo);
    const input = { userId: 'test-user', event: 'Начать', data: '' };

    // Act
    const finalState = await handleInteraction(deps, input);

    // Assert
    expect(finalState.name).toBe('AWAITING_INDUSTRY');
    expect(mockStateRepo.setState).toHaveBeenCalledWith('test-user', expect.objectContaining({ name: 'AWAITING_INDUSTRY' }));
  });

  it('should save industry and transition from AWAITING_INDUSTRY to AWAITING_BUDGET', async () => {
    // Arrange
    const initialState: UserState = { name: 'AWAITING_INDUSTRY', data: {} };
    const mockStateRepo = {
      getState: mock(async () => initialState),
      setState: mock(async () => {}),
    };
    const mockActions: ActionMap = {
      saveIndustry: mock(async (d, s, data) => ({ data: { industry: data } }))
    };
    const deps = createMockDeps(mockStateRepo, mockActions);
    const input = { userId: 'test-user', event: 'E-commerce', data: 'E-commerce' };

    // Act
    const finalState = await handleInteraction(deps, input);

    // Assert
    expect(finalState.name).toBe('AWAITING_BUDGET');
    expect(finalState.data.industry).toBe('E-commerce');
  });

  it('should fail gracefully if a transition action is not implemented', async () => {
    // Arrange
    const initialState: UserState = { name: 'AWAITING_INDUSTRY', data: {} };
    const mockStateRepo = {
      getState: mock(async () => initialState),
      setState: mock(async () => {}),
    };
    // No actions are provided, so saveIndustry will be missing
    const deps = createMockDeps(mockStateRepo, {}); 
    const input = { userId: 'test-user', event: 'E-commerce', data: 'E-commerce' };

    // Act & Assert
    await expect(handleInteraction(deps, input)).rejects.toThrow("Action 'saveIndustry' not implemented");
  });

});
