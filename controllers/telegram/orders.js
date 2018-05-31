const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');
const BuyOrder = require('../../models/buyOrder');

const normalizeItemName = (itemName) => {
  return itemName.replace(/[^\x00-\x7F]/g, "").trim().toLowerCase();
};

const makeUnregisteredMessage = (chatId) => {
  const unregisteredText = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const unregisteredMessage = JSON.stringify({
    chat_id: chatId,
    text: unregisteredText
  });
  return unregisteredMessage;
};

const makeOrdersMessage = (chatId, orders) => {
  const orderText = orders.map((order) => {
    return `${order.amountLeft} ${order.item} at ${order.maxPrice} gold or less`;
  }).join('\n');
  const text = `Your current buy orders are:

${orderText}`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const orders = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in orders: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in orders: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  return BuyOrder.query()
  .where('amount', '>', 0)
  .andWhere('telegramId', telegramId)
  .then((orders) => {
    const message = makeOrdersMessage(chatId, orders);
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = orders;
