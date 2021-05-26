import { itemsFromId } from 'constants/itemsFromId';
import { isEmpty, isFinite, isSafeInteger, isNil } from 'lodash';
import { User } from 'models/User';
import { sendChtwrsMessage } from 'services/amqp';
import { extractMatch } from 'utils/extractMatch';
import { makeWantToBuy } from 'utils/makeWantToBuy';
import { makeBadWtb } from 'views/makeBadWtb';
import { makeUnregistered } from 'views/makeUnregistered';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const wtb: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [itemCode, quantityString, priceString] = extractMatch(ctx.match);
  const quantity = Number(quantityString);
  const price = Number(priceString);

  const item = itemsFromId.get(itemCode);
  const isValidQuantity = isFinite(quantity) && isSafeInteger(quantity) && (quantity > 0);
  const isValidPrice = isFinite(price) && isSafeInteger(price) && (price > 0);
  if (isNil(item) || !isValidQuantity || !isValidPrice) {
    const text = makeBadWtb();
    await ctx.reply(text);
    return;
  }

  const user = await User.query().findOne({ telegramId });
  const chtwrsToken = user?.chtwrsToken ?? '';
  if (isNil(user) || isEmpty(chtwrsToken)) {
    const text = makeUnregistered();
    await ctx.reply(text);
    return;
  }

  const request = makeWantToBuy({
    chtwrsToken,
    itemCode,
    quantity,
    price,
    exactPrice: true,
  });
  await sendChtwrsMessage(request);
};

export { wtb };
