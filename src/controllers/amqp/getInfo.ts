import { bot } from 'services/grammy.js';

const getInfo = async (content: any) => {
  await bot.api.sendMessage(41284431, JSON.stringify(content));
};

export { getInfo };
