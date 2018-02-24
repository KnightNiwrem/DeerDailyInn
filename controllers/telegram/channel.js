const _ = require('lodash');

const makePrivateonlyMessage = (chatId) => {
  const privateOnlyText = `Sorry, this command only works in private chats!`;
  const privateOnlyMessage = JSON.stringify({
    chat_id: chatId,
    text: privateOnlyText
  });
  return privateOnlyMessage;
};

const channel = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in channel: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in channel: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const privateOnlyMessage = makePrivateonlyMessage(chatId);
  return bot.sendTelegramMessage('sendMessage', privateOnlyMessage);
};

module.exports = channel;
