import { itemsFromId } from 'constants/itemsFromId.js';
import { isNil } from 'lodash-es';
import { BuyOrder } from 'models/BuyOrder.js';
import { extractMatch } from 'utils/extractMatch.js';
import { makeBadCancel } from 'views/makeBadCancel.js';
import { makeCancel } from 'views/makeCancel.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const cancel: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [itemCode] = extractMatch(ctx.match);
  const item = itemsFromId.get(itemCode);
  if (isNil(item)) {
    const text = makeBadCancel();
    await ctx.reply(text);
    throw new Error('Rejected in cancel: Bad argument(s).');
  }

  await BuyOrder.query()
    .patch({ amountLeft: 0 })
    .where({ telegramId, item: item.name })
    .andWhere('amountLeft', '>', 0);

  const text = makeCancel(item.name);
  await ctx.reply(text);
};

export { cancel };
