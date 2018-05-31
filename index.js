const { isNil, isEmpty } = require('lodash');

//const RabbitMQService = require('./services/rabbitmq');
const TelegramService = require('./services/telegram');

const telegramService = new TelegramService();
const telegramMessageSubject = telegramService.getMessageSubject();

telegramMessageSubject.subscribe((request) => {
  // Ignore response without text messages
  const update = request.body;
  if (isNil(update.message) || isEmpty(update.message.text)) {
    return;
  }

  const chat_id = update.message.chat.id;
  const text = update.message.text;
  const request = { chat_id, text };

  telegramService.sendMessage({ request });
});