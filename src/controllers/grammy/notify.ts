import { isNil } from 'lodash-es';
import { User } from 'models/mod.js';
import { makeCanNotify } from 'views/makeCanNotify.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const notify: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const user = await User.query().findOne({ telegramId });
  const canNotify = !user.canNotify;
  await user.$query().patch({ canNotify });

  const text = makeCanNotify(canNotify);
  await ctx.reply(text);
};

export { notify };
