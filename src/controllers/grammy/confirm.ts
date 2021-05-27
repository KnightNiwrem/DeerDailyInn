import { isEmpty, isNil } from 'lodash';
import { Transaction } from 'models/Transaction';
import { User } from 'models/User';
import { sendChtwrsMessage } from 'services/amqp';
import { extractMatch } from 'utils/extractMatch';
import { makePay } from 'utils/makePay';
import { makeConfirmationReceipt } from 'views/makeConfirmationReceipt';
import { makeMissingArgument } from 'views/makeMissingArgument';
import { makeNoPendingDeposit } from 'views/makeNoPendingDeposit';
import { makeUnregistered } from 'views/makeUnregistered';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const confirm: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [confirmationCode] = extractMatch(ctx.match);
  if (isEmpty(confirmationCode)) {
    const text = makeMissingArgument();
    await ctx.reply(text);
    throw new Error('Rejected in confirm: Missing argument(s).');
  }

  const trx = await User.startTransaction();
  try {
    const user = await User.query(trx).findOne({ telegramId });
    const chtwrsToken = user?.chtwrsToken;
    if (isNil(user) || isEmpty(chtwrsToken)) {
      const text = makeUnregistered();
      await ctx.reply(text);
      throw new Error(`Rejected in confirm: User ${telegramId} is not registered.`);
    }

    const transactionProps = {
      fromId: 0,
      status: 'pending',
      toId: user.id,
    };
    const lastPendingDeposit = await Transaction.query(trx)
      .where(transactionProps)
      .orderBy('id', 'desc')
      .first();
    if (isNil(lastPendingDeposit)) {
      const text = makeNoPendingDeposit();
      await ctx.reply(text);
      throw new Error(`Rejected in confirm: User ${telegramId} does not have pending deposit transactions.`);
    }

    await Transaction.query(trx)
      .patch({ status: 'cancelled' })
      .whereIn('status', ['pending', 'started'])
      .andWhere({ fromId: 0, toId: user.id })
      .whereNot('id', lastPendingDeposit.id);

    const amount = lastPendingDeposit.quantity / 100;
    const request = makePay({
      amount,
      confirmationCode,
      chtwrsToken: chtwrsToken!,
      transactionId: `${lastPendingDeposit.id}`,
    });
    await sendChtwrsMessage(request);

    const text = makeConfirmationReceipt();
    await ctx.reply(text);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { confirm };
