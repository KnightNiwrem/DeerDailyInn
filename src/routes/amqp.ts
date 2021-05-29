import {
  auth,
  authAdditionalOperation,
  authorizePayment,
  forbidden,
  getInfo,
  grantAdditionalOperation,
  grantToken,
  invalidToken,
  pay,
  payout,
  unknown,
  wantToBuy,
} from 'controllers/amqp/mod.js';
import { isEmpty } from 'lodash-es';
import { amqpChannel } from 'services/amqp.js';
import { env } from 'services/env.js';

import type { ConsumeMessage } from 'amqplib';

const inboundResponders = new Map([
  ['auth', auth],
  ['authAdditionalOperation', authAdditionalOperation],
  ['authorizePayment', authorizePayment],
  ['getInfo', getInfo],
  ['grantAdditionalOperation', grantAdditionalOperation],
  ['grantToken', grantToken],
  ['pay', pay],
  ['payout', payout],
  ['wantToBuy', wantToBuy],
]);

const inboundErrorResponders = new Map([
  ['authorizePayment', authorizePayment],
  ['pay', pay],
  ['payout', payout],
  ['wantToBuy', wantToBuy],
]);

const eachMessage = async (message: ConsumeMessage | null) => {
  if (!message || message.fields.redelivered) {
    return;
  }

  const content = JSON.parse(message.content.toString());
  if (isEmpty(content.action) && !isEmpty(content.payload.operation)) {
    content.action = 'authAdditionalOperation';
  }

  const statusCode = content.result.toLowerCase();
  let responder = unknown;
  if (statusCode === 'ok') {
    responder = inboundResponders.get(content.action) ?? unknown;
  } else if (statusCode === 'forbidden') {
    responder = forbidden;
  } else if (statusCode === 'invalidtoken') {
    responder = invalidToken;
  } else {
    responder = inboundErrorResponders.get(content.action) ?? unknown;
  }

  try {
    await responder(content);
  } catch (err) {
    console.warn(err);
  }
};

const loadAMQPRoutes = () => {
  amqpChannel.consume(`${env.RABBITMQ_USERNAME}_i`, eachMessage, { noAck: true });
};

export { loadAMQPRoutes };
