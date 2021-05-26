import { Kafka } from 'kafkajs';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { env } from 'services/env';

const brokers = [env.KAFKA_BROKER];
const clientId = customAlphabet(alphanumeric, 16)();
const groupId = env.KAFKA_GROUP_ID;

const kafka = new Kafka({ clientId, brokers });
const consumer = kafka.consumer({ groupId });
await consumer.connect();

export { consumer as kafkaConsumer };
