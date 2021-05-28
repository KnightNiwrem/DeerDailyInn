import { itemsFromId } from 'constants/itemsFromId.js';
import { isEmpty, isFinite, isSafeInteger, isNil } from 'lodash-es';
import { DateTime } from 'luxon';
import { BuyOrder, Status, User } from 'models/mod.js';
import { sendChtwrsMessage } from 'services/amqp.js';
import { extractMatch } from 'utils/extractMatch.js';
import { makeWantToBuy } from 'utils/makeWantToBuy.js';
import { makeBadBuy } from 'views/makeBadBuy.js';
import { makeBuyOrder } from 'views/makeBuyOrder.js';
import { makeBuyOrderLimitExceeded } from 'views/makeBuyOrderLimitExceeded.js';
import { makeDuplicateBuyOrder } from 'views/makeDuplicateBuyOrder.js';
import { makeQuantityLimitExceeded } from 'views/makeQuantityLimitExceeded.js';
import { makeUnregistered } from 'views/makeUnregistered.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const buy: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [itemId, quantityString, priceString] = extractMatch(ctx.match);
  const price = Number(priceString);
  const quantity = Number(quantityString);

  const item = itemsFromId.get(itemId);
  const isValidPrice = isFinite(price) && isSafeInteger(price) && (price > 0);
  const isValidQuantity = isFinite(quantity) && isSafeInteger(quantity) && (quantity > 0);
  if (isNil(item) || !isValidPrice || !isValidQuantity) {
    const text = makeBadBuy();
    await ctx.reply(text);
    throw new Error('Rejected in buy: Bad argument(s).');
  }

  const user = await User.query().findOne({ telegramId });
  const chtwrsId = user?.chtwrsId;
  const isRegistered = !isNil(user) && !isEmpty(chtwrsId);
  if (!isRegistered) {
    const text = makeUnregistered();
    await ctx.reply(text);
    throw new Error(`Rejected in buy: User ${telegramId} is not registered.`);
  }

  const itemName = item.name;
  const itemLimit = item.limit;
  if (quantity > itemLimit) {
    const text = makeQuantityLimitExceeded({ itemLimit, itemName, price, quantity });
    await ctx.reply(text);
    throw new Error(`Rejected in buy: User ${telegramId} quantity limit exceeded for ${itemName}`);
  }

  const pendingBuyOrders = await BuyOrder.query()
    .where({ telegramId })
    .andWhere('amountLeft', '>', 0);
  const hasSimilarBuyOrder = !isNil(pendingBuyOrders.find(buyOrder => buyOrder.item === itemName));
  if (hasSimilarBuyOrder) {
    const text = makeDuplicateBuyOrder({ itemName, price, quantity });
    await ctx.reply(text);
    throw new Error(`Rejected in buy: User ${telegramId} similar item limit exceeded for ${itemName}`);
  }

  const nowString = DateTime.utc().toISO();
  const sumResult = await Status.query()
    .whereNotNull('deltaBuyOrderLimit')
    .andWhere({ telegramId })
    .andWhere('startAt', '<', nowString)
    .andWhere('expireAt', '>', nowString)
    .sum('deltaBuyOrderLimit') as unknown as [{ sum: number }];
  const buyOrderBoostsTotal = sumResult[0]?.sum ?? 0;
  const buyOrderLimit = Math.max(user.buyOrderLimit + buyOrderBoostsTotal, 0);
  if (pendingBuyOrders.length >= buyOrderLimit) {
    const text = makeBuyOrderLimitExceeded({ buyOrderLimit, itemName, price, quantity });
    await ctx.reply(text);
    throw new Error(`Rejected in buy: User ${telegramId} pending buy order limit exceeded for ${itemName}`);
  }

  const testRequest = makeWantToBuy({
    chtwrsToken: user!.chtwrsToken!,
    exactPrice: true,
    itemCode: '01',
    price: 99999,
    quantity: 1,
  });
  await sendChtwrsMessage(testRequest);

  await BuyOrder.query().insert({
    quantity,
    telegramId,
    amountLeft: quantity,
    item: itemName,
    maxPrice: price,
  });
  const text = makeBuyOrder({ itemName, price, quantity });
  await ctx.reply(text);
};

export { buy };
