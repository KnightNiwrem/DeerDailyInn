import { isNil } from 'lodash-es';
import { Deal, User } from 'models/mod.js';
import { bot } from 'services/grammy.js';
import { makePurchased } from 'views/makePurchased.js';

const deals = async (content: any) => {
  const {
    buyerCastle,
    buyerId,
    buyerName,
    item: itemName,
    price,
    qty: quantity,
    sellerId,
  } = content;

  const seller = await User.query().findOne({ chtwrsId: sellerId });
  if (!isNil(seller) && seller.canNotify) {
    const message = makePurchased({
      buyerCastle,
      buyerName,
      itemName,
      price,
      quantity,
    });
    await bot.api.sendMessage(seller.telegramId, message);
  }

  const buyer = await User.query().findOne({ chtwrsId: buyerId });
  if (isNil(buyer) && isNil(seller)) {
    return;
  }

  await Deal.create({ buyerId, price, quantity, sellerId, item: itemName });
};

export { deals };
