const _ = require('lodash');
const Promise = require('bluebird');

const makeUpdateLogMessage = (chatId) => {
  const updateLogText = `Stop trolling, Diego.`;
  
  const updateLogMessage = JSON.stringify({
    chat_id: chatId,
    text: updateLogText
  });
  return updateLogMessage;
};

const updatelog = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in updatelog: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in updatelog: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const updateLogMessage = makeUpdateLogMessage(chatId);
  return bot.sendTelegramMessage('sendMessage', updateLogMessage);
};

module.exports = updatelog;
