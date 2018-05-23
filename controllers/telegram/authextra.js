const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');

const makeUnregisteredMessage = (chatId) => {
  const unregisteredText = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const unregisteredMessage = JSON.stringify({
    chat_id: chatId,
    text: unregisteredText
  });
  return unregisteredMessage;
};

const makeMissingArgumentMessage = (chatId) => {
  const missingArgumentText = `Sorry, I think you might have \
forgotten to send the uuid or authorization code with this command.`;
  
  const missingArgumentMessage = JSON.stringify({
    chat_id: chatId,
    text: missingArgumentText
  });
  return missingArgumentMessage;
};

const makeAuthorizationReceiptMessage = (chatId) => {
  const authorizationReceiptText = `Great! Let me check \
if the authorization code supplied is correct.`;
  
  const authorizationReceiptMessage = JSON.stringify({
    chat_id: chatId,
    text: authorizationReceiptText
  });
  return authorizationReceiptMessage;
};

const makeTokenExchangeRequest = (chtwrsToken, uuid, authCode) => {
  const message = JSON.stringify({
    token: chtwrsToken,
    action: 'grantAdditionalOperation',
    payload: {
      requestId: uuid,
      authCode: authCode,
    }
  });
  return message;
};

const authextra = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in authextra: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in authextra: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  const options = params.options;
  const [uuid, authCode] = options;
  if (_.isEmpty(uuid) || _.isEmpty(authCode)) {
    const missingArgumentMessage = makeMissingArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', missingArgumentMessage);
  }

  return User.query()
  .where({ telegramId })
  .first()
  .then((user) => {
    const isSuccess = !_.isNil(user) && !_.isEmpty(user.chtwrsId);
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      bot.sendTelegramMessage('sendMessage', message);
      return Promise.reject(`Rejected in authextra: User ${telegramId} is not registered.`);
    }

    const request = makeTokenExchangeRequest(user.chtwrsToken, uuid, authCode);
    return bot.sendChtwrsMessage(request)
    .then(() => {
      const message = makeAuthorizationReceiptMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    });
  });
};

module.exports = authextra;
