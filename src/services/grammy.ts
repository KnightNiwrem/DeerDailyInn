import { Bot } from 'grammy';
import { env } from 'services/env';

const bot = new Bot(env.BOT_TOKEN);

const sendLog = async (text: string) => {
  return bot.api.sendMessage(-1001279937491, `Deer Daily Inn | #info | ${text}`);
};

export { bot, sendLog };
