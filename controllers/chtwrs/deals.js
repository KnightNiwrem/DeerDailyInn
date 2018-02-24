const _ = require('lodash');
const User = require('../../models/user');
const Deal = require('../../models/deal');

const deals = (params) => {
  if (_.isNil(params.bot)) {
    console.warn('Deals queue: Bot cannot be missing');
    return;
  }

  const bot = params.bot;
  const content = JSON.parse(params.rawMessage.content.toString());

  const searchAttribute = {
    chtwrsId: content.sellerId
  };

  User.query().where(searchAttribute)
  .then((users) => {
    if (!_.isEmpty(users)) {
      const user = users[0];
      const dealsMessage = JSON.stringify({
        chat_id: user.telegramId,
        text: `${content.buyerCastle}${content.buyerName} purchased ${content.qty} ${content.item} from you at ${content.price} gold each.`
      });
      return bot.sendTelegramMessage('sendMessage', dealsMessage);
    }
  })
  .catch(console.warn);

  User.query().whereIn('chtwrsId', [content.buyerId, content.sellerId])
  .then((users) => {
    if (!_.isEmpty(users)) {
      const dealAttributes = {
        buyerId: content.buyerId,
        item: content.item,
        price: content.price,
        quantity: content.qty,
        sellerId: content.sellerId
      };
      return Deal.create(dealAttributes).then();
    }
  })
  .catch(console.warn);
};

module.exports = deals;
