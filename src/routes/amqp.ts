import {
  auth,
  authAdditionalOperation,
  authorizePayment,
  getInfo,
  grantAdditionalOperation,
  grantToken,
  pay,
  payout,
  wantToBuy,
} from 'controllers/amqp/mod';
import { isEmpty } from 'lodash';
import { amqpChannel } from 'services/amqp';
import { env } from 'services/env';

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

const respondToUnknown = async (content: any) => {
  console.warn(`Inbound queue: ${content.action} returned status code ${content.result}`);
};

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
    const responder = inboundResponders.get(content.action) ?? respondToUnknown;
    await responder(content);
    return;
  }
  /* else if (statusCode === 'forbidden') {
    responder = respondToForbidden;
  } else if (statusCode === 'invalidtoken') {
    responder = respondToInvalidToken;
  } */

  const responder = inboundErrorResponders.get(content.action) ?? respondToUnknown;
  await responder(content);
};

const loadAMQPRoutes = () => {
  amqpChannel.consume(`${env.RABBITMQ_USERNAME}_i`, eachMessage, { noAck: true });
};

export { loadAMQPRoutes };
