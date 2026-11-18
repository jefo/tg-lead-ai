import { describe, expect, it } from "bun:test";
import { handleInteraction } from "../src/use-cases/handle-user-interaction.use-case";
import type { HandleInteractionDependencies } from "../src/use-cases/handle-user-interaction.use-case";
import { getMarketingPlan } from "../src/use-cases/get-marketing-plan.use-case";
import { qualifyLead } from "../src/use-cases/qualify-lead.use-case";
import { actionMap } from "../src/use-cases/actions";
import { inMemoryStateRepository } from "../src/infrastructure/persistence/in-memory-state.repository";
import { jsonBusinessLogicRepository } from "../src/infrastructure/persistence/json-business-logic.repository";
import { createStateProfileRepository } from "../src/infrastructure/persistence/state-profile.repository";
import { consoleNotificationService } from "../src/infrastructure/notifications/console-notification.service";

const createDeps = (): HandleInteractionDependencies => ({
  stateRepository: inMemoryStateRepository,
  businessLogicRepository: jsonBusinessLogicRepository,
  getMarketingPlan: (input) =>
    getMarketingPlan({ businessLogicRepository: jsonBusinessLogicRepository }, input),
  qualifyLead: (d, input) => qualifyLead(d, input),
  actions: actionMap,
  userProfileRepository: createStateProfileRepository(inMemoryStateRepository),
  notificationService: consoleNotificationService,
});

describe("full lead qualification flow", () => {
  it("goes from /start to a qualified lead with a plan", async () => {
    const deps = createDeps();
    const userId = `test-${Date.now()}`;

    await handleInteraction(deps, { userId, event: "Начать", data: "" });
    await handleInteraction(deps, { userId, event: "E-commerce", data: "E-commerce" });
    await handleInteraction(deps, {
      userId,
      event: "100 000 - 500 000 ₽",
      data: "100 000 - 500 000 ₽",
    });
    const planState = await handleInteraction(deps, {
      userId,
      event: "Привлечение новых клиентов",
      data: "Привлечение новых клиентов",
    });

    expect(planState.name).toBe("GENERATING_PLAN");
    expect(planState.plan?.hypotheses.length).toBeGreaterThan(0);

    const delivered = await handleInteraction(deps, {
      userId,
      event: "_PLAN_GENERATED",
      data: "",
    });
    expect(delivered.name).toBe("PLAN_DELIVERED");

    const qualified = await handleInteraction(deps, {
      userId,
      event: "Связаться с экспертом",
      data: "Связаться с экспертом",
    });
    expect(qualified.name).toBe("LEAD_QUALIFIED");
    expect(qualified.userId).toBe(userId);
  });
});
