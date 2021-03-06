import { isEmpty, isFinite, isInteger, isNil } from 'lodash-es';
import { Transaction } from 'models/Transaction.js';
import { User } from 'models/User.js';
import { sendChtwrsMessage } from 'services/amqp.js';
import { extractMatch } from 'utils/extractMatch.js';
import { makePayout } from 'utils/makePayout.js';
import { makeBadWithdraw } from 'views/makeBadWithdraw.js';
import { makeInsufficientWithdrawBalance } from 'views/makeInsufficientWithdrawBalance.js';
import { makeUnregistered } from 'views/makeUnregistered.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const withdraw: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [amountString] = extractMatch(ctx.match);
  const amount = Number(amountString);
  if (!isFinite(amount) || !isInteger(amount) || amount < 1) {
    const text = makeBadWithdraw();
    await ctx.reply(text);
    return;
  }

  const trx = await User.startTransaction();
  try {
    const user = await User.query(trx).findOne({ telegramId });
    const chtwrsToken = user?.chtwrsToken ?? '';
    if (isNil(user) || isEmpty(chtwrsToken)) {
      const text = makeUnregistered();
      await ctx.reply(text);
      throw new Error(`Rejected in withdraw: User ${telegramId} is not registered.`);
    }

    const amountInGold = amount * 100;
    if (user.balance < amountInGold) {
      const text = makeInsufficientWithdrawBalance({
        amount: amountInGold,
        balance: user.balance,
      });
      await ctx.reply(text);
      throw new Error(`Rejected in withdraw: User ${telegramId} \
tried to withdraw ${amountInGold} gold but only had ${user.balance} \
gold in balance.`);
    }

    await user.$query(trx)
      .decrement('balance', amountInGold)
      .returning('*');
    const recordedTransaction = await Transaction.query(trx)
      .insert({
        fromId: user.id,
        quantity: amountInGold,
        reason: 'User invoked /withdraw command',
        status: 'pending',
        toId: 0,
      });

    const request = makePayout({
      amount,
      chtwrsToken,
      transactionId: recordedTransaction.id,
    });
    await sendChtwrsMessage(request);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { withdraw };
