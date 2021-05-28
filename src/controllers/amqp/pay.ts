import { isNil } from 'lodash-es';
import { Transaction, User } from 'models/mod.js';
import { bot, sendLog } from 'services/grammy.js';
import { makeContact } from 'views/makeContact.js';

const pay = async (content: any) => {
  const { payload, result } = content;
  const telegramId = payload?.userId;
  const hasSuccessfulResult = result.toLowerCase() === 'ok';
  if (isNil(telegramId)) {
    return;
  }

  const trx = await User.startTransaction();
  try {
    const user = await User
      .query(trx)
      .findOne({ telegramId });
    const transaction = await Transaction
      .query(trx)
      .orderBy('id', 'DESC')
      .findOne({ status: 'pending', toId: user.id });

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
    await trx.commit();

    const text = hasSuccessfulResult
      ? `Your deposit request is successful! Your new balance is ${finalBalance} gold.`
      : makeContact();
    sendLog(`${hasSuccessfulResult ? 'Success' : 'Failure'}: \
  User ${user.telegramId} tried to deposit ${content.payload.debit.gold} gold`);
    await bot.api.sendMessage(user.telegramId, text);
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { pay };
