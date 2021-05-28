import { isSafeInteger } from 'lodash-es';
import * as Models from 'models/mod.js';
import { loadAMQPRoutes } from 'routes/amqp.js';
import { loadBotRoutes } from 'routes/grammy.js';
import { loadKafkaRoutes } from 'routes/kafka.js';
import { loadDB } from 'services/database.js';
import { env } from 'services/env.js';
import { startREPLServer } from 'utils/startREPLServer.js';

loadDB();

const consolePort = Number(env.CONSOLE_PORT);
if (isSafeInteger(consolePort)) {
  startREPLServer(consolePort, { ...Models });
}

loadAMQPRoutes();
loadKafkaRoutes();
loadBotRoutes();
