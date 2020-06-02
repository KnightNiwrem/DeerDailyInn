const Promise = require('bluebird');
const Bottleneck = require('bottleneck');
const _ = require('lodash');
const fetch = require('node-fetch');
fetch.Promise = Promise;

const chtwrsRouter = require('./controllers/chtwrsRouter');
const telegramRouter = require('./controllers/telegramRouter');

class Bot {
  constructor(botKey, username, password) {
    this.knex = undefined;
    this.connection = undefined;
    this.channel = undefined;
    this.consumer = undefined;

    this.username = username;
    this.password = password;
    this.botKey = botKey;

    this.telegramBottleneck = new Bottleneck({
      maxConcurrent: 50,
      minTime: 333,
    })
  }

  registerKnex(knex) {
    this.knex = knex;
  }

  registerConnection(connection) {
    this.connection = connection;
  }

  registerChannel(channel) {
    this.channel = channel;
  }

  registerKafkaConsumer(consumer) {
    this.consumer = consumer;
  }

  hasAMQPResources() {
    return !_.isUndefined(this.connection) && !_.isUndefined(this.channel);
  }

  hasKafkaResources() {
    return !_.isUndefined(this.consumer);
  }

  subscribeToInboundQueue() {
    if (!this.hasAMQPResources()) {
      console.warn('Bot tried to subscribed to inbound queue but lacked resources.');
      return;
    }

    const callbackWrapper = (message) => {
      const parameters = {
        bot: this,
        controllerName: 'inbound',
        rawMessage: message
      };
      return chtwrsRouter(parameters);
    };
    this.channel.consume(`${this.username}_i`, callbackWrapper, { noAck: true });
  }

  subscribeToOffersQueue() {
    if (!this.hasKafkaResources()) {
      console.warn('Bot tried to subscribed to offers queue but lacked resources.');
      return;
    }

    this.consumer.subscribe({ topic: 'cw2-offers' });
  }

  subscribeToDealsQueue() {
    if (!this.hasKafkaResources()) {
      console.warn('Bot tried to subscribed to deals queue but lacked resources.');
      return;
    }

    this.consumer.subscribe({ topic: 'cw2-deals' });
  }

  sendChtwrsMessage(message) {
    if (!this.hasAMQPResources()) {
      return Promise.reject('Bot does not have a connection or channel to publish to.');
    }

    const messageBuffer = new Buffer(message);
    const options = { 
      contentType: 'application/json'
    };
    this.channel.publish(`${this.username}_ex`, `${this.username}_o`, messageBuffer, options);
    return Promise.resolve();
  }

  startKafkaConsumer() {
    if (!this.hasKafkaResources()) {
      return Promise.reject('Bot does not have a connection or channel to publish to.');
    }

    const callbackWrapper = ({ topic, partition, message }) => {
      const [_, controllerName] = topic.split('-'); 
      message.content = message.value;
      message.fields = { redelivered: false };
      const parameters = {
        bot: this,
        rawMessage: message,
        controllerName,
      };
      return chtwrsRouter(parameters);
    };

    this.consumer.run({ eachMessage: callbackWrapper });
  }

  sendTelegramMessage(method, message, priority=9) {
    const url = `https://api.telegram.org/bot${this.botKey}/${method}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    const options = {
      method: 'POST',
      body: message,
      headers: headers
    };

    const bot = this;
    return this.telegramBottleneck.schedule({ priority }, () => {
      return fetch(url, options)
      .then((response) => {
        if (response.status === 429) {
          console.warn(`${new Date()} | Hitting rate limits. Will retry...`);
          return bot.sendTelegramMessage(method, message, Math.max(priority - 1, 0));
        }
        return response.json().tapCatch(() => {
          console.warn(response);
        });
      })
      .catch(console.warn);
    });
  }

  handleTelegramMessage(req, res) {
    // Ignore response without text messages
    const update = req.body;
    if (_.isNil(update.message) || _.isEmpty(update.message.text)) {
      return Promise.resolve();
    }

    const chatId = update.message.chat.id;
    const messageText = update.message.text;
    const userId = !_.isNil(update.message.from) ? update.message.from.id : undefined;

    const isForBot = !(messageText.includes('@') ^ messageText.includes('@deer_daily_inn_bot'));
    if (!isForBot) {
      return Promise.resolve();
    }

    const safeText = messageText.replace(/@deer_daily_inn_bot/g, '');
    const separator = safeText.includes(' ') ? ' ' : '_';
    const words = safeText.toLowerCase().split(separator);

    let [controllerName, ...options] = words;
    if (controllerName.startsWith('/')) {
      controllerName = controllerName.slice(1);
    }

    // Ignore messages that just do @deer_daily_inn_bot
    if (_.isEmpty(controllerName)) {
      return Promise.resolve();
    }
    
    const parameters = {
      bot: this,
      chatId: chatId,
      controllerName: controllerName,
      isChannel: _.isNil(userId) || userId !== chatId,
      options: options,
      rawMessage: messageText,
      telegramId: userId,
    };
    return telegramRouter(parameters);
  }

  sendLog(text) {
    const message = JSON.stringify({
      chat_id: -1001279937491,
      text: `Deer Daily Inn | #info | ${text}`
    });
    return this.sendTelegramMessage('sendMessage', message);
  }
}

module.exports = Bot;
