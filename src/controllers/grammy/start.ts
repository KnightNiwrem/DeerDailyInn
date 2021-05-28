import { isNil } from 'lodash-es';
import { sendChtwrsMessage } from 'services/amqp.js';
import { makeCreateAuthCode } from 'utils/makeCreateAuthCode.js';
import { makeWelcome } from 'views/makeWelcome.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const start: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const request = makeCreateAuthCode(telegramId);
  await sendChtwrsMessage(request);

  const text = makeWelcome();
  await ctx.reply(text);
};

export { start };
