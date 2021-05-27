import { itemsFromName } from 'constants/itemsFromName';
import { isNil } from 'lodash';
import { DateTime } from 'luxon';
import { BuyOrder, User } from 'models/mod';
import { sendChtwrsMessage } from 'services/amqp';
import { makeWantToBuy } from 'utils/makeWantToBuy';

const offers = async (content: any) => {
  const {
    item: itemName,
    price,
    qty: quantity,
    sellerId,
  } = content;

  const buyOrder = await BuyOrder
    .query()
    .where('item', itemName)
    .andWhere('maxPrice', '>=', price)
    .andWhere('amountLeft', '>', 0)
    .orderBy('id')
    .first();
  if (isNil(buyOrder)) {
    return;
  }

  const buyer = await User.query().findOne({ telegramId: buyOrder.telegramId });
  if (isNil(buyer)) {
    return;
  }

  const item = itemsFromName.get(itemName);
  if (isNil(item)) {
    return;
  }

  const amountPurchased = Math.min(quantity, buyOrder.amountLeft);
  await BuyOrder
    .query()
    .patch({ amountLeft: buyOrder.amountLeft - amountPurchased })
    .where('id', buyOrder.id);

  const request = makeWantToBuy({
    price,
    chtwrsToken: buyer.chtwrsToken!,
    exactPrice: true,
    itemCode: item.id,
    quantity: amountPurchased,
  });
  await sendChtwrsMessage(request);

  const nowISO = DateTime.utc().toISO();
  const logText = `${nowISO} | User ${buyer.telegramId} | Bought \
${amountPurchased} ${itemName} at ${price} gold each from Seller ${sellerId}`;
  console.log(logText);
};

export { offers };
