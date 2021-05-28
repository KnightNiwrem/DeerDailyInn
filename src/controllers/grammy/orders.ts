import { isEmpty, isNil } from 'lodash-es';
import { DateTime } from 'luxon';
import { BuyOrder } from 'models/BuyOrder.js';
import { Status } from 'models/Status.js';
import { User } from 'models/User.js';
import { makeOrders } from 'views/makeOrders.js';
import { makeUnregistered } from 'views/makeUnregistered';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const processOrders = async (orders: BuyOrder[]) => {
  const ordersToAheadMap = new Map();
  await Promise.all(orders.map(async order => {
    const sumResult = await BuyOrder.query()
      .where({ item: order.item })
      .andWhere('amountLeft', '>', 0)
      .andWhere('id', '<', order.id)
      .sum('amountLeft') as unknown as [{ sum: number }];
    const countAheads = sumResult[0].sum ?? 0;
    ordersToAheadMap.set(order, countAheads);
  }));
  return ordersToAheadMap;
};

const orders: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const user = await User.query().findOne({ telegramId });
  const chtwrsId = user?.chtwrsId ?? '';
  const isRegistered = !isNil(user) && !isEmpty(chtwrsId);
  if (!isRegistered) {
    const text = makeUnregistered();
    await ctx.reply(text);
    throw new Error(`Rejected in orders: User ${telegramId} is not registered.`);
  }

  const buyOrders = await BuyOrder.query()
    .where('amountLeft', '>', 0)
    .andWhere('telegramId', telegramId);
  const ordersToAheadMap = await processOrders(buyOrders);

  const nowISO = DateTime.utc().toISO();
  const sumResult = await Status.query()
    .whereNotNull('deltaBuyOrderLimit')
    .andWhere({ telegramId })
    .andWhere('startAt', '<', nowISO)
    .andWhere('expireAt', '>', nowISO)
    .sum('deltaBuyOrderLimit') as unknown as [{ sum: number }];
  const totalActiveBuyOrderBoost = sumResult[0].sum ?? 0;
  const buyOrderLimit = Math.max(
    user.buyOrderLimit + totalActiveBuyOrderBoost,
    0,
  );

  const text = makeOrders({ buyOrderLimit, ordersToAheadMap });
  await ctx.reply(text);
};

export { orders };
