import { env } from 'services/env';

const config = {
  client: 'pg',
  connection: {
    database: env.DB_DATABASE,
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    port: Number(env.DB_PORT),
    user: env.DB_USERNAME,
  },
};

export {
  config as development,
  config as staging,
  config as production,
};
