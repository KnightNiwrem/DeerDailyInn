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
  if (statusCode === 'ok') {
    const responder = inboundResponders.get(content.action) ?? unknown;
    await responder(content);
    return;
  }
  if (statusCode === 'forbidden') {
    await forbidden(content);
    return;
  }
  if (statusCode === 'invalidtoken') {
    await invalidToken(content);
    return;
  }

  const responder = inboundErrorResponders.get(content.action) ?? unknown;
  await responder(content);
};

const loadAMQPRoutes = () => {
  amqpChannel.consume(`${env.RABBITMQ_USERNAME}_ti`, eachMessage, { noAck: true });
};

export { loadAMQPRoutes };
