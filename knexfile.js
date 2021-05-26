import { config } from 'dotenv';

const env = config({
  example: './configs/.env.example',
  defaults: './configs/.env.defaults',
  path: './configs/.env',
  safe: true,
});

const knexConfig = {
  client: 'pg',
  connection: {
    database : env.DB_DATABASE,
    host : env.DB_HOST,
    password : env.DB_PASSWORD,
    port: env.DB_PORT,
    user : env.DB_USERNAME,
  },
};

export {
  development: knexConfig,
  staging: knexConfig,
  production: knexConfig,
};
