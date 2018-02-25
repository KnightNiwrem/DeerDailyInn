const _ = require('lodash');
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

const makePurchasesMessage = (chatId, purchases) => {
  let purchasesText = 'Here are your last recorded purchases:\n\n';
  purchases.forEach((purchase) => {
    purchasesText += `${purchase.created_at.toUTCString()}. ${purchase.quantity} ${purchase.item} at ${purchase.price} gold each\n`;
  });
  
  const purchasesMessage = JSON.stringify({
    chat_id: chatId,
    text: purchasesText
  });
  return purchasesMessage;
};

const makeSalesMessage = (chatId, sales) => {
  let salesText = 'Here are your last recorded sales:\n\n';
  sales.forEach((sale) => {
    salesText += `${sale.created_at.toUTCString()}. ${sale.quantity} ${sale.item} at ${sale.price} gold each\n`;
  });
  
  const salesMessage = JSON.stringify({
    chat_id: chatId,
    text: salesText
  });
  return salesMessage;
};

const makeDealsMessage = (chatId, chtwrsId, deals) => {
  let dealsText = 'Here are your last recorded deals:\n\n';
  deals.forEach((deal) => {
    if (deal.buyerId === chtwrsId) {
      dealsText += `${deal.created_at.toUTCString()}: BOUGHT ${deal.quantity} ${deal.item} at ${deal.price} gold each\n`;
    } else {
      dealsText += `${deal.created_at.toUTCString()}: SOLD ${deal.quantity} ${deal.item} at ${deal.price} gold each\n`;
    }
  });
  
  const dealsMessage = JSON.stringify({
    chat_id: chatId,
    text: dealsText
  });
  return dealsMessage;
};



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
  let limit = 20;
  if (!_.isEmpty(params.options)) {
    let userLimit = parseInt(params.options[0]);
    userLimit = _.isNaN(userLimit) || userLimit < 1 ? limit : userLimit;
    userLimit = Math.max(userLimit, 200);
    limit = Math.min(userLimit, limit);
  }

  return User.query().where('telegramId', telegramId).first()
  .then((user) => {
    const isSuccess = !_.isNil(user) && !_.isNil(user.chtwrsId);
    let dealsQuery = [];
    if (isSuccess) {
      dealsQuery = Deal.query();
      if (controllerName === 'purchases') {
        dealsQuery = dealsQuery.where('buyerId', user.chtwrsId);
      } else if (controllerName === 'sales') {
        dealsQuery = dealsQuery.where('sellerId', user.chtwrsId);
      } else {
        dealsQuery = dealsQuery.where('buyerId', user.chtwrsId)
                               .orWhere('sellerId', user.chtwrsId);
      }
      dealsQuery = dealsQuery.limit(limit).orderBy('created_at', 'desc');
    }
    return Promise.all([isSuccess, user.chtwrsId, dealsQuery]);
  })
  .then(([isSuccess, chtwrsId, deals]) => {
    let message = 'This is a default message. If you see this, please notify the developer.';
    if (!isSuccess) {
      message = makeUnregisteredMessage(chatId);
    } else if (controllerName === 'purchases') {
      message = makePurchasesMessage(chatId, deals.reverse());
    } else if (controllerName === 'sales') {
      message = makeSalesMessage(chatId, deals.reverse());
    } else {
      message = makeDealsMessage(chatId, chtwrsId, deals.reverse());
    }
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = deals;
