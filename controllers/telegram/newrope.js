const _ = require('lodash');
const Promise = require('bluebird');

const makeNewRopeMessage = (chatId, gameId) => {
  const text = ``;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const newrope = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in newrope: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in newrope: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const telegramId = params.telegramId;
  const chatId = params.chatId;
  const authRequest = makeNewRopeMessage(telegramId);
  return Promise.resolve();
};

module.exports = newrope;
