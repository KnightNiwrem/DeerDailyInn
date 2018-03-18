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

const makeFlashArgumentMissingMessage = (chatId) => {
  const text = `You need to specify the item name for the flash alert!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const validModifiers = new Set(['on', 'off']);
const specialSearchMap = new Map([
  ['Scroll of rage', '📕Scroll of Rage'],
  ['Scroll of peace', '📕Scroll of Peace'],
  ['Vial of rage', 'Vial of Rage'],
  ['Potion of rage', 'Potion of Rage'],
  ['Bottle of rage', 'Bottle of Rage'],
  ['Vial of peace', 'Vial of Peace'],
  ['Potion of peace', 'Potion of Peace'],
  ['Bottle of peace', 'Bottle of Peace'],
  ['Vial of greed', 'Vial of Greed'],
  ['Potion of greed', 'Potion of Greed'],
  ['Bottle of greed', 'Bottle of Greed'],
  ['Bottle of remedy', 'Bottle of Remedy'],
  ['Bottle of poison', 'Bottle of Poison'],
  ['Stinky sumac', 'Stinky Sumac'],
  ['Mercy sassafras', 'Mercy Sassafras'],
  ['Cliff rue', 'Cliff Rue'],
  ['Love creeper', 'Love Creeper'],
  ['Wolf root', 'Wolf Root'],
  ['Swamp lavender', 'Swamp Lavender'],
  ['White blossom', 'White Blossom'],
  ['Storm hyssop', 'Storm Hyssop'],
  ['Cave garlic', 'Cave Garlic'],
  ['Yellow seed', 'Yellow Seed'],
  ['Spring bay leaf', 'Spring Bay Leaf'],
  ['Ash rosemary', 'Ash Rosemary'],
  ['Sanguine parsley', 'Sanguine Parsley'],
  ['Sun tarragon', 'Sun Tarragon'],
  ['Dragon seed', 'Dragon Seed'],
  ['Queen\'s pepper', 'Queen\'s Pepper'],
  ['Assassin vine', 'Assassin Vine']
]);

const flash = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in flash: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in flash: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;

  let options = params.options;
  let willTurnOn = true;
  if (validModifiers.has(options[0])) {
    willTurnOn = options[0] === 'on';
    options = options.slice(1);
  }

  let searchTerm = _.capitalize(options.join(' ').replace(/[^\x00-\x7F]/g, "").trim());
  if (_.isEmpty(searchTerm)) {
    const message = makeFlashArgumentMissingMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }
  if (specialSearchMap.has(searchTerm)) {
    searchTerm = specialSearchMap.get(searchTerm);
  }

  const flashAttributes = {
    chatId: chatId,
    item: searchTerm
  };

  if (!willTurnOn) {
    return Flash.query()
    .delete()
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
    .first()
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
