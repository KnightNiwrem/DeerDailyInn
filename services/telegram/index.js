const express = require('express');
const fetch = require('node-fetch');
const { Subject } = require('rxjs');
const config = require('./config');

const { hostname, port, token } = config.getProperties();

class TelegramService {
  constructor({ 
    hostname = TelegramService.defaultHostname,
    port = TelegramService.defaultPort,
    token = TelegramService.defaultToken
  } = {}) {
    this.app = express();
    this.messageSubject = new Subject();

    this.setWebhook();
    this.subscribeToUpdates();
    this._connect();
  }

  connect({
    port = TelegramService.defaultPort,
  } = {}) {
    if (this.server) {
      this.server.close();
      console.log('Telegram bot server has shut down');
    }

    this.server = this.app.listen(port, () => {
      console.log('Telegram bot server has started');
    });
  }

  sendMessage({
    request = {},
    token = TelegramService.defaultToken,
  } = {}) {
    return this._sendRawRequest({ request, token });
  }

  setWebhook({
    hostname = TelegramService.defaultHostname,
    token = TelegramService.defaultToken,
  } = {}) {
    const request = {
      url: `https://${hostname}/${token}`
    };
    return this._sendRawRequest({ request, telegramMethod: 'setWebhook', token });
  }

  subscribeToUpdates({
    token = TelegramService.defaultToken,
  } = {}) {
    this.app.post(`/${token}`, (request, response) => {
      this.messageSubject.next(request);
      response.end();
    });
  }

  _sendRawRequest({ 
    headers = { 'Content-Type': 'application/json' }, 
    httpMethod = 'POST',
    telegramMethod = 'sendMessage', 
    request = {},
    token = TelegramService.defaultToken,
  } = {}) {
    const body = JSON.stringify(request);
    const url = `https://api.telegram.org/bot${token}/${telegramMethod}`;

    return fetch(url, { body, headers, method: httpMethod });
  }
}

TelegramService.defaultHostname = hostname;
TelegramService.defaultPort = port;
TelegramService.defaultToken = token;

module.exports = TelegramService;