const Promise = require('bluebird');
const _ = require('lodash');
const amqp = require('amqplib');
const uuid = require('node-uuid');
const config = require('./config');

const fetch = require('node-fetch');
fetch.Promise = Promise;

const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const redisClient = redis.createClient();

const botKey = config.get('botKey');
const username = config.get('username');
const password = config.get('password');
const ip = config.get('ip');
const port = config.get('port');

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
 *        Work 
*********************/

const Bot = require('./bot');
const bot = new Bot(botKey, username, password, ip, port);

setUpPromise
.then((connectionAndChannel) => {
  const [connection, channel] = connectionAndChannel;

  bot.registerConnection(connection);
  bot.registerChannel(channel);
  bot.registerRedisClient(redisClient);

  bot.subscribeToInboundQueue();
  bot.subscribeToOffersQueue();
  bot.subscribeToDealsQueue();
  bot.sendInitializationMessage();
})
.catch(console.warn);

