import { sendChtwrsMessage } from 'services/amqp.js';
import { makeGetInfo } from 'utils/makeGetInfo.js';
import { makeUnauthorized } from 'views/makeUnauthorized.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const getinfo: TextMiddleware<Context> = async ctx => {
  if (ctx.from?.id !== 41284431) {
    const message = makeUnauthorized();
    await ctx.reply(message);
    return;
  }

  const request = makeGetInfo();
  await sendChtwrsMessage(request);
};

export { getinfo };
