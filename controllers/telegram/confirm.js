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

const confirm = async (params) => {
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

  const confirmTransaction = transaction(bot.knex, async (transactionObject) => {
    const user = await User.query(transactionObject).where('telegramId', telegramId).first();
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      bot.sendTelegramMessage('sendMessage', message);
      return Promise.reject(`Rejected in confirm: User ${telegramId} is not registered.`);
    }

    const transactionAttributes = {
      fromId: 0,
      status: 'pending',
      toId: user.id
    };
    const transaction =  await Transaction.query(transactionObject)
    .where(attributes)
    .orderBy('id', 'desc')
    .first();
    if (_.isNil(transaction)) {
      const message = makeNoPendingDepositMessage(chatId);
      bot.sendTelegramMessage('sendMessage', message);
      return Promise.reject(`Rejected in confirm: User ${telegramId} does not have pending deposit transactions.`);
    }
    return Promise.all([user, transaction]);
  });

  return Promise.resolve(confirmTransaction)
  .then(([user, transaction]) => {
    const amount = transaction.quantity / 100;
    const request = makePayRequest(user.chtwrsToken, confirmationCode, amount, transaction.id);
    const message = makeConfirmationReceiptMessage(chatId);
    return bot.sendChtwrsMessage(request)
    .then(() => bot.sendTelegramMessage('sendMessage', message));
  });
};

module.exports = confirm;
