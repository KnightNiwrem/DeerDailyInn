import { config } from 'dotenv';

const { error, parsed } = config({
  path: '../configs/.env',
});
if (!parsed) {
  throw new Error('Rejected at services/env: dotenv.config().parsed is undefined!');
}

const env = parsed;
export { env };
