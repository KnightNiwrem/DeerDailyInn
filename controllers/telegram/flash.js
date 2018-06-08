const _ = require('lodash');
const Promise = require('bluebird');
const Flash = require('../../models/flash');

const normalizeItemName = (itemName) => {
  return itemName.replace(/[^\x00-\x7F]/g, "").trim().toLowerCase();
};

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
const itemCodeToNameEntries = [
  ['01', 'Thread'],
  ['02', 'Stick'],
  ['03', 'Pelt'],
  ['04', 'Bone'],
  ['05', 'Coal'],
  ['06', 'Charcoal'],
  ['07', 'Powder'],
  ['08', 'Iron ore'],
  ['09', 'Cloth'],
  ['10', 'Silver ore'],
  ['13', 'Magic stone'],
  ['14', 'Wooden shaft'],
  ['15', 'Sapphire'],
  ['16', 'Solvent'],
  ['17', 'Ruby'],
  ['18', 'Hardener'],
  ['19', 'Steel'],
  ['20', 'Leather'],
  ['21', 'Bone powder'],
  ['22', 'String'],
  ['23', 'Coke'],
  ['24', 'Purified powder'],
  ['25', 'Silver alloy'],
  ['27', 'Steel mold'],
  ['28', 'Silver mold'],
  ['31', 'Rope'],
  ['33', 'Metal plate'],
  ['39', 'Stinky Sumac'],
  ['40', 'Mercy Sassafras'],
  ['41', 'Cliff Rue'],
  ['42', 'Love Creeper'],
  ['43', 'Wolf Root'],
  ['44', 'Swamp Lavender'],
  ['45', 'White Blossom'],
  ['46', 'Ilaves'],
  ['47', 'Ephijora'],
  ['48', 'Storm Hyssop'],
  ['49', 'Cave Garlic'],
  ['50', 'Yellow Seed'],
  ['51', 'Tecceagrass'],
  ['52', 'Spring Bay Leaf'],
  ['53', 'Ash Rosemary'],
  ['54', 'Sanguine Parsley'],
  ['55', 'Sun Tarragon'],
  ['56', 'Maccunut'],
  ['57', 'Dragon Seed'],
  ['58', 'Queen\'s Pepper'],
  ['59', 'Plasma of abyss'],
  ['60', 'Ultramarine dust'],
  ['61', 'Ethereal bone'],
  ['62', 'Itacory'],
  ['63', 'Assassin Vine'],
  ['64', 'Kloliarway'],
  ['501', 'Wrapping'],
  ['506', 'Bottle of Remedy'],
  ['508', 'Bottle of Poison'],
  ['p01', 'Vial of Rage'],
  ['p02', 'Potion of Rage'],
  ['p03', 'Bottle of Rage'],
  ['p04', 'Vial of Peace'],
  ['p05', 'Potion of Peace'],
  ['p06', 'Bottle of Peace'],
  ['p07', 'Vial of Greed'],
  ['p08', 'Potion of Greed'],
  ['p09', 'Bottle of Greed'],
  ['p10', 'Vial of Nature'],
  ['p11', 'Potion of Nature'],
  ['p12', 'Bottle of Nature'],
  ['s01', '📕Scroll of Rage'],
  ['s02', '📕Scroll of Peace'],
  ['tch', 'Torch']
];

const itemNames = itemCodeToNameEntries.map(entry => entry[1]);
const searchTermToNameMap = new Map([
  ...itemCodeToNameEntries,
  ...itemNames.map(name => [normalizeItemName(name), name])
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

  const optionsText = options.join(' ').trim();
  const hasMaxPriceOption = / under \d+$/.test(optionsText);

  let rawSearchTerm = optionsText;
  let maxPrice = 1000;
  if (hasMaxPriceOption) {
    const optionsRegex = /^(.*?) under (\d+)$/;
    const optionsMatches = optionsText.match(optionsRegex);
    const [originalOptionsText, userSearchTerm, userMaxPrice] = optionsMatches;
    rawSearchTerm = userSearchTerm;
    maxPrice = parseInt(userMaxPrice);
  }

  let searchTerm = normalizeItemName(rawSearchTerm);
  if (_.isEmpty(searchTerm)) {
    const message = makeFlashArgumentMissingMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }
  if (searchTermToNameMap.has(searchTerm)) {
    searchTerm = searchTermToNameMap.get(searchTerm);
  }

  const flashAttributes = {
    chatId: chatId,
    item: searchTerm,
    maxPrice: maxPrice
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
