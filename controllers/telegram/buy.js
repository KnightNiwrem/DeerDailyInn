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
  const text = `Bad format. Should be /buy_{item code}_{quantity}_{max price}`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeBuyOrderLimitExceededMessage = (chatId, itemCode, maxLimit, price, quantity) => {
  const text = `Could not create buy order for ${quantity} ${searchTermToNameMap.get(itemCode)} at ${price} gold each. You can only have a total of ${maxLimit} active buy orders at any given time.`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeHasSimilarBuyOrderLimitMessage = (chatId, itemCode, price, quantity) => {
  const text = `Could not create buy order for ${quantity} ${searchTermToNameMap.get(itemCode)} at ${price} gold each. You already have an active buy order for this item, and are only allowed one active buy order per item.`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeQuantityLimitExceededMessage = (chatId, itemCode, maxLimit, price, quantity) => {
  const text = `Could not create buy order for ${quantity} ${searchTermToNameMap.get(itemCode)} at ${price} gold each. The current buy order limit for this item is ${maxLimit}.`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeWantToBuyRequest = (chtwrsToken, itemCode, price, quantity) => {
  const message = JSON.stringify({  
    token: chtwrsToken,  
    action: "wantToBuy",  
    payload: {  
      itemCode: itemCode, 
      quantity: quantity,
      price: price,
      exactPrice: true
    }  
  });
  return message;
};

const makeBuyOrderMessage = (chatId, itemCode, price, quantity) => {
  const text = `Your buy order for ${quantity} ${searchTermToNameMap.get(itemCode)} at ${price} each, has been received!

An impossible /wtb has also been executed to check if you have permissions. If you see a permission request message, please provide extra permissions so that your buy order can work!`;

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

const itemCodeToQuantityLimitEntries = [
  ['01', 50],
  ['02', 500],
  ['03', 50],
  ['04', 100],
  ['05', 500],
  ['06', 100],
  ['07', 500],
  ['08', 50],
  ['09', 500],
  ['10', 500],
  ['11', 10],
  ['12', 10],
  ['13', 10],
  ['14', 100],
  ['15', 10],
  ['16', 50],
  ['17', 10],
  ['18', 10],
  ['19', 50],
  ['20', 50],
  ['21', 50],
  ['22', 100],
  ['23', 10],
  ['24', 100],
  ['25', 100],
  ['27', 100],
  ['28', 100],
  ['31', 10],
  ['33', 10],
  ['34', 10],
  ['35', 10],
  ['39', 50],
  ['40', 50],
  ['41', 50],
  ['42', 50],
  ['43', 50],
  ['44', 50],
  ['45', 50],
  ['46', 50],
  ['47', 50],
  ['48', 50],
  ['49', 50],
  ['50', 50],
  ['51', 50],
  ['52', 50],
  ['53', 50],
  ['54', 50],
  ['55', 50],
  ['56', 50],
  ['57', 50],
  ['58', 50],
  ['59', 50],
  ['60', 50],
  ['61', 50],
  ['62', 50],
  ['63', 50],
  ['64', 50],
  ['65', 50],
  ['66', 50],
  ['67', 50],
  ['68', 50],
  ['69', 50],
  ['501', 10],
  ['506', 5],
  ['508', 5],
  ['p01', 5],
  ['p02', 5],
  ['p03', 5],
  ['p04', 5],
  ['p05', 5],
  ['p06', 5],
  ['p07', 5],
  ['p08', 5],
  ['p09', 5],
  ['p10', 10],
  ['p11', 10],
  ['p12', 10],
  ['p13', 5],
  ['p14', 5],
  ['p15', 5],
  ['p16', 5],
  ['p17', 5],
  ['p18', 5],
  ['p19', 5],
  ['p20', 5],
  ['p21', 5],
  ['s01', 1],
  ['s02', 1],
  ['tch', 1]
];

const itemCodeToQuantityLimits = new Map(itemCodeToQuantityLimitEntries);

const processBuyOrder = async (bot, chatId, itemCode, price, quantity, telegramId) => {
  const user = await User.query().where('telegramId', telegramId);
  const isSuccess = !_.isNil(user) && !_.isEmpty(user.chtwrsId);
  if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
    const message = makeUnregisteredMessage(chatId);
    bot.sendTelegramMessage('sendMessage', message);
    return Promise.reject(`Rejected in buy: User ${telegramId} is not registered.`);
  }
  
  const pendingBuyOrders = await BuyOrder.query()
  .where('telegramId', telegramId)
  .andWhere('amountLeft', '>', 0);

  if (pendingBuyOrders.length >= user.buyOrderLimit) {
    const message = makeBuyOrderLimitExceededMessage(chatId, itemCode, buyOrderLimit, price, quantity)
    bot.sendTelegramMessage('sendMessage', message);
    return Promise.reject(`Rejected in buy: User ${telegramId} pending buy order limit exceeded for ${searchTermToNameMap.get(itemCode)}`);
  }

  const similarBuyOrders = pendingBuyOrders.filter((buyOrder) => {
    return buyOrder.item === searchTermToNameMap.get(itemCode);
  });
  const hasSimilarBuyOrders = similarBuyOrders.length > 0;
  if (hasSimilarBuyOrders) {
    const message = makeHasSimilarBuyOrderLimitMessage(chatId, itemCode, price, quantity);
    bot.sendTelegramMessage('sendMessage', message);
    return Promise.reject(`Rejected in buy: User ${telegramId} similar item limit exceeded for ${searchTermToNameMap.get(itemCode)}`);
  }

  const quantityLimit = itemCodeToQuantityLimits.get(itemCode);
  const hasExceededLimit = quantity > quantityLimit;
  if (hasExceededLimit) {
    const message = makeQuantityLimitExceededMessage(chatId, itemCode, quantityLimit, price, quantity);
    bot.sendTelegramMessage('sendMessage', message);
    return Promise.reject(`Rejected in buy: User ${telegramId} quantity limit exceeded for ${searchTermToNameMap.get(itemCode)}`);
  }

  const request = makeWantToBuyRequest(user.chtwrsToken, '01', 99999, 1);
  bot.sendChtwrsMessage(request);

  const attributes = {
    amountLeft: quantity,
    item: searchTermToNameMap.get(itemCode),
    maxPrice: price,
    quantity: quantity,
    telegramId: user.telegramId
  };
  const newBuyOrder = await BuyOrder.create(attributes);
  const message = makeBuyOrderMessage(chatId, itemCode, price, quantity);
  return bot.sendTelegramMessage('sendMessage', message);
};

const buy = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in buy: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in buy: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  const options = params.options;
  const [itemCode, quantityInput, priceInput] = options;
  const quantity = Number(quantityInput);
  const price = Number(priceInput);

  const isValidItemCode = !_.isEmpty(itemCode) && itemCodes.has(itemCode);
  const isValidQuantity = _.isFinite(quantity) && _.isSafeInteger(quantity) && (quantity > 0);
  const isValidPrice = _.isFinite(price) && _.isSafeInteger(price) && (price > 0);
  if (!isValidItemCode || !isValidQuantity || !isValidPrice) {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  return processBuyOrder(bot, chatId, itemCode, price, quantity, telegramId);
};

module.exports = buy;
