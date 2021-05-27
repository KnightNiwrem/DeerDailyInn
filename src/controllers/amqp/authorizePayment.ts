import { Transaction, User } from 'models/mod';
import { bot } from 'services/grammy';
import { makeConfirmation } from 'views/makeConfirmation';
import { makeContact } from 'views/makeContact';

const authorizePayment = async (content: any) => {
  const { transactionId } = content.payload;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';

  const trx = await User.startTransaction();
  const transaction = await Transaction
    .query(trx)
    .findOne({ id: transactionId });
  const user = await User
    .query(trx)
    .findOne({ id: transaction.toId });

  const status = hasSuccessfulResult ? 'pending' : 'cancelled';
  await transaction.$query(trx).patch({
    status,
    apiStatus: content.result,
  });

  const text = hasSuccessfulResult ? makeConfirmation() : makeContact();
  await bot.api.sendMessage(user.telegramId, text);
};

export { authorizePayment };
