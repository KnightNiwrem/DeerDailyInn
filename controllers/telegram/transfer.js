const _ = require('lodash');
const Promise = require('bluebird');
const { transaction } = require('objection');
const User = require('../../models/user');
const Transaction = require('../../models/transaction');

const makeBadArgumentMessage = (chatId) => {
  const text = 'Invalid syntax. Should be /transfer [fromTelegramId] [toTelegramId] [gold]';

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeUserNotFoundMessage = (chatId, fromUser, toUser) => {
  const text = `Could not find fromUser or toUser.
fromUser: ${_.isNil(fromUser) ? 'Not found' : 'Found'}
toUser: ${_.isNil(toUser) ? 'Not found' : 'Found'}`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeInsufficientBalanceMessage = (chatId, amount, balance) => {
  const text = `Could not transfer ${amount} gold from fromUser! Source user only have ${balance} gold in balance!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeTransferCompletionMessage = (chatId, amount, fromUser, toUser) => {
  const text = `Successfully transferred ${amount} gold from ${fromUser.telegramId} (New balance: ${fromUser.balance}) to ${toUser.telegramId} (New balance: ${toUser.balance}).`

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const transfer = async (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in transfer: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in transfer: Missing telegram user id or chat id');
  }
  if (params.telegramId !== 41284431) {
    return Promise.reject(`Rejected in transfer: User ${params.telegramId} does not have permission`);
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  const [fromTelegramId, toTelegramId, transferAmountString, ] = params.options;
  const transferAmount = parseInt(transferAmountString);
  if (!_.isInteger(transferAmount) || transferAmount < 1) {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const fromUser = await User.query().where('telegramId', fromTelegramId).first();
  const toUser = await User.query().where('telegramId', toTelegramId).first();
  if (_.isNil(fromUser) || _.isNil(toUser)) {
    const message = makeUserNotFoundMessage(chatId, fromUser, toUser);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  if (fromUser.balance < transferAmount) {
    const message = makeInsufficientBalanceMessage(chatId, transferAmount, fromUser.balance);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const transferTransaction = transaction(bot.knex, async (transactionObject) => {
    const fromUserAttributes = {
      balance: fromUser.balance - transferAmount
    };
    const updatedFromUser = await fromUser.$query(transactionObject).patch(fromUserAttributes).returning('*');

    const toUserAttributes = {
      balance: toUser.balance + transferAmount
    };
    const updatedToUser = await toUser.$query(transactionObject).patch(toUserAttributes).returning('*');

    const transactionAttributes = {
      fromId: fromUser.id,
      quantity: transferAmount,
      reason: `Administrator ${params.telegramId} invoked /transfer command to send ${transferAmount} gold from ${fromUser.id} to ${toUser.id}`,
      status: 'completed',
      toId: toUser.id
    };
    const recordedTransaction = await Transaction.create(transactionAttributes, transactionObject);
    return Promise.all([updatedFromUser, updatedToUser, recordedTransaction]);
  });

  return Promise.resolve(transferTransaction)
  .then(([fromUser, toUser, transaction]) => {
    const message = makeTransferCompletionMessage(chatId, transaction.quantity, fromUser, toUser);
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = transfer;
