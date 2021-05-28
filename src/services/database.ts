import knex from 'knex';
import { Model } from 'objection';
import { env } from 'services/env.js';

const config = {
  client: 'pg',
  connection: {
    database: env.POSTGRES_DB,
    host: env.POSTGRES_HOST,
    password: env.POSTGRES_PASSWORD,
    port: Number(env.POSTGRES_PORT),
    user: env.POSTGRES_USER,
  },
};

const loadDB = () => {
  const knexInstance = knex(config);
  Model.knex(knexInstance);
};

export { loadDB };
