import { Transaction, User } from 'models/mod.js';
import { bot } from 'services/grammy.js';
import { makeConfirmation } from 'views/makeConfirmation.js';
import { makeContact } from 'views/makeContact.js';

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
