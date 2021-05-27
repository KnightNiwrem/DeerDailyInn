import { bot } from 'services/grammy';

const authAdditionalOperation = async (content: any) => {
  const telegramId = content.payload.userId;
  const { uuid } = content;

  const text = `Additional permission is required to perform the operation.
Please do:
/authextra ${uuid} {authCode}`;
  await bot.api.sendMessage(telegramId, text);
};

export { authAdditionalOperation };
