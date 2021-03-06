import { isNil } from 'lodash-es';
import { Transaction, User } from 'models/mod.js';
import { bot, sendLog } from 'services/grammy.js';
import { makeContact } from 'views/makeContact.js';

const payout = async (content: any) => {
  const { payload, result } = content;
  const hasSuccessfulResult = result.toLowerCase() === 'ok';
  const telegramId = payload?.userId;
  if (isNil(telegramId)) {
    return;
  }

  const trx = await User.startTransaction();
  try {
    const user = await User
      .query(trx)
      .findOne({ telegramId });

    const attributes = {
      apiStatus: content.result,
      status: hasSuccessfulResult ? 'completed' : 'cancelled',
    };
    await Transaction
      .query(trx)
      .where({ status: 'pending', fromId: user.id })
      .orderBy('id', 'desc')
      .first()
      .patch(attributes)
      .returning('*') as unknown as Transaction;

    if (!hasSuccessfulResult) {
      await user.$query(trx).increment('balance', content.payload.debit.gold);
    }
    await trx.commit();

    const text = hasSuccessfulResult ? `Your withdrawal request is successful! Your new balance is ${user.balance} gold.` : makeContact();
    sendLog(`${hasSuccessfulResult ? 'Success' : 'Failure'}: User ${user.telegramId} tried to withdraw ${content.payload.debit.gold} gold`);
    await bot.api.sendMessage(user.telegramId, text);
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { payout };
