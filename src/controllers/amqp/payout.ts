import { Transaction, User } from 'models/mod';
import { bot, sendLog } from 'services/grammy';
import { makeContact } from 'views/makeContact';

const payout = async (content: any) => {
  const transactionId = content.payload.transactionId;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';

  const trx = await User.startTransaction();
  const attributes = {
    apiStatus: content.result,
    status: hasSuccessfulResult ? 'completed' : 'cancelled'
  };
  const [transaction] = await Transaction.query(trx).where('id', transactionId).first().patch(attributes).returning('*');
  const user = await User.query(trx).where('id', transaction.fromId).first();

  if (!hasSuccessfulResult) {
    await user.$query(trx).increment('balance', content.payload.debit.gold);
  }

  const text = hasSuccessfulResult ? `Your withdrawal request is successful! Your new balance is ${user.balance} gold.` : makeContact();
  sendLog(`${hasSuccessfulResult ? "Success" : "Failure"}: User ${user.telegramId} tried to withdraw ${content.payload.debit.gold} gold`);
  await bot.api.sendMessage(user.telegramId, text);
};

export { payout };
