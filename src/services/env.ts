import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { forEach } from 'lodash-es';
import { URL } from 'url';

import type { DotenvParseOutput } from 'dotenv';

const configPath = (new URL('../../configs', import.meta.url)).pathname;
const configFiles = await readdir(configPath);

const envExt = '.env';
const envFilePaths = configFiles
  .filter(filename => filename.endsWith(envExt))
  .map(filename => `${configPath}/${filename}`);

const env: DotenvParseOutput = {};
forEach(envFilePaths, path => {
  const { error, parsed } = config({ path });
  if (error) {
    throw error;
  }
  if (parsed) {
    Object.assign(env, parsed);
  }
});

export { env };
