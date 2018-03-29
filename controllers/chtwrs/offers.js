const _ = require('lodash');
const Flash = require('../../models/flash');

const offers = (params) => {
  if (_.isNil(params.bot)) {
    console.warn('Offers queue: Bot cannot be missing');
    return;
  }

  const bot = params.bot;
  const content = JSON.parse(params.rawMessage.content.toString());

  const searchAttribute = {
    item: content.item
  };

  Flash.query().where(searchAttribute).then((flashes) => {
    const responses = flashes.map((flash, index) => {
      const delay = index * 0;
      const flashMessage = JSON.stringify({
        chat_id: flash.chatId,
        text: `${content.sellerCastle}${content.sellerName} is selling ${content.qty} ${content.item} at ${content.price} gold each! (Lag time: ${new Date() - params.startTime + delay} ms)`
      });
      return bot.sendTelegramMessage('sendMessage', flashMessage, delay);
    });
    return Promise.all(responses);
  });
};

module.exports = offers;
