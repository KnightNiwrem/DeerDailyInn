import { makeHelp } from 'views/makeHelp';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const help: TextMiddleware<Context> = async ctx => {
  const text = makeHelp();
  await ctx.reply(text);
};

export { help };
