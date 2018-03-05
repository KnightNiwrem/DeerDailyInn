const _ = require('lodash');
const Promise = require('bluebird');

const makeEchoMessage = (chatId) => {
  const echoText = `echo`;
  
  const echoMessage = JSON.stringify({
    chat_id: chatId,
    text: echoText
  });
  return echoMessage;
};

const echo = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in help: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in help: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;

  const userEchoCount = parseInt(params.options[0]);
  const echoCount = _.isInteger(userEchoCount) ? userEchoCount : 1;
  const echoMessages = _.range(echoCount).map(() => {
    return makeEchoMessage(chatId);
  });
  return bot.sendBatchedTelegramMessages('sendMessage', echoMessages);
};

module.exports = echo;
