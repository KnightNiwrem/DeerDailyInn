const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');
const BuyOrder = require('../../models/buyOrder');

const normalizeItemName = (itemName) => {
  return itemName.replace(/[^\x00-\x7F]/g, "").trim().toLowerCase();
};

const makeUnregisteredMessage = (chatId) => {
  const unregisteredText = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const unregisteredMessage = JSON.stringify({
    chat_id: chatId,
    text: unregisteredText
  });
  return unregisteredMessage;
};

const makeBadArgumentMessage = (chatId) => {
  const text = `Bad format. Should be /cancel_{item code}`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};


const makeCancelMessage = (chatId, itemCode) => {
  const text = `You have cancelled all buy orders for ${searchTermToNameMap.get(itemCode)}!`;

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
  ['34', 'Metallic fiber'],
  ['35', 'Crafted leather'],

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
  ['65', 'Astrulic'],
  ['66', 'Flammia Nut'],
  ['67', 'Plexisop'],
  ['68', 'Mammoth Dill'],
  ['69', 'Silver dust'],

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
  ['p13', 'Vial of Mana'],
  ['p14', 'Potion of Mana'],
  ['p15', 'Bottle of Mana'],
  ['p16', 'Vial of Twilight'],
  ['p17', 'Potion of Twilight'],
  ['p18', 'Bottle of Twilight'],
  ['p19', 'Vial of Morph'],
  ['p20', 'Potion of Morph'],
  ['p21', 'Bottle of Morph'],
  ['pl1', 'Vial of Oblivion'],
  ['pl3', 'Bottle of Oblivion']
];

const itemCodes = new Set(itemCodeToNameEntries.map(entry => entry[0]));
const itemNames = itemCodeToNameEntries.map(entry => entry[1]);
const searchTermToNameMap = new Map([
  ...itemCodeToNameEntries,
  ...itemNames.map(name => [normalizeItemName(name), name])
]);

const cancel = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in cancel: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in cancel: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  const options = params.options;
  const [itemCode, ...rest] = options;

  const isValidItemCode = !_.isEmpty(itemCode) && itemCodes.has(itemCode);
  if (!isValidItemCode) {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }
  const itemName = searchTermToNameMap.get(itemCode);

  return BuyOrder.query()
  .patch({amountLeft: 0})
  .where('amountLeft', '>', 0)
  .andWhere('item', itemName)
  .andWhere('telegramId', telegramId)
  .then(() => {
    const message = makeCancelMessage(chatId, itemCode);
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = cancel;
