import { deals, offers } from 'controllers/kafka/mod.js';
import { kafkaConsumer } from 'services/kafka.js';

import type { EachMessagePayload } from 'kafkajs';

const controllers = new Map([
  ['deals', deals],
  ['offers', offers],
]);

const eachMessage = async (payload: EachMessagePayload) => {
  const { message, topic } = payload;
  const [_, controllerName] = topic.split('-');
  const controller = controllers.get(controllerName);
  if (!controller) {
    return;
  }

  const text = message.value?.toString();
  if (!text) {
    return;
  }
  try {
    const content = JSON.parse(text);
    await controller(content);
  } catch (err) {
    console.error(err);
  }
};

const loadKafkaRoutes = () => {
  kafkaConsumer.subscribe({ topic: 'cw2-offers' });
  kafkaConsumer.subscribe({ topic: 'cw2-deals' });

  kafkaConsumer.run({ eachMessage });
};

export { loadKafkaRoutes };
