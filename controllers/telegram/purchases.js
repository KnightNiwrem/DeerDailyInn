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

const purchases = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in purchases: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in purchases: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  let limit = 10;
  if (!_.isEmpty(params.options)) {
    const userLimit = parseInt(params.options[0]);
    limit = _.isNaN(userLimit) || userLimit < 1 ? limit : Math.max(userLimit, 100);
  }

  return User.query().where('telegramId', telegramId).first()
  .then((user) => {
    const isSuccess = !_.isNil(user) && !_.isNil(user.chtwrsId);
    let purchases = [];
    if (isSuccess) {
      purchases = Deal.query()
      .where('buyerId', user.chtwrsId)
      .limit(limit)
      .orderBy('created_at', 'desc');
    }
    return Promise.all([isSuccess, purchases]);
  })
  .then(([isSuccess, purchases]) => {
    if (!isSuccess) {
      const unregisteredMessage = makeUnregisteredMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', unregisteredMessage);
    } else {
      const purchasesMessage = makePurchasesMessage(chatId, purchases.reverse());
      return bot.sendTelegramMessage('sendMessage', purchasesMessage);
    }
  });
};

module.exports = purchases;
