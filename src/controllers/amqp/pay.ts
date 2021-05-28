import { Transaction, User } from 'models/mod.js';
import { bot, sendLog } from 'services/grammy.js';
import { makeContact } from 'views/makeContact.js';

const pay = async (content: any) => {
  const { transactionId } = content.payload;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';

  const trx = await User.startTransaction();
  const transaction = await Transaction.query(trx).where('id', transactionId).first();
  const user = await User.query(trx).where('id', transaction.toId).first();

  let finalBalance = user.balance;
  if (hasSuccessfulResult) {
    finalBalance = user.balance + content.payload.debit.gold;
    await user.$query(trx).increment('balance', content.payload.debit.gold);
  }

  const status = hasSuccessfulResult ? 'completed' : 'cancelled';
  await transaction.$query(trx).patch({
    status,
    apiStatus: content.result,
  });

  const text = hasSuccessfulResult
    ? `Your deposit request is successful! Your new balance is ${finalBalance} gold.`
    : makeContact();
  sendLog(`${hasSuccessfulResult ? 'Success' : 'Failure'}: \
User ${user.telegramId} tried to deposit ${content.payload.debit.gold} gold`);
  await bot.api.sendMessage(user.telegramId, text);
};

export { pay };
