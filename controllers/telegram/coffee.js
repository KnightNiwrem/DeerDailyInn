const _ = require('lodash');
const Promise = require('bluebird');
const { transaction } = require('objection');
const User = require('../../models/user');
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
  [1, 0.9],
  [2, 0.8],
  [3, 0.7],
  [4, 0.6],
  [5, 0.5],
  [6, 0.125],
  [7, 0.03125],
  [8, 0.0078125],
  [9, 0.001953125]
]);

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

    if (user.balance < coffeeCost) {
      const message = makeInsufficientBalanceMessage(chatId, coffeeCost, user.balance);
      bot.sendTelegramMessage('sendMessage', message);
      bot.sendLog(`Failure: User ${user.telegramId} tried to drink some coffee but did not have enough gold`);
      return Promise.reject(`Rejected in coffee: User ${user.telegramId} tried to drink a cup of coffee for ${coffeeCost} gold, but only had ${user.balance} gold in balance.`);
    }

    const currentBuyOrderLimit = user.buyOrderLimit;
    const coffeeSuccessRate = buyOrderLimitToSuccessRate.has(currentBuyOrderLimit) ? buyOrderLimitToSuccessRate.get(currentBuyOrderLimit) : 0;
    const isSuccessfulCoffee = Math.random() < coffeeSuccessRate;
    bot.sendLog(`Success: User ${user.telegramId} drank some coffee for ${coffeeCost} gold`);

    const userAttributes = {
      balance: user.balance - coffeeCost,
      buyOrderLimit: isSuccessfulCoffee ? user.buyOrderLimit + 1 : user.buyOrderLimit
    };
    const updatedUser = await user.$query(transactionObject).patch(userAttributes).returning('*');

    const botUser = await User.query(transactionObject).where('id', 0).first();
    const botAttributes = {
      balance: botUser.balance + coffeeCost
    };
    const updatedBotUser = await botUser.$query(transactionObject).patch(botAttributes).returning('*');

    const transactionAttributes = {
      fromId: user.id,
      quantity: coffeeCost,
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
