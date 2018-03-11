const _ = require('lodash');
const Promise = require('bluebird');

const makeGetInfoMessage = (chatId) => {
  const text = `Your getInfo request has been sent!`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeGetInfoRequest = () => {
  const request = JSON.stringify({
    action: 'getInfo'
  });
  return request;
};

const getinfo = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in getinfo: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in getinfo: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const request = makeGetInfoRequest();
  const message = makeGetInfoMessage(chatId);
  return bot.sendChtwrsMessage(request)
  .then(() => bot.sendTelegramMessage('sendMessage', message));
};

module.exports = getinfo;
