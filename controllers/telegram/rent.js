const _ = require('lodash');
const Promise = require('bluebird');
const { transaction } = require('objection');
const User = require('../../models/user');
const Transaction = require('../../models/transaction');

const makeUnregisteredMessage = (chatId) => {
  const text = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeNotEnoughGoldMessage = (chatId) => {
  const text = `Sorry, you need at least 10 gold in \
your personal Deer Daily Inn balance to rent a room.

To add gold to your balance, please do:
/deposit [number of gold pouches]`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeAlreadyHaveRoomMessage = (chatId, roomNumber) => {
  const text = `You refused to rent another room until \
you get evicted from room ${roomNumber % 100}!`
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeRentMessage = (chatId, roomNumber) => {
  const text = `Great! You have been assigned to \
room number ${roomNumber % 100}. We hope you enjoy \
your stay at the Deer Daily Inn.

To turn in for bed, please do:
/sleep`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const rent = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in rent: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in rent: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  return User.query()
  .where('telegramId', telegramId)
  .first()
  .then((user) => {
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }
    if (user.balance < 10) {
      const message = makeNotEnoughGoldMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const room = Room.query()
    .where({
      status: 'occupied',
      userId: user.id
    })
    .first();
    return Promise.all([user, room]);
  })
  .then(([user, room]) => {
    if (!_.isNil(room)) {
      const message = makeAlreadyHaveRoomMessage(chatId, room.id);
      return bot.sendTelegramMessage('sendMessage', message);
    }
  });
};

module.exports = rent;
