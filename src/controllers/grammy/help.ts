import { makeHelp } from 'views/makeHelp.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const help: TextMiddleware<Context> = async ctx => {
  const text = makeHelp();
  await ctx.reply(text);
};

export { help };
