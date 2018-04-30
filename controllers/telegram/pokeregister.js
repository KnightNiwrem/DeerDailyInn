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

const makeMissingArgumentMessage = (chatId) => {
  const text = `Sorry, I think you might have \
forgotten to send your friend code with this command.`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeBadArgumentMessage = (chatId) => {
  const text = `Please ensure that your friend code follows \
the format xxxx-xxxx-xxxx`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeNewRegistrationMessage = (chatId, friendCodeText) => {
  const text = `Congratulations! You have been registered \
the friend code ${friendCodeText}!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeUpdatedRegistrationMessage = (chatId, friendCodeText) => {
  const text = `Ok! Your friend code have been \
updated to ${friendCodeText}!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const handleRegistration = async (bot, chatId, friendCodeText, telegramId) => {
  const user = await User.query().where({ telegramId: telegramId }).first();
  if (_.isNil(user)) {
    const message = makeUnregisteredMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const friendCode = await FriendCode.query().where({ telegramId: telegramId }).first();
  if (_.isNil(friendCode)) {
    const newFriendCode = await FriendCode.create({ telegramId: telegramId, friendCode: friendCodeText });
    const message = makeNewRegistrationMessage(chatId, friendCodeText);
    return bot.sendTelegramMessage('sendMessage', message);
  } else {
    const updatedFriendCode = await FriendCode.query()
    .patch({ friendCode: friendCodeText })
    .where({ telegramId: telegramId })
    .returning('*');

    const message = makeUpdatedRegistrationMessage(chatId, friendCodeText);
    return bot.sendTelegramMessage('sendMessage', message);
  }
};

const pokeregister = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in pokeregister: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in pokeregister: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  const friendCodeText = params.options.join('');

  if (_.isEmpty(friendCodeText)) {
    const message = makeMissingArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }
  if (!/\d{4}-\d{4}-\d{4}/.test(friendCodeText)) {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  return Promise.resolve(handleRegistration(bot, chatId, friendCodeText, telegramId));
};

module.exports = pokeregister;
