const convict = require('convict');
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';

// Define a schema
const config = convict({
  ip: {
    doc: 'The IP address for the server to bind to.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'DEER_DAILY_IP',
  },
  port: {
    doc: 'The port for the server to bind to.',
    format: 'port',
    default: 8080,
    env: 'DEER_DAILY_PORT',
  },
  username: {
    doc: 'The username for the Deer Daily App',
    default: '',
    env: 'DEER_DAILY_USERNAME',
  },
  password: {
    doc: 'The password for the Deer Daily App',
    default: '',
    env: 'DEER_DAILY_PASSWORD',
  },
  botKey: {
    doc: 'The api key for the Deer Daily App Bot',
    default: '',
    env: 'DEER_DAILY_BOT_KEY'
  },
  db: {
    host: {
      doc: 'The database host for the Deer Daily App',
      default: '127.0.0.1',
      env: `DEER_DAILY_DB_HOST_${nodeEnv}`
    },
    port: {
      doc: 'The database port for the Deer Daily App',
      default: 5432,
      env: `DEER_DAILY_DB_PORT_${nodeEnv}`
    },
    database: {
      doc: 'The database name for the Deer Daily App',
      default: 'deer_daily_inn',
      env: `DEER_DAILY_DB_NAME_${nodeEnv}`
    },
    username: {
      doc: 'The database username for the Deer Daily App',
      default: 'deer_daily_inn',
      env: `DEER_DAILY_DB_USERNAME_${nodeEnv}`
    },
    password: {
      doc: 'The database password for the Deer Daily App',
      default: 'deer_daily_inn',
      env: `DEER_DAILY_DB_PASSWORD_${nodeEnv}`
    }
  },
});

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;
