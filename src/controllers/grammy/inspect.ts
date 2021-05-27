import { itemsFromId } from 'constants/itemsFromId';
import { isEmpty, isFinite, isInteger, isNil } from 'lodash';
import { BuyOrder } from 'models/BuyOrder';
import { extractMatch } from 'utils/extractMatch';
import { makeBadInspect } from 'views/makeBadInspect';
import { makeInspect } from 'views/makeInspect';
import { makeMissingInspect } from 'views/makeMissingInspect';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const inspect: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [itemId, priceString] = extractMatch(ctx.match);
  if (isEmpty(itemId) || isEmpty(priceString)) {
    const text = makeMissingInspect();
    await ctx.reply(text);
    return;
  }

  const item = itemsFromId.get(itemId);
  const price = Number(priceString);
  if (isNil(item) || !isInteger(price) || !isFinite(price) || price < 1) {
    const text = makeBadInspect();
    await ctx.reply(text);
    return;
  }

  const buyOrder = await BuyOrder.query()
    .where({ telegramId, item: item.name })
    .andWhere('amountLeft', '>', 0)
    .andWhere('maxPrice', '>=', price)
    .orderBy('id', 'asc')
    .first();
  if (isNil(buyOrder)) {
    const sumResult = await BuyOrder.query()
      .where({ item: item.name })
      .andWhere('amountLeft', '>', 0)
      .andWhere('maxPrice', '>=', price)
      .sum('quantity') as unknown as [{ sum: number | null }];
    const quantity = sumResult[0].sum ?? 0;
    const text = makeInspect({
      price,
      itemName: item.name,
      quantityAhead: quantity,
    });
    await ctx.reply(text);
    return;
  }

  const aheadSumResult = await BuyOrder.query()
    .where({ item: item.name })
    .andWhere('amountLeft', '>', 0)
    .andWhere('maxPrice', '>=', price)
    .andWhere('id', '<', buyOrder.id)
    .sum('quantity') as unknown as [{ sum: number | null }];

  const behindSumResult = await BuyOrder.query()
    .where({ item: item.name })
    .andWhere('amountLeft', '>', 0)
    .andWhere('maxPrice', '>=', price)
    .andWhere('id', '>', buyOrder.id)
    .sum('quantity') as unknown as [{ sum: number | null }];

  const quantityAhead = aheadSumResult[0].sum ?? 0;
  const quantityBehind = behindSumResult[0].sum ?? 0;
  const text = makeInspect({
    price,
    quantityAhead,
    quantityBehind,
    itemName: item.name,
  });
  await ctx.reply(text);
};

export { inspect };
