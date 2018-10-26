const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');
const BuyOrder = require('../../models/buyOrder');

const makeMissingArgumentMessage = (chatId) => {
  const missingArgumentText = `Sorry, I need to know \
the itemCode and price of the buy orders that you would \
like to inspect!

Format: /inspect {itemCode} {price}`;
  
  const missingArgumentMessage = JSON.stringify({
    chat_id: chatId,
    text: missingArgumentText
  });
  return missingArgumentMessage;
};

const makeUnknownItemCodeMessage = (chatId) => {
  const unknownItemCodeText = `Hi, I'm not familiar \
with that item code. If this is an error, contact me \
at @knightniwrem!`;

  const unknownItemCodeMessage = JSON.stringify({
    chat_id: chatId,
    text: unknownItemCodeText
  });
  return makeUnknownItemCodeMessage;
};

const makeInspectMessage = (chatId, aheadQuantity, behindQuantity, itemName, price, userBuyOrder) => {
  const inspectText = _.isUndefined(userBuyOrder) 
    ? `There are ${aheadQuantity} orders queueing to buy ${itemName} at ${price} gold`
    : `There are ${aheadQuantity} orders waiting in front of you to buy ${itemName} \
at ${price} gold.

There are ${behindQuantity} orders waiting behind you to buy ${itemName} at ${price} gold.`;

  const inspectMessage = JSON.stringify({
    chat_id: chatId,
    text: inspectText
  });
  return inspectMessage;
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
  ['11', 'Bauxite'],
  ['12', 'Cord'],
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

  ['506', 'Bottle of Remedy'],
  ['508', 'Bottle of Poison'],

  ['518', 'Hay'],
  ['519', 'Corn'],
  ['520', 'Hamsters'],
  ['521', 'Cheese'],

  ['ch1', 'Zombie Chest'],
  ['ch2', 'Ancient Chest'],

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
const itemCodeToNames = new Map(itemCodeToNameEntries);

const inspectBuyOrders = async (bot, chatId, itemName, price, telegramId) => {
  const userBuyOrder = await BuyOrder.query()
  .where('telegramId', telegramId)
  .andWhere('item', itemName)
  .andWhere('amountLeft', '>', 0)
  .andWhere('maxPrice', '>=', price)
  .first();

  if (_.isUndefined(userBuyOrder)) {
    const buyOrders = await BuyOrder.query()
    .where('item', itemName)
    .andWhere('amountLeft', '>', 0)
    .andWhere('maxPrice', '>=', price);

    const aheadQuantity = buyOrders.reduce((total, buyOrder) => {
      return total + buyOrder.quantity;
    }, 0);

    const message = makeInspectMessage(chatId, aheadQuantity, 0, itemName, price, userBuyOrder);
    return bot.sendTelegramMessage('sendMessage', message);
  } else {
    const aheadBuyOrders = await BuyOrder.query()
    .where('item', itemName)
    .andWhere('amountLeft', '>', 0)
    .andWhere('maxPrice', '>=', price)
    .andWhere('id', '<', userBuyOrder.id);

    const behindBuyOrders = await BuyOrder.query()
    .where('item', itemName)
    .andWhere('amountLeft', '>', 0)
    .andWhere('maxPrice', '>=', 0)
    .andWhere('id', '>', userBuyOrder.id);

    const aheadQuantity = aheadBuyOrders.reduce((total, buyOrder) => {
      return total + buyOrder.quantity;
    }, 0);
    const behindQuantity = behindBuyOrders.reduce((total, buyOrder) => {
      return total + buyOrder.quantity;
    }, 0);

    const message = makeInspectMessage(chatId, aheadQuantity, behindQuantity, itemName, price, userBuyOrder);
    return bot.sendTelegramMessage('sendMessage', message);
  }
};

const inspect = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in inspect: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in inspect: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  const options = params.options;
  const [itemCode, price] = options;
  if (_.isUndefined(itemCode) || _.isUndefined(price)) {
    const missingArgumentMessage = makeMissingArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', missingArgumentMessage);
  }

  const itemName = itemCodeToNames.get(itemCode);
  if (!itemCodeToNames.has(itemCode)) {
    const unknownItemCodeMessage = makeUnknownItemCodeMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', unknownItemCodeMessage);
  }

  return inspectBuyOrders(bot, chatId, itemName, price, telegramId);
};

module.exports = inspect;
