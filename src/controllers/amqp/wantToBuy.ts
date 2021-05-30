import { isNil } from 'lodash-es';
import { bot } from 'services/grammy.js';

const wantToBuy = async (content: any) => {
  const { itemName, quantity, userId } = content.payload;
  const hasDetails = !isNil(itemName) && !isNil(quantity);
  const telegramId = userId;
  if (isNil(telegramId)) {
    return;
  }

  const statusCode = content.result.toLowerCase();
  const isSuccessful = statusCode === 'ok';

  if (isSuccessful) {
    const text = `Successfully purchased ${quantity} ${itemName}!`;
    console.log(`${new Date()} | User ${telegramId} | ${text}`);
    await bot.api.sendMessage(telegramId, text);
    return;
  }

  if (!hasDetails) {
    const text = `Could not access exchange: ${content.result}`;
    console.log(`${new Date()} | User ${telegramId} | ${text}`);
    await bot.api.sendMessage(telegramId, text);
    return;
  }

  const text = `Could not buy ${quantity} ${itemName}: ${content.result}`;
  console.log(`${new Date()} | User ${telegramId} | ${text}`);
  await bot.api.sendMessage(telegramId, text);
};

export { wantToBuy };
