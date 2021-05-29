import { apiThrottler } from '@grammyjs/transformer-throttler';
import { Bot } from 'grammy';
import { isSafeInteger } from 'lodash-es';
import { User } from 'models/mod.js';
import { env } from 'services/env.js';

const bot = new Bot(env.BOT_TOKEN);
bot.api.config.use(async (prev, method, payload) => {
  const result = await prev(method, payload);
  if (!payload || !('chat_id' in payload)) {
    return result;
  }

  // @ts-ignore
  const telegramId = Number(payload.chat_id);
  if (!isSafeInteger(telegramId) || telegramId < 0) {
    return result;
  }

  const isBotBlocked = !result.ok && result.error_code === 403;
  if (!isBotBlocked) {
    return result;
  }

  await User.query().where({ telegramId }).patch({ canNotify: false });
  return result;
});
bot.api.config.use(apiThrottler());

const sendLog = async (text: string) => {
  try {
    bot.api.sendMessage(-1001279937491, `Deer Daily Inn | #info | ${text}`);
  } catch (err) {
    console.warn(err);
  }
};

export { bot, sendLog };
