const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

class Bot {
  constructor(botKey, username, password, ip, port) {
    this.connection = undefined;
    this.channel = undefined;
    this.redisClient = undefined;

    this.username = username;
    this.password = password;
    this.botKey = botKey;
    this.pullUrl = `https://deerdailyinn.nusreviews.com/${this.botKey}`;
    this.pushUrl = `https://api.telegram.org/bot${this.botKey}`;

    this.ip = ip;
    this.port = port;
    this.app = undefined;
    this.setUpTelegramServer();
  }

  registerConnection(connection) {
    this.connection = connection;
  }

  registerChannel(channel) {
    this.channel = channel;
  }

  registerRedisClient(redisClient) {
    this.redisClient = redisClient;
  }

  hasConnection() {
    return !_.isUndefined(this.connection);
  }

  hasChannel() {
    return !_.isUndefined(this.channel);
  }

  hasRedisClient() {
    return !_.isUndefined(this.redisClient);
  }

  subscribeToQueue(queue, router, options = {}) {
    if (!this.hasConnection() || !this.hasChannel()) {
      console.warn('Bot does not have a connection or channel to publish to.');
      return;
    }

    this.channel.consume(queue, router, options);
  }

  publishMessage(userMessage = '', userOptions = {}) {
    if (!this.hasConnection() || !this.hasChannel()) {
      console.warn('Bot does not have a connection or channel to publish to.');
      return;
    }

    const messageBuffer = new Buffer(userMessage);
    const defaultOptions = { contentType: 'application/json' };
    const options = _.assign(defaultOptions, userOptions);
    channel.publish(`${this.username}_ex`, `${this.username}_o`, messageBuffer, options);
  }

  makeTelegramRequest(method, body = {}) {
    const url = `${this.pushUrl}/${method}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers
    })
    .then((response) => {
      return response.json();
    });
  }

  handleTelegramMessage(req, res, userId, chatId, messageText) {
    this.sendPrimaryResponse(chatId)
    .then(() => {
      return this.sendSecondaryResponse(chatId, messageText);
    })
    .then(() => {
      res.end();
    })
    .catch((err) => {
      console.warn(err);
      res.end();
    });
  }

  setUpTelegramServer() {
    this.app = express();
    this.app.use(bodyParser.json());

    app.post(`/${this.botKey}`, (req, res) => {
      let userId, chatId, messageText;

      // If not, then not an update that we care about
      if (!req.body.message) {
        return;
      }

      // Chat is not optional on Message
      chatId = req.body.message.chat.id;

      // Text is optional on Message
      // If not text message, definitely not for us
      if (!req.body.message.text) {
        return;
      } else {
        messageText = req.body.message.text;
      }

      // From is optional on Message
      // Will be empty for Channels
      if (!req.body.message.from && messageText.includes('@deer_daily_inn_bot')) {
        const channelResponse = {
          chat_id: chatId,
          text: 'This bot does not work in channels and groups!',
        };
        makeTelegramRequest('sendMessage', channelResponse);
        return;
      } else if (!req.body.message.from) {
        return;
      } else {
        userId = req.body.message.from.id;
      }
      
      this.handleTelegramMessage(req, res, userId, chatId, messageText);
    });

    app.listen(this.port, () => {
      const webhookRequest = {
        url: this.pullUrl,
      };
      makeTelegramRequest('setWebhook', webhookRequest);
      console.log('Telegram bot server has started');
    });
  }

  sendInitializationMessage() {
    const initializationMessage = {
      chat_id: 41284431,
      text: 'Deer daily inn is ready to notify you of your completed deals!',
    };
    return makeTelegramRequest('sendMessage', initializationMessage);
  }

  sendPrimaryResponse(chatId) {
    const primaryResponse = {
      chat_id: chatId,
      text: 'Sorry, this bot is not ready to respond to inputs yet.',
    };
    return makeTelegramRequest('sendMessage', primaryResponse);
  }

  sendSecondaryResponse(chatId, messageText) {
    const secondaryResponse = {
      chat_id: chatId,
      text: `On a side note, the text that you sent me was "${messageText}`,
    };
    return makeTelegramRequest('sendMessage', secondaryResponse);
  }
}

module.exports = Bot;
