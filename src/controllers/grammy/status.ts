import { isEmpty, isNil } from 'lodash';
import { DateTime } from 'luxon';
import { User } from 'models/User';
import { Status } from 'models/Status';
import { makeStatus } from 'views/makeStatus';
import { makeUnregistered } from 'views/makeUnregistered';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const status: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const user = await User.findOne({ telegramId });
  const chtwrsToken = user?.chtwrsToken;
  if (isNil(user) || isEmpty(chtwrsToken)) {
    const text = makeUnregistered();
    await ctx.reply(text);
    return;
  }

  const nowISO = DateTime.utc().toISO();
  const activeStatuses = await Status.query()
    .where({ telegramId })
    .andWhere('startAt', '<', nowISO)
    .andWhere('expireAt', '>', nowISO)
    .orderBy('expireAt', 'asc');

  const expiredStatuses = await Status.query()
    .where({ telegramId })
    .andWhere('expireAt', '<', nowISO)
    .orderBy('expireAt', 'desc')
    .limit(5);

  const queuedStatuses = await Status.query()
    .where('telegramId', telegramId)
    .andWhere('startAt', '>', nowISO)
    .orderBy('startAt', 'asc');

  const text = makeStatus({
    activeStatuses,
    expiredStatuses,
    queuedStatuses,
    nowISO,
  });
  await ctx.reply(text);
};

export { status };
