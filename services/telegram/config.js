const convict = require('convict');
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';

// Define a schema
const config = convict({
  hostname: {
    doc: 'The hostname for receiving telegram updates',
    default: '',
    env: 'DDI_TELEGRAM_HOSTNAME',
  },
  port: {
    doc: 'The port for the telegram server connection',
    format: 'port',
    default: 3000,
    env: 'DDI_TELEGRAM_PORT',
  },
  token: {
    doc: 'The token for the telegram bot',
    default: '',
    env: 'DDI_TELEGRAM_TOKEN',
  }
});

// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;
