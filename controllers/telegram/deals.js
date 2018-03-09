const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');
const Deal = require('../../models/deal');

const makeUnregisteredMessage = (chatId) => {
  const unregisteredText = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const unregisteredMessage = JSON.stringify({
    chat_id: chatId,
    text: unregisteredText
  });
  return unregisteredMessage;
};

const makeNotFoundMessage = (chatId) => {
  const notFoundText = `Hmm... I couldn't find any anything. \
Perhaps you have no trade history that matches your search criteria yet.`;

  const notFoundMessage = JSON.stringify({
    chat_id: chatId,
    text: notFoundText
  });
  return notFoundMessage;
};

const makePurchasesMessage = (chatId, purchases) => {
  const purchasesByDate = _.groupBy(purchases, (purchase) => {
    const date = purchase.created_at;
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
  });

  let purchasesText = 'Here are your last recorded purchases:\n\n';
  _.forEach(purchasesByDate, (purchases, date) => {
    purchasesText += `${date}:\n`;
    _.forEach(purchases, (purchase) => {
      const time = purchase.created_at;
      const timeString = `${time.getUTCHours()}:${time.getUTCMinutes()}`;
      purchasesText += `${timeString}: ${purchase.quantity} ${purchase.item} at ${purchase.price} gold each\n`;
    });
    purchasesText += '\n';
  });
  
  const purchasesMessage = JSON.stringify({
    chat_id: chatId,
    text: purchasesText
  });
  return purchasesMessage;
};

const makeSalesMessage = (chatId, sales) => {
  const salesByDate = _.groupBy(sales, (sale) => {
    const date = sale.created_at;
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
  });

  let salesText = 'Here are your last recorded sales:\n\n';
  _.forEach(salesByDate, (sales, date) => {
    salesText += `${date}:\n`;
    _.forEach(sales, (sale) => {
      const time = sale.created_at;
      const timeString = `${time.getUTCHours()}:${time.getUTCMinutes()}`;
      salesText += `${timeString}: ${sale.quantity} ${sale.item} at ${sale.price} gold each\n`;
    });
    salesText += '\n';
  });
  
  const salesMessage = JSON.stringify({
    chat_id: chatId,
    text: salesText
  });
  return salesMessage;
};

const makeDealsMessage = (chatId, chtwrsId, deals) => {
  const dealsByDate = _.groupBy(deals, (deal) => {
    const date = deal.created_at;
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
  });

  let dealsText = 'Here are your last recorded deals:\n\n';
  _.forEach(dealsByDate, (deals, date) => {
    dealsText += `${date}:\n`;
    _.forEach(deals, (deal) => {
      const action = (deal.buyerId === chtwrsId) ? 'BOUGHT' : 'SOLD';
      const time = deal.created_at;
      const timeString = `${time.getUTCHours()}:${time.getUTCMinutes()}`;
      dealsText += `${timeString}: ${action} ${deal.quantity} ${deal.item} at ${deal.price} gold each\n`;
    });
    dealsText += '\n';
  });
  
  const dealsMessage = JSON.stringify({
    chat_id: chatId,
    text: dealsText
  });
  return dealsMessage;
};

const specialSearchMap = new Map([
  ['Scroll of rage', '📕Scroll of Rage'],
  ['Scroll of peace', '📕Scroll of Peace']
]);

const deals = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in deals: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in deals: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const controllerName = params.controllerName;
  const telegramId = params.telegramId;
  const limit = 20;
  
  let searchTerm = _.capitalize(params.options.join(' ').replace(/[^\x00-\x7F]/g, "").trim());
  if (specialSearchMap.has(searchTerm)) {
    searchTerm = specialSearchMap.get(searchTerm);
  }

  return User.query()
  .where('telegramId', telegramId)
  .first()
  .then((user) => {
    const isSuccess = !_.isNil(user) && !_.isEmpty(user.chtwrsId);
    let dealsQuery = [];
    if (isSuccess) {
      dealsQuery = Deal.query();
      dealsQuery = dealsQuery.where(function() {
        if (controllerName === 'purchases') {
          this.where('buyerId', user.chtwrsId);
        } else if (controllerName === 'sales') {
          this.where('sellerId', user.chtwrsId);
        } else {
          this.where('buyerId', user.chtwrsId).orWhere('sellerId', user.chtwrsId);
        }
      });
      if (!_.isEmpty(searchTerm)) {
        dealsQuery = dealsQuery.andWhere('item', searchTerm);
      }
      dealsQuery = dealsQuery.limit(limit).orderBy('created_at', 'desc');
    }
    return Promise.all([isSuccess, user, dealsQuery]);
  })
  .then(([isSuccess, user, deals]) => {
    let message = 'This is a default message. If you see this, please notify the developer.';
    if (!isSuccess) {
      message = makeUnregisteredMessage(chatId);
    } else if (_.isEmpty(deals)) {
      message = makeNotFoundMessage(chatId);
    } else if (controllerName === 'purchases') {
      message = makePurchasesMessage(chatId, deals.reverse());
    } else if (controllerName === 'sales') {
      message = makeSalesMessage(chatId, deals.reverse());
    } else {
      message = makeDealsMessage(chatId, user.chtwrsId, deals.reverse());
    }
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = deals;
