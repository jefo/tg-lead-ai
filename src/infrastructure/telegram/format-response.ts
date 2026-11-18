import { dialogFlow } from "../../domain/dialog-flow.config";
import type { UserState } from "../../domain/types";

const escapeHtml = (value: string): string =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const formatResponse = (state: UserState): { text: string; buttons: string[] } => {
	const stateConfig = dialogFlow.states[state.name];
	let text = stateConfig?.message?.text || "Произошла ошибка.";
	const buttons = stateConfig?.message?.buttons || [];

	if (state.name === "PLAN_DELIVERED" && state.plan) {
		const intro = "<b>Ваш маркетинговый план готов</b>\n\n";
		const hypotheses = state.plan.hypotheses
			.map(
				(hypothesis) =>
					`<b>${escapeHtml(hypothesis.channel)}</b>\n` +
					`Сегмент: ${escapeHtml(hypothesis.targetSegment)}\n` +
					`Бюджет: ${Math.round(hypothesis.budget).toLocaleString("ru-RU")} ₽\n` +
					`Обоснование: ${escapeHtml(hypothesis.reason)}`,
			)
			.join("\n\n");
		const outro =
			"\n\nЭтот план — отправная точка. Чтобы обсудить детали, свяжитесь с экспертом.";
		text = intro + hypotheses + outro;
	}

	return { text, buttons };
};
