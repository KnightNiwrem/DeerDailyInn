import { isEmpty, isFinite, isInteger, isNil } from 'lodash';
import { Transaction } from 'models/Transaction';
import { User } from 'models/User';
import { sendChtwrsMessage } from 'services/amqp';
import { extractMatch } from 'utils/extractMatch';
import { makeAuthorizePayment } from 'utils/makeAuthorizePayment';
import { makeBadDeposit } from 'views/makeBadDeposit';
import { makeUnregistered } from 'views/makeUnregistered';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const deposit: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [depositString] = extractMatch(ctx.match);
  const amount = Number(depositString);
  if (!isFinite(amount) || !isInteger(amount) || amount < 1) {
    const text = makeBadDeposit();
    await ctx.reply(text);
    throw new Error('Rejected in deposit: Bad argument(s).');
  }

  const trx = await User.startTransaction();
  try {
    const user = await User.query(trx).findOne({ telegramId });
    const chtwrsToken = user?.chtwrsToken;
    if (isNil(user) || isEmpty(chtwrsToken)) {
      const text = makeUnregistered();
      await ctx.reply(text);
      throw new Error(`Rejected in deposit: User ${telegramId} is not registered.`);
    }

    await Transaction.query(trx)
      .patch({ status: 'cancelled' })
      .whereIn('status', ['pending', 'started'])
      .andWhere({ fromId: 0, toId: user.id });
    const recordedTransaction = await Transaction.query(trx)
      .insert({
        fromId: 0,
        quantity: amount * 100,
        reason: 'User invoked /deposit command',
        status: 'started',
        toId: user.id,
      });

    const request = makeAuthorizePayment({
      amount,
      chtwrsToken: chtwrsToken!,
      transactionId: recordedTransaction.id,
    });
    await sendChtwrsMessage(request);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { deposit };
