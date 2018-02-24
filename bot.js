const Promise = require('bluebird');
const _ = require('lodash');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
fetch.Promise = Promise;

const router = require('./Controllers/router');

class Bot {
  constructor(botKey, username, password) {
    this.connection = undefined;
    this.channel = undefined;

    this.username = username;
    this.password = password;
    this.botKey = botKey;
    this.pushUrl = `https://api.telegram.org/bot${this.botKey}`;
  }

  registerConnection(connection) {
    this.connection = connection;
  }

  registerChannel(channel) {
    this.channel = channel;
  }

  hasResources() {
    return !_.isUndefined(this.connection) && !_.isUndefined(this.channel);
  }

  subscribeToInboundQueue() {
    if (!this.hasResources) {
      console.warn('Bot tried to subscribed to inbound queue but lacked resources.');
      return;
    }

    this.channel.consume(`${this.username}_i`, this.handleInboundQueue, { noAck: true });
  }

  subscribeToOffersQueue() {
    if (!this.hasResources()) {
      console.warn('Bot tried to subscribed to offers queue but lacked resources.');
      return;
    }

    this.channel.consume(`${this.username}_offers`, this.handleOffersQueue, { noAck: true });
  }

  subscribeToDealsQueue() {
    if (!this.hasResources()) {
      console.warn('Bot tried to subscribed to deals queue but lacked resources.');
      return;
    }

    this.channel.consume(`${this.username}_deals`, this.handleDealsQueue, { noAck: true });
  }

  handleInboundQueue(message) {
    return;
  }

  handleOffersQueue(message) {
    return;
  }

  handleDealsQueue(message) {
    if (message.fields.redelivered) {
      return;
    }

    const content = JSON.parse(message.content.toString());
    const sellerId = content.sellerId;
    const listenerId = '85c8421558ec4c0098fda3003b460f0f';

    if (sellerId === listenerId) {
      const messageBody = {
        chat_id: 41284431,
        text: `${content.buyerCastle}${content.buyerName} purchased ${content.qty} ${content.item} from you at ${content.price} gold each.`,
      }
      this.makeTelegramRequest('sendMessage', messageBody);
    }
  }

  sendChtwrsMessage(message) {
    if (!this.hasResources()) {
      return Promise.reject('Bot does not have a connection or channel to publish to.');
    }

    const messageBuffer = new Buffer(message);
    const options = { 
      contentType: 'application/json'
    };
    return this.channel.publish(`${this.username}_ex`, 
                                `${this.username}_o`, 
                                messageBuffer, 
                                options);
  }

  sendTelegramMessage(message) {
    const url = `${this.pushUrl}/sendMessage`;
    const headers = {
      'Content-Type': 'application/json'
    };
    const options = {
      method: 'POST',
      body: message,
      headers: headers
    };
    return fetch(url, options)
    .then((response) => {
      return response.json();
    });
  }

  handleTelegramMessage(req, res) {
    // Ignore response without text messages
    const update = req.body;
    if (_.isEmpty(update.message) || _.isEmpty(update.message.text)) {
      return Promise.resolve();
    }

    const chatId = update.message.chat.id;
    const messageText = update.message.text;
    const userId = !_.isEmpty(update.message.from) ? update.message.from.id : undefined;

    const [controller, ...options] = messageText.split(' ');
    const parameters = {
      bot: this,
      chatId: chatId,
      controller: controller,
      isChannel: _.isEmpty(userId) && messageText.includes('@deer_daily_inn_bot'),
      isCommand: messageText.startsWith('/'),
      options: options,
      rawMessage: messageText,
      telegramUserId: userId,
    };
    return router(parameters);
  }
}

module.exports = Bot;
