const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');
const FriendCode = require('../../models/friendCode');

const makePlayerListMessage = (chatId, stringifiedPlayerList) => {
  const text = `Currently Registered Players: \

${stringifiedPlayerList}`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const constructPlayerList = async (bot, chatId) => {
  const friendCodes = await FriendCode.query();
  const playerList = friendCodes.map((friendCode) => {
    return `User ${friendCode.telegramId}: ${friendCode.friendCode}`;
  });

  const stringifiedPlayerList = playerList.join('\n');
  const message = makePlayerListMessage(chatId, stringifiedPlayerList);
  return bot.sendTelegramMessage('sendMessage', message);
};

const pokeplayers = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in pokeplayers: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in pokeplayers: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;

  return Promise.resolve(constructPlayerList(bot, chatId));
};

module.exports = pokeplayers;
