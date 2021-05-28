import { isEmpty, isNil } from 'lodash-es';
import { User } from 'models/User.js';
import { makeBalance } from 'views/makeBalance.js';
import { makeUnregistered } from 'views/makeUnregistered.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const balance: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const user = await User.query().findOne({ telegramId });
  const chtwrsToken = user?.chtwrsToken;
  const isRegistered = !isNil(user) && !isEmpty(chtwrsToken);
  if (!isRegistered) {
    const text = makeUnregistered();
    await ctx.reply(text);
    throw new Error(`Rejected in balance: User ${telegramId} is not registered.`);
  }

  const text = makeBalance(user!.balance);
  await ctx.reply(text);
};

export { balance };
