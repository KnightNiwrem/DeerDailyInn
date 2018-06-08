const _ = require('lodash');
const BuyOrder = require('../../models/buyOrder');
const Flash = require('../../models/flash');
const User = require('../../models/user');

const makeWantToBuyRequest = (chtwrsToken, itemCode, quantity, price) => {
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
const itemNameToItemCodeMap = new Map(itemCodeToNameEntries.map((e) => [e[1], e[0]]));

const offers = (params) => {
  if (_.isNil(params.bot)) {
    console.warn('Offers queue: Bot cannot be missing');
    return;
  }

  const bot = params.bot;
  const content = JSON.parse(params.rawMessage.content.toString());

  BuyOrder.query()
  .where('item', content.item)
  .andWhere('maxPrice', '>=', content.price)
  .andWhere('amountLeft', '>', 0)
  .first('id')
  .then((buyOrder) => {
    if (_.isNil(buyOrder)) {
      return;
    }
    
    const itemCode = itemNameToItemCodeMap.get(content.item);
    const amountPurchased = Math.min(content.qty, buyOrder.amountLeft);

    BuyOrder.query()
    .patch({ amountLeft: buyOrder.amountLeft - amountPurchased })
    .where('id', buyOrder.id)
    .then(() => {
      return;
    });

    User.query()
    .where('telegramId', buyOrder.telegramId)
    .first()
    .then((user) => {
      const request = makeWantToBuyRequest(user.chtwrsToken, itemCode, amountPurchased, content.price);
      return bot.sendChtwrsMessage(request);
    });
  });

  const searchAttribute = {
    item: content.item
  };

  Flash.query()
  .where('item', content.item)
  .andWhere('maxPrice', '>=', content.price)
  .then((flashes) => {
    const responses = flashes.map((flash, index) => {
      const delay = index * 0;
      const itemCode = itemNameToItemCodeMap.get(content.item);
      const flashMessage = JSON.stringify({
        chat_id: flash.chatId,
        text: `${content.sellerCastle}${content.sellerName} is selling ${content.qty} ${content.item} at ${content.price} gold each! (Lag time: ${new Date() - params.startTime + delay} ms)

Quickbuy 1: ${_.isNil(itemCode) ? 'Not available' : `/wtb_${itemCode}_1_${content.price}`}
Quickbuy all: ${_.isNil(itemCode) ? 'Not available' : `/wtb_${itemCode}_${content.qty}_${content.price}`}`
      });
      return bot.sendTelegramMessage('sendMessage', flashMessage, delay);
    });
    return Promise.all(responses);
  });
};

module.exports = offers;
