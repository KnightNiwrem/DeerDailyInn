const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const { transaction } = require('objection');
const User = require('../../models/user');
const Status = require('../../models/status');
const Transaction = require('../../models/transaction');

const makeUnregisteredMessage = (chatId) => {
  const text = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeInsufficientBalanceMessage = (chatId, cost, balance) => {
  const text = `Sorry! You need at least ${cost} gold to buy a cup of coffee, \ 
but you only have ${balance} gold now.`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeCoffeeMessage = (chatId, isSuccessfulCoffee) => {
  const coffeeText = isSuccessfulCoffee ? `You feel a little more energetic to prowl the markets harder now!` : `But you still feel unsatisfied, somehow...`;
  const text = `You take a sip of your coffee...

${coffeeText}`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const coffeeCost = 10;
const buyOrderLimitToSuccessRate = new Map([
  [0, 1.0],
  [1, 0.81],
  [2, 0.64],
  [3, 0.49],
  [4, 0.36],
  [5, 0.25],
  [6, 0.16],
  [7, 0.09],
  [8, 0.04],
  [9, 0.01]
]);
const buyOrderLimitDefaultSuccessRate = 0.001;

const coffee = async (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in coffee: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in coffee: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  const withdrawTransaction = transaction(bot.knex, async (transactionObject) => {
    const user = await User.query(transactionObject).where('telegramId', telegramId).first();
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      bot.sendTelegramMessage('sendMessage', message);
      return Promise.reject(`Rejected in coffee: User ${telegramId} is not registered.`);
    }

    const now = moment();
    const activeCoffeeBoosts = await Status.query()
    .whereNotNull('deltaCoffeePrice')
    .andWhere('telegramId', telegramId)
    .andWhere('startAt', '<', now.toISOString())
    .andWhere('expireAt', '>', now.toISOString());

    const totalActiveCoffeeBoost = activeCoffeeBoosts.reduce((total, next) => {
      return total + next.deltaCoffeePrice;
    }, 0);
    const finalCoffeePrice = Math.max(coffeeCost + totalActiveCoffeeBoost, 0);

    if (user.balance < finalCoffeePrice) {
      const message = makeInsufficientBalanceMessage(chatId, finalCoffeePrice, user.balance);
      bot.sendTelegramMessage('sendMessage', message);
      bot.sendLog(`Failure: User ${user.telegramId} tried to drink some coffee but did not have enough gold (Cost: ${finalCoffeePrice} gold)`);
      return Promise.reject(`Rejected in coffee: User ${user.telegramId} tried to drink a cup of coffee for ${finalCoffeePrice} gold, but only had ${user.balance} gold in balance.`);
    }

    const currentBuyOrderLimit = user.buyOrderLimit;
    const coffeeSuccessRate = buyOrderLimitToSuccessRate.has(currentBuyOrderLimit) 
      ? buyOrderLimitToSuccessRate.get(currentBuyOrderLimit) 
      : buyOrderLimitDefaultSuccessRate;
    const isSuccessfulCoffee = Math.random() < coffeeSuccessRate;
    bot.sendLog(`Success: User ${user.telegramId} drank some coffee for ${finalCoffeePrice} gold`);

    const userAttributes = {
      balance: user.balance - finalCoffeePrice,
      buyOrderLimit: isSuccessfulCoffee ? user.buyOrderLimit + 1 : user.buyOrderLimit
    };
    const updatedUser = await user.$query(transactionObject).patch(userAttributes).returning('*');

    const botUser = await User.query(transactionObject).where('id', 0).first();
    const botAttributes = {
      balance: botUser.balance + finalCoffeePrice
    };
    const updatedBotUser = await botUser.$query(transactionObject).patch(botAttributes).returning('*');

    const transactionAttributes = {
      fromId: user.id,
      quantity: finalCoffeePrice,
      reason: 'User invoked /coffee command',
      status: 'completed',
      toId: 0
    };
    const recordedTransaction = await Transaction.create(transactionAttributes, transactionObject);
    return Promise.all([isSuccessfulCoffee, updatedUser, recordedTransaction]);
  });

  return Promise.resolve(withdrawTransaction)
  .then(([isSuccessfulCoffee, user, transaction]) => {
    const message = makeCoffeeMessage(chatId, isSuccessfulCoffee, user);
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = coffee;
