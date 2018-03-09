const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');

const makeUnregisteredMessage = (chatId) => {
  const text = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};
const makeBalanceMessage = (chatId, balance) => {
  const text = `Balance: ${balance} gold`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const balance = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in balance: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in balance: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  return User.query()
  .where('telegramId', telegramId)
  .first()
  .then((user) => {
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const message = makeBalanceMessage(chatId, user.balance);
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = balance;
