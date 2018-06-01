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

const makeQuantityLimitExceededMessage = (chatId, itemCode, maxLimit, price, quantity) => {
  const text = `Could not create buy order for ${quantity} ${searchTermToNameMap.get(itemCode)} at ${price} each. A current total buy order limit of ${maxLimit} is enforced for this item.`;

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

const itemCodes = new Set(itemCodeToNameEntries.map(entry => entry[0]));
const itemNames = itemCodeToNameEntries.map(entry => entry[1]);
const searchTermToNameMap = new Map([
  ...itemCodeToNameEntries,
  ...itemNames.map(name => [normalizeItemName(name), name])
]);

const itemCodeToQuantityLimitEntries = [
  ['01', 500],
  ['02', 500],
  ['03', 500],
  ['04', 500],
  ['05', 500],
  ['06', 500],
  ['07', 500],
  ['08', 500],
  ['09', 500],
  ['10', 500],
  ['13', 100],
  ['14', 100],
  ['15', 100],
  ['16', 100],
  ['17', 100],
  ['18', 100],
  ['19', 100],
  ['20', 100],
  ['21', 100],
  ['22', 100],
  ['23', 100],
  ['24', 100],
  ['25', 100],
  ['27', 100],
  ['28', 100],
  ['31', 100],
  ['33', 100],
  ['39', 100],
  ['40', 100],
  ['41', 100],
  ['42', 100],
  ['43', 100],
  ['44', 100],
  ['45', 100],
  ['46', 100],
  ['47', 100],
  ['48', 100],
  ['49', 100],
  ['50', 100],
  ['51', 100],
  ['52', 100],
  ['53', 100],
  ['54', 100],
  ['55', 100],
  ['56', 100],
  ['57', 100],
  ['58', 100],
  ['59', 100],
  ['60', 100],
  ['61', 100],
  ['62', 100],
  ['63', 100],
  ['64', 100],
  ['501', 100],
  ['506', 10],
  ['508', 10],
  ['p01', 10],
  ['p02', 10],
  ['p03', 10],
  ['p04', 10],
  ['p05', 10],
  ['p06', 10],
  ['p07', 10],
  ['p08', 10],
  ['p09', 10],
  ['p10', 10],
  ['p11', 10],
  ['p12', 10],
  ['s01', 2],
  ['s02', 2],
  ['tch', 2]
];

const itemCodeToQuantityLimits = new Map(itemCodeToQuantityLimitEntries);

const processBuyOrder = async (bot, chatId, itemCode, price, quantity, telegramId) => {
  const similarBuyOrders = await BuyOrder.query()
  .where('telegramId', telegramId)
  .andWhere('item', searchTermToNameMap.get(itemCode))
  .andWhere('amountLeft', '>', 0);

  const quantityLimit = itemCodeToQuantityLimits.get(itemCode);
  const currentQuantityRequested = similarBuyOrders.reduce((total, currentBuyOrder) => {
    return total + currentBuyOrder.amountLeft;
  }, 0);
  const hasExceededLimit = (currentQuantityRequested + quantity) > quantityLimit;

  if (hasExceededLimit) {
    const message = makeQuantityLimitExceededMessage(chatId, itemCode, maxLimit, price, quantity);
    bot.sendTelegramMessage('sendMessage', message);
    return Promise.reject(`Rejected in buy: User ${telegramId} limit exceeded for ${searchTermToNameMap.get(itemCode)}`);
  }

  const user = await User.query().where('telegramId', telegramId).first();
  const isSuccess = !_.isNil(user) && !_.isEmpty(user.chtwrsId);
  if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
    const message = makeUnregisteredMessage(chatId);
    bot.sendTelegramMessage('sendMessage', message);
    return Promise.reject(`Rejected in buy: User ${telegramId} is not registered.`);
  }

  const request = makeWantToBuyRequest(user.chtwrsToken, itemCode, price, quantity);
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
