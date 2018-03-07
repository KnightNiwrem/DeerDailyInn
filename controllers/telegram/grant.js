const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');

const makeBadArgumentMessage = (chatId) => {
  const text = `Sorry, I think you have either forgotten to \
specify the permission you want to grant, or the specified permission \
is not a valid permission.`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeUserNotAuthenticatedMessage = (chatId) => {
  const text = `Sorry, you need to authenticate @deer_daily_inn_bot \
with /start and /auth [auth code from @chtwrsbot] before you can \
grant additional permissions!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeGrantMessage = (chatId) => {
  const text = `Great! Please send the authorization code \
from @chtwrsbot to complete this action.

To authenticate, please do:
/confirm [auth code from @chtwrsbot]`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeGrantRequest = (chtwrsToken, operation) => {
  const message = JSON.stringify({
    action: 'authAdditionalOperation',
    payLoad: {
      operation: operation
    },
    token: chtwrsToken
  });
  return message;
};

const validOperationsMap = new Map([
  ['profile', 'GetUserProfile'],
  ['stock', 'GetStock']
]);

const grant = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in grant: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in grant: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const telegramId = params.telegramId;
  const chatId = params.chatId;

  let operation = params.options[0].toLowerCase();
  if (validOperationsMap.has(operation)) {
    operation = validOperationsMap.get(operation);
  } else {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  return User.query()
  .where('telegramId', telegramId)
  .first()
  .then((user) => {
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUserNotAuthenticatedMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    } else {
      const request = makeGrantRequest(user.chtwrsToken, operation);
      const message = makeGrantMessage(chatId);
      return bot.sendChtwrsMessage(request)
      .then(() => bot.sendTelegramMessage('sendMessage', message));
    }
  });
};

module.exports = grant;
