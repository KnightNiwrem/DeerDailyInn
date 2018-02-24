const _ = require('lodash');

const makeWelcomeMessage = (chatId) => {
  const welcomeText = `\
Welcome! Deer Daily Inn is a Chat Wars app \
brought to you by the Deer Daily team. We hope you \
enjoy your stay at our inn.

For the time being, please authenticate Deer Daily \
Inn by entering the authorization code sent to you \
via @chtwrsbot.`;
  
  const welcomeMessage = JSON.stringify({
    chat_id: chatId,
    text: welcomeText
  });
  return welcomeMessage;
};

const makeAuthCodeRequest = (telegramUserId) => {
  const message = JSON.stringify({
    action: 'createAuthCode',
    payLoad: {
      userId: telegramUserId,
    }
  });
  return message;
};

const start = (params) => {
  if (_.isEmpty(params.bot)) {
    return Promise.reject('Rejected /start: Bot cannot be missing');
  }
  if (_.isEmpty(params.telegramUserId) || _.isEmpty(params.chatId)) {
    return Promise.reject('Rejected /start: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const telegramId = params.telegramUserId;
  const chatId = params.chatId;
  const authRequest = makeAuthCodeRequest(telegramUserId);
  return bot.sendChtwrsMessage(authRequest)
  .then(() => {
    const welcomeMessage = makeWelcomeMessage(chatId);
    return bot.sendTelegramMessage(welcomeMessage);
  });
};

module.exports = start;
