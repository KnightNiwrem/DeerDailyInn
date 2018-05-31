const convict = require('convict');
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';

// Define a schema
const config = convict({
  hostname: {
    doc: 'The hostname for the rabbitmq connection',
    default: 'localhost',
    env: 'DDI_RABBITMQ_HOSTNAME',
  },
  locale: {
    doc: 'The locale for the rabbitmq connection',
    default: 'en_US',
    env: 'DDI_RABBITMQ_LOCALE',
  },
  username: {
    doc: 'The username for the rabbitmq connection',
    default: '',
    env: 'DDI_RABBITMQ_USERNAME',
  },
  vhost: {
    doc: 'The vhost for the rabbitmq connection',
    default: '/',
    env: 'DDI_RABBITMQ_VHOST',
  },
  password: {
    doc: 'The password for the rabbitmq connection',
    default: '',
    env: 'DDI_RABBITMQ_PASSWORD',
  },
  port: {
    doc: 'The port for the rabbitmq connection',
    format: 'port',
    default: 5672,
    env: 'DDI_RABBITMQ_PORT',
  },
  protocol: {
    doc: 'The protocol for the rabbitmq connection',
    default: 'amqp',
    env: 'DDI_RABBITMQ_PROTOCOL',
  },
});

// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;
