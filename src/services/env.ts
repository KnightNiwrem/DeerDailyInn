import { config } from 'dotenv';

const { error, parsed } = config({
  path: 'configs/.env',
});
if (error) {
  throw error;
}
if (!parsed) {
  const errorText = `Rejected at services/env: dotenv.config().parsed \
is undefined!`;
  throw new Error(errorText);
}

const env = parsed;
export { env };
