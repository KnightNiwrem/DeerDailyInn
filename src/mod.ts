import { isSafeInteger } from 'lodash';
import * as Models from 'models/mod';
import { loadAMQPRoutes } from 'routes/amqp';
import { loadBotRoutes } from 'routes/grammy';
import { loadKafkaRoutes } from 'routes/kafka';
import { env } from 'services/env';
import { startREPLServer } from 'utils/startREPLServer';

const consolePort = Number(env.CONSOLE_PORT);
if (isSafeInteger(consolePort)) {
  startREPLServer(consolePort, { ...Models });
}

loadAMQPRoutes();
loadKafkaRoutes();
loadBotRoutes();
