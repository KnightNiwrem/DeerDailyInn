const _ = require('lodash');

const makeMissingArgumentMessage = (chatId) => {
  const missingArgumentText = `Sorry, I think you might have \
forgotten to send the authorization code with this command.`;
  
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

const makeTokenExchangeRequest = (telegramId, authCode) => {
  const message = JSON.stringify({
    action: 'grantToken',
    payload: {
      userId: telegramId,
      authCode: authCode,
    }
  });
  return message;
};

const auth = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in auth: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in auth: Missing telegram user id or chat id');
  }
  if (_.isEmpty(params.options)) {
    const missingArgumentMessage = makeMissingArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', missingArgumentMessage);
  }

  const bot = params.bot;
  const telegramId = params.telegramId;
  const chatId = params.chatId;
  const authCode = params.options[0];
  const tokenExchangeRequest = makeTokenExchangeRequest(telegramId, authCode);
  return bot.sendChtwrsMessage(tokenExchangeRequest)
  .then(() => {
    const authorizationReceiptMessage = makeAuthorizationReceiptMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', authorizationReceiptMessage);
  });
};

module.exports = auth;
