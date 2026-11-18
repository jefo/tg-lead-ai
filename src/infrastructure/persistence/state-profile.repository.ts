import type { UserProfileRepository } from "../../use-cases/qualify-lead.use-case";
import type { StateRepository } from "../../use-cases/handle-user-interaction.use-case";

export const createStateProfileRepository = (
	stateRepository: StateRepository,
): UserProfileRepository => ({
	async findByUserId(userId) {
		const state = await stateRepository.getState(userId);
		if (!state?.plan || !state.data.industry) return null;

		return {
			profile: {
				industry: state.data.industry,
				budget: state.data.budget ?? 0,
				marketingGoal: state.data.marketingGoal ?? "не указана",
			},
			plan: state.plan,
		};
	},
});
