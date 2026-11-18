import type { NotificationService } from "../../use-cases/qualify-lead.use-case";

export const consoleNotificationService: NotificationService = {
	async send(subject, message) {
		console.log("\n=== LEAD ===");
		console.log(subject);
		console.log(message);
		console.log("============\n");
	},
};
