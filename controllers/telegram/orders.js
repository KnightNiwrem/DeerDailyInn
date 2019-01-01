const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const User = require('../../models/user');
const BuyOrder = require('../../models/buyOrder');
const Status = require('../../models/status');

const normalizeItemName = (itemName) => {
  return itemName.replace(/[^\x00-\x7F]/g, "").trim().toLowerCase();
};

const processOrders = async (orders) => {
  const ordersToAheadMap = new Map();
  for (order of orders) {
    const ordersAhead = await BuyOrder.query()
    .where('item', order.item)
    .andWhere('amountLeft', '>', 0)
    .andWhere('id', '<', order.id);

    const countAheads = ordersAhead.reduce((total, nextOrder) => {
      return total + nextOrder.amountLeft;
    }, 0);

    ordersToAheadMap.set(order, countAheads);
  }
  return ordersToAheadMap;
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

const makeOrdersMessage = (chatId, buyOrderLimit, ordersToAheadMap) => {
  const orderLines = [...ordersToAheadMap.entries()].map(([order, countAhead]) => {
    return `${order.amountLeft} ${order.item} at ${order.maxPrice} gold or less (Est. ${countAhead} ahead of you in buy order queue)`;
  });
  const text = `Active Buy Orders (${orderLines.length}/${buyOrderLimit}):

${orderLines.join('\n')}`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const orders = async (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in orders: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in orders: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;


  const orders = await BuyOrder.query()
  .where('amountLeft', '>', 0)
  .andWhere('telegramId', telegramId);
  const ordersToAheadMap = await processOrders(orders);

  const now = moment();
  const user = await User.query().where('telegramId', telegramId).first();
  const boosts = await Status.query()
  .whereNotNull('deltaBuyOrderLimit')
  .andWhere('telegramId', telegramId)
  .andWhere('startAt', '<', now.toISOString())
  .andWhere('expireAt', '>', now.toISOString());
  const totalActiveBuyOrderBoost = activeBuyOrderBoosts.reduce((total, next) => {
    return total + next.deltaBuyOrderLimit;
  }, 0);
  const userBuyOrderLimit = user.buyOrderLimit + totalActiveBuyOrderBoost;

  const message = makeOrdersMessage(chatId, userBuyOrderLimit, ordersToAheadMap);
  return bot.sendTelegramMessage('sendMessage', message);
};

module.exports = orders;
