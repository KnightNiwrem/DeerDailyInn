import { env } from 'services/env';

const config = {
  client: 'pg',
  connection: {
    database: env.POSTGRES_DB,
    host: env.POSTGERS_HOST,
    password: env.POSTGRES_PASSWORD,
    port: Number(env.POSTGRES_PORT),
    user: env.POSTGRES_USER,
  },
};

export {
  config as development,
  config as staging,
  config as production,
};
