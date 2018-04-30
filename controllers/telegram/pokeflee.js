const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');
const FriendCode = require('../../models/friendCode');

const makeUnregisteredMessage = (chatId) => {
  const text = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeNoFriendCodeMessage = (chatId) => {
  const text = `Unable to flee! Could not find \
friend code for this user.`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeFleeMessage = (chatId, friendCodeText) => {
  const text = `User with friend code ${friendCodeText} \
have fled from the tournament!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const handleFlee = async (chatId, telegramId) => {
  const user = await User.query().where({ telegramId: telegramId }).first();
  if (_.isNil(user)) {
    const message = makeUnregisteredMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const friendCode = await FriendCode.query().where({ telegramId: telegramId }).first();
  if (_.isNil(friendCode)) {
    const message = makeNoFriendCodeMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  } else {
    const friendCodeText = friendCode.friendCode;
    const message = makeFleeMessage(chatId, friendCodeText);
    return bot.sendTelegramMessage('sendMessage', message);
  }
};

const pokeflee = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in pokeflee: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in pokeflee: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  return Promise.resolve(handleFlee(chatId, telegramId));
};

module.exports = pokeflee;
