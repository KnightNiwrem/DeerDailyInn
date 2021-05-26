import { isNil } from 'lodash';
import { DateTime } from 'luxon';
import { BuyOrder } from 'models/BuyOrder';
import { Status } from 'models/Status';
import { User } from 'models/User';
import { makeOrders } from 'views/makeOrders';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const processOrders = async (orders: BuyOrder[]) => {
  const ordersToAheadMap = new Map();
  for (const order of orders) {
    const sumResult = await BuyOrder.query()
      .where({ item: order.item })
      .andWhere('amountLeft', '>', 0)
      .andWhere('id', '<', order.id)
      .sum('amountLeft') as unknown as [{ sum: number }];
    const countAheads = sumResult[0].sum ?? 0;
    ordersToAheadMap.set(order, countAheads);
  }
  return ordersToAheadMap;
};

const orders: TextMiddleware<Context> = async ctx => {
  const chatId = ctx.chat.id;
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const orders = await BuyOrder.query()
    .where('amountLeft', '>', 0)
    .andWhere('telegramId', telegramId);
  const ordersToAheadMap = await processOrders(orders);

  const nowISO = DateTime.utc().toISO();
  const user = await User.query().findOne({ telegramId });
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
