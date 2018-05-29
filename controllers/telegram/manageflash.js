const _ = require('lodash');
const Promise = require('bluebird');
const Flash = require('../../models/flash');

const normalizeItemName = (itemName) => {
  return itemName.replace(/[^\x00-\x7F]/g, "").trim().toLowerCase();
};

const makeManageFlashMessage = (chatId, flashes, searchTerm) => {
  const existingFlashNames = new Set(flashes.map(flash => normalizeItemName(flash.item)));
  const flashStatuses = sortedItemNames
  .filter((name) => {
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  })
  .map((name) => {
    const itemCode = itemNameToCodeMap.get(name);
    const normalizedName = normalizeItemName(name);

    const flashStatus = existingFlashNames.has(normalizedName) ? 'on' : 'off';
    const flashToggle = flashStatus === 'on' ? 'off' : 'on';
    const flashText = `${name}: ${flashStatus.toUpperCase()}
/flash_${flashToggle}_${itemCode} to turn ${flashToggle.toUpperCase()}`;

    return flashText;
  });

  const text = `**Flash Management Panel**
${flashStatuses.join('\n\n')}`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

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

const itemCodeToNameMap = new Map(itemCodeToNameEntries);
const itemNameToCodeMap = new Map(itemCodeToNameEntries.map(entry => [...entry].reverse()));

const itemCodes = new Set(itemCodeToNameMap.keys());
const itemNames = new Set(itemNameToCodeMap.keys());
const sortedItemNames = itemCodeToNameEntries.map(entry => entry[1]);
const searchTermToNameMap = new Map([
  ...itemCodeToNameEntries,
  ...sortedItemNames.map(name => [normalizeItemName(name), name])
]);

const manageflash = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in manageflash: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in manageflash: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const options = params.options;
  let searchTerm = normalizeItemName(options.join(' '));
  if (searchTermToNameMap.has(searchTerm)) {
    searchTerm = searchTermToNameMap.get(searchTerm);
  }
  searchTerm = searchTerm.trim();

  return Flash.query()
  .where({
    chatId: chatId
  })
  .then((flashes) => {
    const message = makeManageFlashMessage(chatId, flashes, searchTerm);
    return bot.sendTelegramMessage('sendMessage', message, 500);
  });
};

module.exports = manageflash;
