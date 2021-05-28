import { connect } from 'amqplib';
import { env } from 'services/env.js';

const config = {
  protocol: env.RABBITMQ_PROTOCOL,
  hostname: env.RABBITMQ_HOST,
  port: Number(env.RABBITMQ_PORT),
  username: env.RABBITMQ_USERNAME,
  password: env.RABBITMQ_PASSWORD,
  locale: 'en_US',
  frameMax: 0,
  heartbeat: 60,
  vhost: '/',
};

const connection = await connect(config);
const channel = await connection.createChannel();

const sendChtwrsMessage = async (message: string) => {
  const messageBuffer = Buffer.from(message);
  const options = { contentType: 'application/json' };
  return channel.publish(
    `${env.RABBITMQ_USERNAME}_ex`,
    `${env.RABBITMQ_USERNAME}_o`,
    messageBuffer,
    options,
  );
};

export { channel as amqpChannel, connection as amqpConnection, sendChtwrsMessage };
