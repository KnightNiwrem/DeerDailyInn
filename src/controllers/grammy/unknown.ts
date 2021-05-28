import { makeUnknown } from 'views/makeUnknown.js';

import type { Context } from 'grammy';

const unknown = async (ctx: Context) => {
  const text = makeUnknown();
  await ctx.reply(text);
};

export { unknown };
