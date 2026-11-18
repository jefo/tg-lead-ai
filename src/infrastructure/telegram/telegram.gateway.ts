// src/infrastructure/telegram/telegram.gateway.ts

import { Telegraf, Markup } from 'telegraf';
import type { UserState } from '../../domain/types';
import { formatResponse } from './format-response';

type InteractionHandler = (input: { userId: string; event: string; data: string }) => Promise<UserState>;
import { dialogFlow } from '../../domain/dialog-flow.config';

/**
 * This gateway is the adapter between the Telegram API and our application's core logic.
 * It handles incoming updates, calls the main use case, and sends back the response.
 */
export const createTelegramGateway = (handleInteraction: InteractionHandler) => {
    const token = process.env.BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error('BOT_TOKEN or TELEGRAM_BOT_TOKEN must be provided in environment variables.');
    }

    const bot = new Telegraf(token);

    // Generic handler for all messages and button callbacks
    const handleUpdate = async (ctx: any) => {
        const userId = ctx.from.id.toString();
        let event: string;
        let data: string;

        if (ctx.message && ctx.message.text) {
            event = ctx.message.text === '/start' ? 'Начать' : ctx.message.text;
            data = ctx.message.text;
        } else if (ctx.callbackQuery && ctx.callbackQuery.data) {
            event = ctx.callbackQuery.data;
            data = ctx.callbackQuery.data;
            ctx.answerCbQuery();
        } else {
            return;
        }

        try {
            const finalState = await handleInteraction({ userId, event, data });
            const { text, buttons } = formatResponse(finalState);

            const keyboard = Markup.inlineKeyboard(
                buttons.map(btn => Markup.button.callback(btn, btn))
            );

            await ctx.replyWithHTML(text, keyboard);

        } catch (error) {
            console.error(`Error handling update for user ${userId}:`, error);
            await ctx.reply('Sorry, something went wrong. Please try again later.');
        }
    };

    bot.start(handleUpdate);
    bot.on('text', handleUpdate);
    bot.on('callback_query', handleUpdate);

    return bot;
}
