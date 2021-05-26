import { User } from 'models/User';
import { bot } from 'services/grammy';

const grantToken = async (content: any) => {
  const userAttributes = {
    chtwrsId: content.payload.id,
    chtwrsToken: content.payload.token,
  };
  await User
    .query()
    .patch(userAttributes)
    .where('telegramId', content.payload.userId);

  const text = 'Great! That seemed to have worked! You have been authenticated and are ready to go!';
  await bot.api.sendMessage(content.payload.userId, text);
};

export { grantToken };
