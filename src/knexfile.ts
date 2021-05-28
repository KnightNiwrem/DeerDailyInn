import { env } from 'services/env.js';
import { URL } from 'url';

const migrationDirURL = new URL('../migrations', import.meta.url);
const migrationDirPath = migrationDirURL.pathname;

const config = {
  client: 'pg',
  connection: {
    database: env.POSTGRES_DB,
    host: env.POSTGERS_HOST,
    password: env.POSTGRES_PASSWORD,
    port: Number(env.POSTGRES_PORT),
    user: env.POSTGRES_USER,
  },
  migrations: {
    directory: migrationDirPath,
  },
};

export {
  config as development,
  config as staging,
  config as production,
};
