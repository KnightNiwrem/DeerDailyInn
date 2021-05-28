import { apiThrottler } from '@grammyjs/transformer-throttler';
import {
  auth,
  authextra,
  balance,
  buy,
  cancel,
  coffee,
  confirm,
  deals,
  deposit,
  getinfo,
  help,
  info,
  inspect,
  orders,
  start,
  status,
  transfer,
  unknown,
  withdraw,
  wtb,
} from 'controllers/grammy/mod.js';
import express from 'express';
import { webhookCallback } from 'grammy';
import { isEmpty, isSafeInteger } from 'lodash-es';
import { connect } from 'ngrok';
import { env } from 'services/env.js';
import { bot } from 'services/grammy.js';
import { buildHearsRegex } from 'utils/buildHearsRegex.js';

const loadBotRoutes = async () => {
  bot.api.config.use(apiThrottler());

  const textComposer = bot.on('message:text');
  textComposer.hears(buildHearsRegex('auth', 1), auth);
  textComposer.hears(buildHearsRegex('authextra', 2), authextra);
  textComposer.hears(buildHearsRegex('balance', 0), balance);
  textComposer.hears(buildHearsRegex('buy', 3), buy);
  textComposer.hears(buildHearsRegex('cancel', 1), cancel);
  textComposer.hears(buildHearsRegex('coffee', 0), coffee);
  textComposer.hears(buildHearsRegex('confirm', 1), confirm);
  textComposer.hears(['deals', 'purchases', 'sales'].map(cmd => buildHearsRegex(cmd, Infinity)), deals);
  textComposer.hears(buildHearsRegex('deposit', 1), deposit);
  textComposer.hears(buildHearsRegex('getinfo', 0), getinfo);
  textComposer.hears(buildHearsRegex('help', 0), help);
  textComposer.hears(buildHearsRegex('info', 0), info);
  textComposer.hears(buildHearsRegex('inspect', 2), inspect);
  textComposer.hears(buildHearsRegex('orders', 0), orders);
  textComposer.hears(buildHearsRegex('start', 0), start);
  textComposer.hears(buildHearsRegex('status', 0), status);
  textComposer.hears(buildHearsRegex('transfer', 3), transfer);
  textComposer.hears(buildHearsRegex('withdraw', 1), withdraw);
  textComposer.hears(buildHearsRegex('wtb', 3), wtb);
  textComposer.use(unknown);

  bot.catch(console.warn);

  const botPort = isSafeInteger(Number(env.BOT_PORT))
    ? Number(env.BOT_PORT)
    : 3000;
  const botHost = !isEmpty(env.BOT_HOST)
    ? env.BOT_HOST
    : await connect(botPort);

  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot));
  app.listen(botPort, () => {
    console.log(`Bot routes loaded and listening on ${botPort}`);
  });

  const webhook = `${botHost}/bot${env.BOT_TOKEN}`;
  console.log(`Bot will listen on ${webhook}`);
  await bot.api.setWebhook(webhook);
};

export { loadBotRoutes };
