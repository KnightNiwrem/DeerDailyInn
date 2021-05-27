import { Transaction, User } from 'models/mod';
import { bot } from 'services/grammy';
import { makeConfirmation } from 'views/makeConfirmation';
import { makeContact } from 'views/makeContact';

const authorizePayment = async (content: any) => {
  const transactionId = content.payload.transactionId;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';

  const trx = await User.startTransaction();
  const transaction = await Transaction.query(trx).where('id', transactionId).first();
  const user = await User.query(trx).where('id', transaction.toId).first();

  const status = hasSuccessfulResult ? 'pending' : 'cancelled';
  await transaction.$query(trx).patch({
    apiStatus: content.result,
    status: status
  });

  const text = hasSuccessfulResult ? makeConfirmation() : makeContact();
  await bot.api.sendMessage(user.telegramId, text);
};

export { authorizePayment };
