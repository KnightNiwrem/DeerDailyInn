const Promise = require('bluebird');
const config = require('./config');

/************************
 *  Set Up - Database
************************/
const dbConfig = config.get('db');
const { Model } = require('objection');
const Knex = require('knex');

// Initialize knex.
const knex = Knex({
  client: 'pg',
  connection: {
    host : dbConfig.host,
    port: dbConfig.port,
    user : dbConfig.username,
    password : dbConfig.password,
    database : dbConfig.database
  }
});

// Give the knex object to objection.
Model.knex(knex);

/************************
 *  Set Up - RabbitMQ
************************/
const username = config.get('username');
const password = config.get('password');
const connectionOptions = {
  protocol: 'amqps',
  hostname: 'api.chatwars.me',
  port: 5673,
  username: username,
  password, password,
  locale: 'en_US',
  frameMax: 0,
  heartbeat: 60,
  vhost: '/'
};
const amqp = require('amqplib');

const setUpPromise = amqp.connect(connectionOptions)
.then((connection) => {
  const closeConnection = connection.close.bind(connection);
  process.once('SIGINT', () => {
    closeConnection();
    console.log('\nConnection has been closed.');
  });
  const channelPromise = connection.createChannel();
  return Promise.all([connection, channelPromise]);
}).then((connectionAndChannel) => {
  return connectionAndChannel;
});

/************************
 *     Set Up - Bot
************************/
const botKey = config.get('botKey');
const Bot = require('./bot');
const bot = new Bot(botKey, username, password);

setUpPromise
.then((connectionAndChannel) => {
  const [connection, channel] = connectionAndChannel;

  bot.registerKnex(knex);
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
  return Promise.resolve(bot.handleTelegramMessage(req, res))
  .finally(() => {
    res.end();
  });
});

app.listen(port, () => {
  const webhookRequest = JSON.stringify({
    url: `https://ddi.knightniwrem.com/${botKey}`,
  });
  bot.sendTelegramMessage('setWebhook', webhookRequest);
  bot.sendLog('Deer Daily Inn has restarted');
  console.log('Telegram bot server has started');
});

