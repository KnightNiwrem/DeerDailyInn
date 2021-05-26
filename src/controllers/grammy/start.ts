import { isNil } from 'lodash';
import { sendChtwrsMessage } from 'services/amqp';
import { makeCreateAuthCode } from 'utils/makeCreateAuthCode';
import { makeWelcome } from 'views/makeWelcome';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

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
