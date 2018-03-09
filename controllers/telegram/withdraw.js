const _ = require('lodash');
const Promise = require('bluebird');
const { transaction } = require('objection');
const User = require('../../models/user');
const Transaction = require('../../models/transaction');
const knex = User.knex();

const makeUnregisteredMessage = (chatId) => {
  const text = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeBadArgumentMessage = (chatId) => {
  const text = `You need to specify a valid amount of gold \
pouches that you would like to withdraw!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeSuccessMessage = (chatId, amount, balance) => {
  const text = `Great! You have withdrawn ${amount} \
gold pouches! Your current balance is ${balance} gold.`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeInsufficientBalanceMessage = (chatId, amount, balance) => {
  const text = `Sorry! You don't have sufficient funds to \
withdraw ${amount} gold pouches! Your current \
balance is ${balance} gold.`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makePayoutRequest = (chtwrsToken, amount, transactionId) => {
  const message = JSON.stringify({
    action: 'payout',
    payLoad: {
      amount: {
        pouches: amount
      },
      message: `From Deer Daily Inn: ${amount} gold pouches`,
      transactionId: `${transactionId}`
    },
    token: chtwrsToken
  });
  return message;
};

const withdraw = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in withdraw: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in withdraw: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  let withdrawalAmount = parseInt(params.options[0]);
  if (!_.isInteger(withdrawalAmount) || withdrawalAmount < 1) {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const withdrawalTransaction = transaction(knex, async (transactionObject) => {
    const user = User.query(transactionObject).where('telegramId', telegramId).first();
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const amountInGold = withdrawalAmount * 100;
    const remainingBalance = user.balance - amountInGold;
    if (remainingBalance < 0) {
      const message = makeInsufficientBalanceMessage(chatId, withdrawalAmount, remainingBalance);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const attributes = {
      fromId: 0,
      isCommitted: true,
      quantity: amountInGold,
      reason: 'User invoked /withdraw command',
      toId: user.id
    };
    const transaction = await Transaction.create(attributes);

    await user.$query(transactionObject).patch({
      balance: remainingBalance
    });

    const request = makePayoutRequest(user.chtwrsToken, withdrawalAmount, transaction.id);
    await bot.sendChtwrsMessage(request);

    const message = makeSuccessMessage(chatId, withdrawalAmount, remainingBalance);
    return bot.sendTelegramMessage('sendMessage', message);
  });

  return Promise.resolve(withdrawalTransaction);
};

module.exports = withdraw;
