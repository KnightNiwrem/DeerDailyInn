import { loadAMQPRoutes } from 'routes/amqp';
import { loadBotRoutes } from 'routes/grammy';
import { loadKafkaRoutes } from 'routes/kafka';

loadAMQPRoutes();
loadKafkaRoutes();
loadBotRoutes();
