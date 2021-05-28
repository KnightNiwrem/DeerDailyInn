import { config } from 'dotenv';
import { URL } from 'url';

const envFileURL = new URL('../../configs/.env', import.meta.url);
const envFilePath = envFileURL.pathname;
const { error, parsed } = config({ path: envFilePath });
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
