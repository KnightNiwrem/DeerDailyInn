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
    body: body,
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

    if (!message.fields.redelivered) {
      console.log(logTitle);
      console.log(message.content.toString());
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
})
.catch(console.warn);

