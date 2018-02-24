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

const makeSalesMessage = (chatId, sales) => {
  let salesText = 'Here are your last recorded sales:\n\n';
  sales.forEach((sale, index) => {
    salesText += `${index}. ${sale.quantity} ${sale.item} at ${sale.price} gold each\n`;
  });
  
  const salesMessage = JSON.stringify({
    chat_id: chatId,
    text: salesText
  });
  return salesMessage;
};

const sales = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in sales: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in sales: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  let limit = 10;
  if (!_.isEmpty(params.options)) {
    const userLimit = parseInt(params.options[0]);
    limit = _.isNaN(userLimit) ? limit : Math.max(userLimit, 100);
  }

  return User.query().where('telegramId', telegramId).first()
  .then((user) => {
    const isSuccess = !_.isNil(user) && !_.isNil(user.chtwrsId);
    let deals = [];
    if (isSuccess) {
      deals = Deal.query()
      .where('sellerId', user.chtwrsId)
      .limit(limit)
      .orderBy('created_at', 'desc');
    }
    return Promise.all([isSuccess, deals]);
  })
  .then(([isSuccess, deals]) => {
    if (!isSuccess) {
      const unregisteredMessage = makeUnregisteredMessage(chatId);
      return bot.sendMessage('sendMessage', unregisteredMessage);
    } else {
      const salesMessage = makeSalesMessage(chatId, sales);
      return bot.sendMessage('sendMessage', salesMessage);
    }
  });
};

module.exports = sales;
