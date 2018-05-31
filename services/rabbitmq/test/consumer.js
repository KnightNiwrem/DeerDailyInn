const RabbitMQService = require('../index');

const rabbitMQService = new RabbitMQService();
const testQueue = 'test';
rabbitMQService.addQueue(testQueue, { noAck: true });
rabbitMQService.addQueue(testQueue, { noAck: true }); // duplicate

// Basic subscription to the subject
const messageSubjectA = rabbitMQService.getSubject(testQueue);
const subscriberA = messageSubjectA.subscribe({
  next: (msg) => {
    console.log(`Subscriber A received: ${msg.content}`);
  }
});

// "Late" subscribers will still receive replayed messages
// in subject - up till number of buffered messages
setTimeout(() => {
  const subscriberB = messageSubjectA.subscribe({
    next: (msg) => {
      console.log(`Subscriber B received: ${msg.content}`);
    }
  });
}, 3000);

// Gracefully stop subscribing to messages if queue is removed
setTimeout(() => {
  rabbitMQService.removeQueue(testQueue);
  rabbitMQService.removeQueue(testQueue); // duplicate
}, 6000);

// Messages sent after queue is removed will be consumed
// later when the queue is added back again
setTimeout(() => {
  rabbitMQService.addQueue(testQueue, { noAck: true });

  const messageSubjectB = rabbitMQService.getSubject(testQueue);
  const subscriberC = messageSubjectB.subscribe({
    next: (msg) => {
      console.log(`Subscriber C received: ${msg.content}`);
    }
  });
}, 10000);

// Clean up
setTimeout(() => {
  rabbitMQService.removeQueue(testQueue);
}, 25000);



