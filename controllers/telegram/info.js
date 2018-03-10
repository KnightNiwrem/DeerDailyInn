const _ = require('lodash');
const Promise = require('bluebird');

const makeInfoMessage = (chatId, telegramId) => {
  const text = `Here is the requested info:
Chat Id: ${chatId}
Telegram Id: ${telegramId}`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const info = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in info: Bot cannot be missing');
  }
  if (_.isNil(params.chatId) || _.isEmpty(params.telegramId)) {
    return Promise.reject('Rejected in info: Missing chat or telegram id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  const message = makeInfoMessage(chatId, telegramId);
  return bot.sendTelegramMessage('sendMessage', message);
};

module.exports = info;
