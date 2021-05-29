import { apiThrottler } from '@grammyjs/transformer-throttler';
import { Bot } from 'grammy';
import { env } from 'services/env.js';

const bot = new Bot(env.BOT_TOKEN);
bot.api.config.use(apiThrottler());

const sendLog = async (text: string) => {
  try {
    bot.api.sendMessage(-1001279937491, `Deer Daily Inn | #info | ${text}`);
  } catch (err) {
    console.warn(err);
  }
};

export { bot, sendLog };
