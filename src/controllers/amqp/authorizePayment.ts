import { isNil } from 'lodash-es';
import { Transaction, User } from 'models/mod.js';
import { bot } from 'services/grammy.js';
import { makeConfirmation } from 'views/makeConfirmation.js';
import { makeContact } from 'views/makeContact.js';

const authorizePayment = async (content: any) => {
  const telegramId = content.payload?.userId;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';
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
      .orderBy('id', 'desc')
      .findOne({ status: 'started', toId: user.id });

    if (!isNil(transaction)) {
      const status = hasSuccessfulResult ? 'pending' : 'cancelled';
      await transaction.$query(trx).patch({
        status,
        apiStatus: content.result,
      });
    }
    await trx.commit();

    const text = hasSuccessfulResult ? makeConfirmation() : makeContact();
    await bot.api.sendMessage(user.telegramId, text);
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { authorizePayment };
