import { isFinite, isInteger, isNil } from 'lodash-es';
import { User } from 'models/User.js';
import { Transaction } from 'models/Transaction.js';
import { extractMatch } from 'utils/extractMatch.js';
import { makeBadTransfer } from 'views/makeBadTransfer.js';
import { makeInsufficientTransferBalance } from 'views/makeInsufficientTransferBalance.js';
import { makeTransfer } from 'views/makeTransfer.js';
import { makeTransferNotFound } from 'views/makeTransferNotFound.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const transfer: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (telegramId !== 41284431) {
    console.warn(`Rejected in transfer: User ${telegramId} does not have permission`);
    return;
  }

  const [fromId, toId, amountString] = extractMatch(ctx.match);
  const amount = Number(amountString);
  if (!isFinite(amount) || !isInteger(amount) || amount < 1) {
    const text = makeBadTransfer();
    await ctx.reply(text);
    return;
  }

  const fromUser = await User.query().findOne({ telegramId: fromId });
  const toUser = await User.query().findOne({ telegramId: toId });
  if (isNil(fromUser) || isNil(toUser)) {
    const text = makeTransferNotFound({ fromUser, toUser });
    await ctx.reply(text);
    return;
  }

  if (fromUser.balance < amount) {
    const text = makeInsufficientTransferBalance({
      amount,
      balance: fromUser.balance,
    });
    await ctx.reply(text);
    return;
  }

  const trx = await User.startTransaction();
  try {
    const updatedFromUser = await fromUser.$query(trx)
      .decrement('balance', amount)
      .returning('*');
    const updatedToUser = await toUser.$query(trx)
      .increment('balance', amount)
      .returning('*');
    const recordedTransaction = await Transaction.query(trx)
      .insert({
        fromId: fromUser.id,
        quantity: amount,
        reason: `Administrator ${telegramId} invoked /transfer command \
    to send ${amount} gold from ${fromUser.id} to ${toUser.id}`,
        status: 'completed',
        toId: toUser.id,
      })
      .returning('*');
    await trx.commit();

    const text = makeTransfer({
      amount: recordedTransaction.quantity,
      fromUser: updatedFromUser,
      toUser: updatedToUser,
    });
    await ctx.reply(text);
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { transfer };
