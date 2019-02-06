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

const makeStatusMessage = (chatId, activeStatuses, expiredStatuses, queuedStatuses, now) => {
  const activeStatusText = activeStatuses.map(status => {
    return `${status.title} (${status.description}, Expiring in: ${moment.duration(now - moment(status.expireAt)).humanize()})`;
  }).join('\n');

  const expiredStatusText = _.isEmpty(expiredStatuses) 
    ? ''
    : `

Expired Statuses: 
${expiredStatuses.map(status => {
  return `${status.title} (${status.description}, Expired on: ${moment(status.expireAt).utc().format('Do MMMM Y, h:mma')})`;
}).join('\n')}`;

  const queuedStatusText = _.isEmpty(queuedStatuses) 
    ? ''
    : `

Queue Statuses: 
${queuedStatuses.map(status => {
  return `${status.title} (${status.description}, Starting in: ${moment.duration(now - moment(status.startAt)).humanize()})`;
}).join('\n')}`;

  const text = `Active Statuses:
${_.isEmpty(activeStatuses) ? 'None' : activeStatusText}${queuedStatusText}${expiredStatusText}`;
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
  const activeStatuses = await Status.query()
  .where('telegramId', telegramId)
  .andWhere('startAt', '<', now.toISOString())
  .andWhere('expireAt', '>', now.toISOString());

  const expiredStatuses = await Status.query()
  .where('telegramId', telegramId)
  .andWhere('expireAt', '<', now.toISOString())
  .orderBy('expireAt', 'desc')
  .limit(5);

  const queuedStatuses = await Status.query()
  .where('telegramId', telegramId)
  .andWhere('startAt', '>', now.toISOString());

  const message = makeStatusMessage(chatId, activeStatuses, expiredStatuses, queuedStatuses, now);
  return bot.sendTelegramMessage('sendMessage', message);
};

module.exports = status;
