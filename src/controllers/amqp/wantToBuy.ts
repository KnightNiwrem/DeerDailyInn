import { invalidRollbackStatusCodes } from 'constants/invalidRollbackStatusCodes';
import { isNil } from 'lodash';
import { BuyOrder } from 'models/mod';
import { bot } from 'services/grammy';

const wantToBuy = async (content: any) => {
  const telegramId = content.payload.userId;
  const { itemName, quantity } = content.payload;
  const hasDetails = !isNil(itemName) && !isNil(quantity);

  const statusCode = content.result.toLowerCase();
  const isSuccessful = statusCode === 'ok';
  const canRollback = !invalidRollbackStatusCodes.has(statusCode);

  if (isSuccessful) {
    const text = `Successfully purchased ${quantity} ${itemName}!`;
    console.log(`${new Date()} | User ${telegramId} | ${text}`);
    await bot.api.sendMessage(telegramId, text);
    return;
  }

  if (!canRollback) {
    const text = hasDetails ? `Could not buy ${quantity} ${itemName}: ${content.result}` : `Could not access exchange: ${content.result}`;
    console.log(`${new Date()} | User ${telegramId} | ${text}`);
    await bot.api.sendMessage(telegramId, text);
    return;
  }

  const targetBuyOrder = await BuyOrder
    .query()
    .where('item', itemName)
    .andWhere('telegramId', telegramId)
    .orderBy('id', 'DESC')
    .first();

  await BuyOrder
    .query()
    .patch({ amountLeft: targetBuyOrder.amountLeft + quantity })
    .where('id', targetBuyOrder.id);

  console.log(`${new Date()} | User ${telegramId} | Could not buy ${quantity} ${itemName}: ${content.result} + Rollback`);
};

export { wantToBuy };
