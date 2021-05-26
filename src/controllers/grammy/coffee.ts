import { coffeeCost } from 'constants/coffeeCost';
import { isEmpty, isNil } from 'lodash';
import { DateTime } from 'luxon';
import { Status } from 'models/Status';
import { Transaction } from 'models/Transaction';
import { User } from 'models/User';
import { sendLog } from 'services/grammy';
import { rollCoffeeCheck } from 'utils/rollCoffeeCheck';
import { makeCoffee } from 'views/makeCoffee';
import { makeInsufficientCoffeeBalance } from 'views/makeInsufficientCoffeeBalance';
import { makeUnregistered } from 'views/makeUnregistered';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const coffee: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const trx = await User.startTransaction();
  try {
    const user = await User.query(trx).findOne({ telegramId });
    const chtwrsToken = user?.chtwrsToken;
    if (isNil(user) || isEmpty(chtwrsToken)) {
      const text = makeUnregistered();
      await ctx.reply(text);
      throw new Error(`Rejected in coffee: User ${telegramId} is not registered.`);
    }

    const nowString = DateTime.utc().toISO();
    const activeCoffeeBoosts = await Status.query(trx)
      .whereNotNull('deltaCoffeePrice')
      .andWhere({ telegramId })
      .andWhere('startAt', '<', nowString)
      .andWhere('expireAt', '>', nowString);
    const totalActiveCoffeeBoost = activeCoffeeBoosts.reduce(
      (total, next) => total + next.deltaCoffeePrice,
      0,
    );
    const finalCoffeePrice = Math.max(coffeeCost + totalActiveCoffeeBoost, 0);
    if (user.balance < finalCoffeePrice) {
      const text = makeInsufficientCoffeeBalance({ balance: user.balance, cost: finalCoffeePrice });
      await ctx.reply(text);
      await sendLog(`Failure: User ${telegramId} tried to drink some coffee but did not have enough gold (Cost: ${finalCoffeePrice} gold)`);
      throw new Error(`Rejected in coffee: User ${telegramId} tried to drink a cup of coffee for ${finalCoffeePrice} gold, but only had ${user.balance} gold in balance.`);
    }

    const isSuccessfulCoffee = rollCoffeeCheck(user.buyOrderLimit);
    const updatedUser = await user.$query(trx)
      .decrement('balance', finalCoffeePrice)
      .increment('buyOrderLimit', isSuccessfulCoffee ? 1 : 0)
      .returning('*');

    const botUser = await User.query(trx).findOne({ id: 0 });
    const updatedBotUser = await botUser.$query(trx)
      .increment('balance', finalCoffeePrice)
      .returning('*');

    const transactionProps = {
      fromId: user.id,
      quantity: finalCoffeePrice,
      reason: 'User invoked /coffee command',
      status: 'completed',
      toId: 0,
    };
    const recordedTransaction = await Transaction.query(trx).insert(transactionProps);

    const text = makeCoffee(isSuccessfulCoffee);
    await ctx.reply(text);
    await sendLog(`Success: User ${telegramId} drank some coffee for ${finalCoffeePrice} gold`);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export { coffee };
