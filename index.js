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
 *      Utility 
*********************/

function createRouter(connection, channel, logTitle) {
  var isOff = false;
  return function(message) {
    // This is where your "attempt" does work
    // has connection, channel and message
    // To further modularize: route connection, channel
    // and message elsewhere

    if (message.fields.redelivered) {
      return;
    }

    if (isOff) {
      return;
    }

    if (logTitle === 'New Offer!' || logTitle === 'New Inbound Message') {
      isOff = true;
      const notificationMessage = {
        chat_id: 41284431,
        text: `Queue for ${logTitle} has been turned off`
      };
      makeTelegramRequest('sendMessage', notificationMessage);
      return;
    }

    if (logTitle === 'New Deal!') {
      const content = JSON.parse(message.content.toString());
      const sellerId = content.sellerId;
      const listenerId = '85c8421558ec4c0098fda3003b460f0f';

      if (sellerId === listenerId) {
        const messageBody = {
          chat_id: 41284431,
          text: `${content.buyerCastle}${content.buyerName} purchased ${content.qty} ${content.item} from you at ${content.price} each.`,
        }
        makeTelegramRequest('sendMessage', messageBody);
      }
    }
  };
}

/*********************
 *        Work 
*********************/

const Bot = require('./bot');
const bot = new Bot(botKey, username, password, ip, port);

setUpPromise
.then((connectionAndChannel) => {
  const [connection, channel] = connectionAndChannel;
  const inboundRouter = createRouter(connection, channel, 'New Inbound Message');
  const offersRouter = createRouter(connection, channel, 'New Offer!');
  const dealsRouter = createRouter(connection, channel, 'New Deal!');

  bot.registerConnection(connection);
  bot.registerChannel(channel);
  bot.registerRedisClient(redisClient);

  bot.subscribeToQueue(`${username}_i`, inboundRouter, {noAck: true});
  bot.subscribeToQueue(`${username}_offers`, offersRouter, {noAck: true});
  bot.subscribeToQueue(`${username}_deals`, dealsRouter, {noAck: true});
  bot.sendInitializationMessage();
})
.catch(console.warn);

