const Promise = require('bluebird');
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

    this.username = username;
    this.password = password;
    this.botKey = botKey;
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

  hasResources() {
    return !_.isUndefined(this.connection) && !_.isUndefined(this.channel);
  }

  subscribeToInboundQueue() {
    if (!this.hasResources) {
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
    if (!this.hasResources()) {
      console.warn('Bot tried to subscribed to offers queue but lacked resources.');
      return;
    }

    const callbackWrapper = (message) => {
      const parameters = {
        bot: this,
        controllerName: 'offers',
        rawMessage: message,
        startTime: new Date()
      };
      return chtwrsRouter(parameters);
    };
    this.channel.consume(`${this.username}_offers`, callbackWrapper, { noAck: true });
  }

  subscribeToDealsQueue() {
    if (!this.hasResources()) {
      console.warn('Bot tried to subscribed to deals queue but lacked resources.');
      return;
    }

    const callbackWrapper = (message) => {
      const parameters = {
        bot: this,
        controllerName: 'deals',
        rawMessage: message
      };
      return chtwrsRouter(parameters);
    };
    this.channel.consume(`${this.username}_deals`, callbackWrapper, { noAck: true });
  }

  sendChtwrsMessage(message) {
    if (!this.hasResources()) {
      return Promise.reject('Bot does not have a connection or channel to publish to.');
    }

    const messageBuffer = new Buffer(message);
    const options = { 
      contentType: 'application/json'
    };
    this.channel.publish(`${this.username}_ex`, `${this.username}_o`, messageBuffer, options);
    return Promise.resolve();
  }

  sendTelegramMessage(method, message, delay=0) {
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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        fetch(url, options)
        .then((response) => {
          if (response.status === 429) {
            console.warn(`${new Date()} | Hitting rate limits. Will retry...`);
            resolve(bot.sendTelegramMessage(method, message, 1000));
          }
          resolve(response.json().tapCatch(() => {
            console.warn(response);
          }));
        })
        .catch(reject);
      }, delay);
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

    const separator = messageText.includes(' ') ? ' ' : '_';
    const words = messageText.toLowerCase().split(separator);
    let [controllerName, ...options] = words;
    let willFetchOptions = false;
    _.forEach(words, (word) => {
      if (willFetchOptions) {
        options.push(word);
      }
      if (word.endsWith('@deer_daily_inn_bot')) {
        controllerName = word.slice(0, -19);
        options = [];
        willFetchOptions = true;
      }
    });

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
