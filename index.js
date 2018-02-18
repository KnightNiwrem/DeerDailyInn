const Promise = require('bluebird');
const _ = require('lodash');
const amqp = require('amqplib');
const uuid = require('node-uuid');
const config = require('./config');

const fetch = require('node-fetch');
fetch.Promise = Promise;

const botKey = config.get('botKey');
const username = config.get('username');
const password = config.get('password');

/*********************
 *      Set Up 
*********************/
const connectionUrl = `amqps://${username}:${password}@api.chatwars.me:5673/`
const setUpPromise = amqp.connect(connectionUrl)
.then((connection) => {
  console.log("Created connection");
  const channelPromise = connection.createChannel();
  return Promise.all([connection, channelPromise]);
}).then((connectionAndChannel) => {
  console.log("Created channel");
  return connectionAndChannel;
});

/*********************
 *      Utility 
*********************/

function makeTelegramRequest(method, body = {}) {
  const url = `https://api.telegram.org/bot${botKey}/${method}`;

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
  })
  .then(console.log)
  .catch(console.warn);
}

function createRouter(connection, channel, logTitle) {
  return function(message) {
    // This is where your "attempt" does work
    // has connection, channel and message
    // To further modularize: route connection, channel
    // and message elsewhere

    if (message.fields.redelivered) {
      return;
    }

    const content = JSON.parse(message.content.toString());
    const sellerId = content.sellerId;
    const listenerId = "85c8421558ec4c0098fda3003b460f0f";

    if (sellerId === listenerId) {
      const messageBody = {
        chat_id: 41284431,
        text: `${content.buyerCastle}${content.buyerName} purchased ${content.qty} ${content.item} from you at ${content.price} each.`,
      }
      makeTelegramRequest("sendMessage", messageBody);
    }
  };
}

function publishMessage(connection, channel, userMessage = '', userOptions = {}) {
  const messageBuffer = new Buffer(userMessage);
  const defaultOptions = { contentType: 'application/json' };
  const options = _.assign(defaultOptions, userOptions);
  channel.publish(`${username}_ex`, `${username}_o`, messageBuffer, options);
}

/*********************
 *      Server
*********************/

const ip = config.get('ip');
const port = config.get('port');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post(`/${botKey}`, (req, res) => {
  if (req.body.message && req.body.message.chat && req.body.message.text) {
    const chatId = req.body.message.chat.id;
    const messageText = req.body.message.text;

    const response = {
      chat_id: chatId,
      text: `You sent me ${messageText}`,
    };
    makeTelegramRequest('sendMessage', response);
  }
  res.end();
});

app.listen(port, () => {
  const webhookRequest = {
    url: `https://deerdailyinn.nusreviews.com/${botKey}`,
  };
  makeTelegramRequest('setWebhook', webhookRequest);
  console.log("Telegram bot server has started");
});

/*********************
 *        Work 
*********************/

setUpPromise
.then((connectionAndChannel) => {
  const [connection, channel] = connectionAndChannel;
  //const inboundRouter = createRouter(connection, channel, "New Inbound Message");
  //const offersRouter = createRouter(connection, channel, "New Offer!");
  const dealsRouter = createRouter(connection, channel, "New Deal!");

  //channel.consume(`${username}_i`, inboundRouter, {noAck: true});
  //channel.consume(`${username}_offers`, offersRouter, {noAck: true});
  channel.consume(`${username}_deals`, dealsRouter, {noAck: true});

  const initializationMessage = {
    chat_id: 41284431,
    text: "Deer daily inn is ready to notify you of your completed deals!",
  };
  makeTelegramRequest("sendMessage", initializationMessage);
})
.catch(console.warn);

