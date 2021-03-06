import { bot } from 'services/grammy.js';

const grantAdditionalOperation = async (content: any) => {
  const telegramId = content.payload.userId;
  await bot.api.sendMessage(telegramId, 'Successfully granted extra permissions!');
};

export { grantAdditionalOperation };
