const amqp = require('amqplib');

const config = require('../config');

const { hostname, locale, username, vhost, password, port, protocol } = config.getProperties();
const frameMax = 0;
const heartbeat = 60;

function sendMessages(channel, queueName, messageId = 1, maxMessages = 15) {
  if (messageId > maxMessages) {
    return;
  }

  channel.sendToQueue(queueName, new Buffer(`Message ${messageId}`));
  console.log(`Sent message ${messageId}`);
  setTimeout(() => {
    sendMessages(channel, queueName, messageId + 1);
  }, 1000);
}

amqp.connect({ frameMax, heartbeat, hostname, locale, username, vhost, password, port, protocol })
.then((connection) => {
  const closeConnection = connection.close.bind(connection);
  process.once('SIGINT', () => {
    closeConnection();
    console.log('\nConnection has been closed.');
    process.exit();
  });
  return connection.createChannel();
})
.then((channel) => {
  const queueName = 'test';
  channel.assertQueue(queueName, { durable: false });

  setTimeout(() => {
    console.log("Will send messages now");
    sendMessages(channel, queueName);
  }, 1000);
});