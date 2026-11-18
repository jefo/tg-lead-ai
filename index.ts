import 'dotenv/config';
// index.ts - The entry point of the application

import { handleInteraction, HandleInteractionDependencies } from "./src/use-cases/handle-user-interaction.use-case";
import { getMarketingPlan } from "./src/use-cases/get-marketing-plan.use-case";
import { qualifyLead } from "./src/use-cases/qualify-lead.use-case";
import { inMemoryStateRepository } from "./src/infrastructure/persistence/in-memory-state.repository";
import { jsonBusinessLogicRepository } from "./src/infrastructure/persistence/json-business-logic.repository";
import { actionMap } from "./src/use-cases/actions";
import { createTelegramGateway } from "./src/infrastructure/telegram/telegram.gateway";
import { createStateProfileRepository } from "./src/infrastructure/persistence/state-profile.repository";
import { consoleNotificationService } from "./src/infrastructure/notifications/console-notification.service";

console.log("Assembling application dependencies...");

// This is a temporary solution for passing dependencies to sub-use-cases.
// In a real app, a proper dependency injection container would be used.
const deps: any = {
  stateRepository: inMemoryStateRepository,
  businessLogicRepository: jsonBusinessLogicRepository,
  userProfileRepository: createStateProfileRepository(inMemoryStateRepository),
  notificationService: consoleNotificationService,
  // We need to pre-bind the dependencies for each use case
  getMarketingPlan: (input: any) => getMarketingPlan(deps, input),
  qualifyLead: (input: any) => qualifyLead(deps, input),
  actions: actionMap,
};

// 1. Create the main handler by currying the dependencies into the use case
const mainHandler = (input: any) => handleInteraction(deps, input);

// 2. Create and launch the Telegram gateway
try {
  console.log("Creating Telegram gateway...");
  const bot = createTelegramGateway(mainHandler);
  
  bot.launch();

  console.log("Bot launched successfully. Press CTRL+C to stop.");

  // 3. Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

} catch (error) {
  console.error("Failed to launch bot:", error);
}
