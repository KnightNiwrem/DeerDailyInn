import { makeInfo } from 'views/makeInfo.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const info: TextMiddleware<Context> = async ctx => {
  const chatId = ctx.chat?.id;
  const telegramId = ctx.from?.id;
  const text = makeInfo({ chatId, telegramId });
  await ctx.reply(text);
};

export { info };
