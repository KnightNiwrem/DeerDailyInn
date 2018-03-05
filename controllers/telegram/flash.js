const _ = require('lodash');
const Promise = require('bluebird');
const Flash = require('../../models/flash');

const makeFlashOnMessage = (chatId, item) => {
  const text = `Great! We will alert you when we notice a flash offer for ${item}!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeFlashOffMessage = (chatId, item) => {
  const text = `Understood! We will no longer alert you when we notice a flash offer for ${item}!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeFlashExistsMessage = (chatId, item) => {
  const text = `You already have a flash alert for ${item} in this chat!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeFlashDoesNotExistsMessage = (chatId, item) => {
  const text = `There isn't an existing flash for ${item} in this chat!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const validModifiers = new Set(['on', 'off']);
const specialSearchMap = new Map([
  ['Scroll of rage', '📕Scroll of Rage'],
  ['Scroll of peace', '📕Scroll of Peace']
]);

const flash = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in help: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in help: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const flashMessage = makeFlashMessage(chatId);

  let options = params.options;
  let willTurnOn = true;
  if (validModifiers.has(options[0])) {
    willTurnOn = options[0] === 'on';
    options = options.slice(1);
  }

  let searchTerm = _.capitalize(options.join(' ').replace(/[^\x00-\x7F]/g, "").trim());
  if (specialSearchMap.has(searchTerm)) {
    searchTerm = specialSearchMap.get(searchTerm);
  }

  const flashAttributes = {
    chatId: chatId,
    item: searchTerm
  };

  if (!willTurnOn) {
    return Flash.query()
    .where(flashAttributes)
    .then((rowsDeleted) => {
      let message;
      if (rowsDeleted === 0) {
        message = makeFlashDoesNotExistsMessage(chatId, searchTerm);
      } else {
        message = makeFlashOffMessage(chatId, searchTerm);
      }
      return bot.sendTelegramMessage('sendMessage', message);
    });
  } else {
    return Flash.query()
    .where(flashAttributes)
    .then((flash) => {
      if (_.isNil(flash)) {
        return Flash.create(flashAttributes)
        .then(() => {
          const message = makeFlashOnMessage(chatId, searchTerm);
          return bot.sendTelegramMessage('sendMessage', message);
        });
      } else {
        const message = makeFlashExistsMessage(chatId, searchTerm);
        return bot.sendTelegramMessage('sendMessage', message);
      }
    });
  }
};

module.exports = flash;
