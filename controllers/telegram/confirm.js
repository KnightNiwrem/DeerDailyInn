const _ = require('lodash');
const Promise = require('bluebird');
const User = require('../../models/user');
const Transaction = require('../../models/transaction');

const makeUnregisteredMessage = (chatId) => {
  const text = `Hi, you don't seem to \
be registered yet! Do /start to register first!`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeMissingArgumentMessage = (chatId) => {
  const text = `Sorry, I think you might have \
forgotten to send the confirmation code with this command.`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeNoPendingDepositMessage = (chatId) => {
  const text = `Sorry, we could not find any pending \
deposit actions that requires confirmation. If you wish to \
deposit gold pouches, please use the /deposit command first!

To deposit, please do:
/deposit [amount of gold pouches]`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeConfirmationReceiptMessage = (chatId) => {
  const text = `Great! Let me check \
if the confirmation code supplied is correct.`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makePayRequest = (chtwrsToken, confirmationCode, amount, transactionId) => {
  const message = JSON.stringify({
    action: 'pay',
    payload: {
      amount: {
        pouches: amount
      },
      confirmationCode: confirmationCode,
      transactionId: `${transactionId}`
    },
    token: chtwrsToken
  });
  return message;
};

const confirm = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in confirm: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in confirm: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  if (_.isEmpty(params.options)) {
    const message = makeMissingArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const telegramId = params.telegramId;
  const confirmationCode = params.options[0];

  return User.query()
  .where('telegramId', telegramId)
  .first()
  .then((user) => {
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const transaction = Transaction.query()
    .where({
      fromId: user.id,
      isCommitted: false
    })
    .orderBy('id', 'desc')
    .first();
    return Promise.all([user, transaction]);
  })
  .then(([user, transaction]) => {
    if (_.isNil(transaction)) {
      const message = makeNoPendingDepositMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const amount = transaction.quantity / 100;
    const request = makePayRequest(user.chtwrsToken, confirmationCode, amount, transaction.id);
    const message = makeConfirmationReceiptMessage(chatId);
    return bot.sendChtwrsMessage(request)
    .then(() => bot.sendTelegramMessage('sendMessage', message));
  });
};

module.exports = confirm;
