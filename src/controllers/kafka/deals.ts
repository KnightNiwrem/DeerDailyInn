import { isNil } from 'lodash';
import { Deal } from 'models/Deal';
import { User } from 'models/User';
import { bot } from 'services/grammy';
import { makePurchased } from 'views/makePurchased';

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

  const seller = await User.findOne('chtwrsId', sellerId);
  if (!isNil(seller)) {
    const message = makePurchased({
      buyerCastle,
      buyerName,
      itemName,
      price,
      quantity,
    });
    await bot.api.sendMessage(seller.telegramId, message);
  }

  const buyer = await User.findOne('chtwrsId', buyerId);
  if (isNil(buyer) && isNil(seller)) {
    return;
  }

  await Deal.create({ buyerId, price, quantity, sellerId, item: itemName });
};

export { deals };
