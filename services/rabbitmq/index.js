const amqp = require('amqplib');
const { ReplaySubject } = require('rxjs');
const config = require('./config');

const { hostname, locale, username, vhost, password, port, protocol } = config.getProperties();
const frameMax = 0;
const heartbeat = 60;

class RabbitMQService {
  constructor({ 
    frameMax = RabbitMQService.defaultFrameMax, 
    heartbeat = RabbitMQService.defaultHeartbeat, 
    hostname = RabbitMQService.defaultHostname, 
    locale = RabbitMQService.defaultLocale, 
    username = RabbitMQService.defaultUsername, 
    vhost = RabbitMQService.defaultVhost, 
    password = RabbitMQService.defaultPassword, 
    port = RabbitMQService.defaultPort, 
    protocol = RabbitMQService.defaultProtocol 
  } = {}) {
    this.options = { frameMax, heartbeat, hostname, locale, username, vhost, password, port, protocol };

    this.connectionSubject = new ReplaySubject(1);
    this.channelSubject = new ReplaySubject(1);
    this.queues = new Map();

    this.connect();
  }

  async connect(options = this.options) {
    const connection = await amqp.connect(options);
    const channel = await connection.createChannel();

    this.connectionSubject.next(connection);
    this.channelSubject.next(channel);
  }

  addQueue(queue, options = {}, messageBuffer = 10) {
    if (this.queues.has(queue)) {
      return;
    }

    const queueObject = {};

    const subject = new ReplaySubject(messageBuffer);
    queueObject.subject = subject;

    const subscription = this.channelSubject.subscribe({
      next: async (channel) => {
        const { consumerTag } = await channel.consume(queue, (msg) => subject.next(msg), options);
        const cancel = () => { channel.cancel(consumerTag); };
        queueObject.cancel = cancel;
      }
    });
    queueObject.subscription = subscription;

    this.queues.set(queue, queueObject);
  }

  removeQueue(queue) {
    if (!this.queues.has(queue)) {
      return;
    }

    const { cancel, subject, subscription } = this.queues.get(queue);
    cancel();
    subscription.unsubscribe();
    
    this.queues.delete(queue);
  }

  getSubject(queue) {
    if (!this.queues.has(queue)) {
      return;
    }

    const { cancel, subject, subscription } = this.queues.get(queue);
    return subject;
  }
}

RabbitMQService.defaultFrameMax = frameMax;
RabbitMQService.defaultHeartbeat = heartbeat;
RabbitMQService.defaultHostname = hostname;
RabbitMQService.defaultLocale = locale;
RabbitMQService.defaultUsername = username;
RabbitMQService.defaultVhost = vhost;
RabbitMQService.defaultPassword = password;
RabbitMQService.defaultPort = port;
RabbitMQService.defaultProtocol = protocol;

module.exports = RabbitMQService;