import { Bot } from 'grammy';
import { env } from 'services/env.js';

const bot = new Bot(env.BOT_TOKEN);

const sendLog = async (
  text: string,
) => bot.api.sendMessage(-1001279937491, `Deer Daily Inn | #info | ${text}`);

export { bot, sendLog };