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

const makeDealsMessage = (chatId, deals) => {
  let dealsText = 'Here are your last recorded deals:\n\n';
  deals.forEach((deal, index) => {
    console.log(`${index + 1}: ${deal}\n\n`);
    dealsText += `${index + 1}. ${deal.quantity} ${deal.item} at ${deal.price} gold each\n`;
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
  const telegramId = params.telegramId;
  let limit = 20;
  if (!_.isEmpty(params.options)) {
    const userLimit = parseInt(params.options[0]);
    limit = _.isNaN(userLimit) || userLimit < 1 ? limit : Math.max(userLimit, 200);
  }

  return User.query().where('telegramId', telegramId).first()
  .then((user) => {
    const isSuccess = !_.isNil(user) && !_.isNil(user.chtwrsId);
    let deals = [];
    if (isSuccess) {
      deals = Deal.query()
      .where('buyerId', user.chtwrsId)
      .orWhere('sellerId', user.chtwrsId)
      .limit(limit)
      .orderBy('created_at', 'desc');
    }
    return Promise.all([isSuccess, deals]);
  })
  .then(([isSuccess, deals]) => {
    if (!isSuccess) {
      const unregisteredMessage = makeUnregisteredMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', unregisteredMessage);
    } else {
      const dealsMessage = makeDealsMessage(chatId, deals.reverse());
      return bot.sendTelegramMessage('sendMessage', dealsMessage);
    }
  });
};

module.exports = deals;
