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

const makeBadArgumentMessage = (chatId) => {
  const text = `You need to specify a valid amount of gold \
pouches that you would like to deposit!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeRequestAuthorizationMessage = (chatId) => {
  const text = `Great! Please finalize the transaction by \
sending the authorization code from @chtwrsbot!

To authenticate, please do:
/confirm [auth code from @chtwrsbot]`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeAuthorizationRequest = (chtwrsToken, amount) => {
  const message = JSON.stringify({
    action: 'authorizePayment',
    payLoad: {
      amount: {
        pouches: amount
      }
    },
    token: chtwrsToken
  });
  return message;
};

const deposit = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in deposit: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in deposit: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  let depositAmount = parseInt(params.options[0]);
  if (!_.isInteger(depositAmount) || depositAmount < 1) {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  return User.query()
  .where('telegramId', telegramId)
  .first()
  .then((user) => {
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const request = makeAuthorizationRequest(user.chtwrsToken, depositAmount);
    const message = makeRequestAuthorizationMessage(chatId);
    return bot.sendChtwrsMessage(request)
    .then(() => bot.sendTelegramMessage('sendMessage', message));
  });
};

module.exports = deposit;
