import { isNil } from 'lodash';
import { BuyOrder, User } from 'models/mod';
import { bot } from 'services/grammy';

const invalidToken = async (content: any) => {
  const chtwrsToken = content.payload.token;
  const user = await User.findOne('chtwrsToken', chtwrsToken);
  if (isNil(user)) {
    return;
  }

  const text = `Revoked token detected. Deregistering you from Deer Daily Inn now - All your settings will be reset. If you would like to register again, please do /start`;
  await bot.api.sendMessage(user.telegramId, text);

  //@ts-ignore
  const updateUser = User.query().patch({ chtwrsToken: null }).where('id', user.id);
  const deleteBuyOrders = BuyOrder.query().delete().where('telegramId', user.telegramId);
  await Promise.all([updateUser, deleteBuyOrders]);
};

export { invalidToken };
