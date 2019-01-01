const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const User = require('../../models/user');
const Status = require('../../models/status');

const makeUnregisteredMessage = (chatId) => {
  const text = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeStatusMessage = (chatId, statuses) => {
  const statusText = statuses.map(status => {
    return `${status.title} (${status.description})`;
  }).join('\n');
  const text = `Active Statuses:
${statusText}`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const status = async (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in status: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in balance: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  const user = await User.query()
  .where('telegramId', telegramId)
  .first();

  if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
    const message = makeUnregisteredMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const now = moment();
  const statuses = await Status.query()
  .where('telegramId', telegramId)
  .andWhere('startAt', '<', now.toISOString())
  .andWhere('expireAt', '>', now.toISOString());

  const message = makeStatusMessage(chatId, statuses);
  return bot.sendTelegramMessage('sendMessage', message);
};

module.exports = status;
