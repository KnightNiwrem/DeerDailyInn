const _ = require('lodash');
const Promise = require('bluebird');
const uuid = require('uuid/v1');

const makeWelcomeMessage = (chatId) => {
  const welcomeText = `\
Welcome! Deer Daily Inn is a Chat Wars app \
brought to you by the Deer Daily team. We hope you \
enjoy your stay at our inn.

For the time being, please authenticate Deer Daily \
Inn by entering the authorization code sent to you \
via @chtwrsbot.

To authenticate, please do:
/auth [auth code from @chtwrsbot]`;
  
  const welcomeMessage = JSON.stringify({
    chat_id: chatId,
    text: welcomeText
  });
  return welcomeMessage;
};

const makeAuthCodeRequest = (telegramId) => {
  const message = JSON.stringify({
    action: 'createAuthCode',
    correlationId: uuid(),
    payLoad: {
      userId: telegramId,
    }
  });
  return message;
};

const start = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in start: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in start: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const telegramId = params.telegramId;
  const chatId = params.chatId;
  const authRequest = makeAuthCodeRequest(telegramId);
  return bot.sendChtwrsMessage(authRequest)
  .then(() => {
    const welcomeMessage = makeWelcomeMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', welcomeMessage);
  });
};

module.exports = start;
