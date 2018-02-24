const Promise = require('bluebird');
const config = require('./config');

/************************
 *  Set Up - RabbitMQ
************************/
const username = config.get('username');
const password = config.get('password');
const connectionUrl = `amqps://${username}:${password}@api.chatwars.me:5673/`
const amqp = require('amqplib');

const setUpPromise = amqp.connect(connectionUrl)
.then((connection) => {
  console.log("Created connection");
  const channelPromise = connection.createChannel();
  return Promise.all([connection, channelPromise]);
}).then((connectionAndChannel) => {
  console.log("Created channel");
  return connectionAndChannel;
});

/************************
 *  Set Up - Database
************************/
/*
const { Model } = require('objection');
const Knex = require('knex');

// Initialize knex.
const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: {
    filename: 'example.db'
  }
});

// Give the knex object to objection.
Model.knex(knex);
*/

/************************
 *     Set Up - Bot
************************/
const botKey = config.get('botKey');
const Bot = require('./bot');
const bot = new Bot(botKey, username, password);

setUpPromise
.then((connectionAndChannel) => {
  const [connection, channel] = connectionAndChannel;

  bot.registerConnection(connection);
  bot.registerChannel(channel);

  bot.subscribeToInboundQueue();
  bot.subscribeToOffersQueue();
  bot.subscribeToDealsQueue();
})
.catch(console.warn);

/************************
 *   Set Up - Server
************************/
const ip = config.get('ip');
const port = config.get('port');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

app.post(`/${botKey}`, (req, res) => {
  return bot.handleTelegramMessage(req, res)
  .catch(console.warn)
  .finally(() => {
    res.end();
  });
});

app.listen(port, () => {
  const webhookRequest = {
    url: `https://deerdailyinn.nusreviews.com/${botKey}`,
  };
  bot.initializeWebhook(webhookRequest);
  console.log('Telegram bot server has started');
});

