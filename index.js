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
 *  Config - RabbitMQ 
************************/
const username = config.get('username');
const password = config.get('password');
const amqpConfig = {
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

/************************
 *  Config - Kafka
************************/

const kafkaConfig = {
  clientId: 'ddi',
  brokers: ['digest-api.chtwrs.com:9092'],
};

/************************
 *     Set Up - Bot
************************/
const botKey = config.get('botKey');
const Bot = require('./bot');
const bot = new Bot(botKey, username, password);

bot.registerAMQPConfig(amqpConfig);
bot.registerKafkaConfig(kafkaConfig);
bot.registerKnex(knex);

bot.setupAMQP().catch(console.error);
bot.setupKafka().catch(console.error);
setInterval(() => {
  bot.setupAMQP().catch(console.error);
  bot.setupKafka().catch(console.error);
}, 3 * 60 * 1000);

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

