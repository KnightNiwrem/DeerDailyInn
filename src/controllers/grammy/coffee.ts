import { coffeeCost } from 'constants/coffeeCost.js';
import { isEmpty, isNil } from 'lodash-es';
import { DateTime } from 'luxon';
import { Status } from 'models/Status.js';
import { Transaction } from 'models/Transaction.js';
import { User } from 'models/User.js';
import { sendLog } from 'services/grammy.js';
import { rollCoffeeCheck } from 'utils/rollCoffeeCheck.js';
import { makeCoffee } from 'views/makeCoffee.js';
import { makeInsufficientCoffeeBalance } from 'views/makeInsufficientCoffeeBalance.js';
import { makeUnregistered } from 'views/makeUnregistered.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

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
    await user.$query(trx)
      .patch({
        balance: user.balance - finalCoffeePrice,
        buyOrderLimit: isSuccessfulCoffee ? user.buyOrderLimit + 1 : user.buyOrderLimit,
      })
      .returning('*');

    const botUser = await User.query(trx).findOne({ id: 0 });
    await botUser.$query(trx)
      .increment('balance', finalCoffeePrice)
      .returning('*');

    const transactionProps = {
      fromId: user.id,
      quantity: finalCoffeePrice,
      reason: 'User invoked /coffee command',
      status: 'completed',
      toId: 0,
    };
    await Transaction.query(trx).insert(transactionProps);

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
