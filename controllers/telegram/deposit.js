const _ = require('lodash');
const Promise = require('bluebird');
const { transaction } = require('objection');
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

const makeBadArgumentMessage = (chatId) => {
  const text = `You need to specify a valid amount of gold \
pouches that you would like to deposit!`;

  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeAuthorizationRequest = (chtwrsToken, amount, transactionId) => {
  const message = JSON.stringify({
    action: 'authorizePayment',
    payLoad: {
      amount: {
        pouches: amount
      },
      transactionId: `${transactionId}`
    },
    token: chtwrsToken
  });
  return message;
};

const deposit = async (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in deposit: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in deposit: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;
  let depositAmount = parseInt(params.options[0]);
  if (!_.isInteger(depositAmount) || depositAmount < 1) {
    const message = makeBadArgumentMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }

  const depositTransaction = transaction(bot.knex, async (transactionObject) => {
    const user = await User.query(transactionObject).where('telegramId', telegramId).first();
    if (_.isNil(user) || _.isEmpty(user.chtwrsToken)) {
      const message = makeUnregisteredMessage(chatId);
      bot.sendTelegramMessage('sendMessage', message);
      return Promise.reject(`Rejected in deposit: User ${telegramId} is not registered.`);
    }

    const pendingDeposits = await Transaction.query(transactionObject)
    .whereIn('status', ['pending', 'started'])
    .andWhere({ fromId: 0, toId: user.id });

    const pendingDepositTransactionIds = pendingDeposits.map((pendingDeposit) => pendingDeposit.id);
    await Transaction.query(transactionObject)
    .patch({ status: 'cancelled' })
    .whereIn('id', pendingDepositTransactionIds);

    const transactionAttributes = {
      fromId: 0,
      quantity: depositAmount * 100,
      reason: 'User invoked /deposit command',
      status: 'started',
      toId: user.id
    };
    const recordedTransaction = await Transaction.create(transactionAttributes, transactionObject);
    return Promise.all([user, recordedTransaction]);
  });

  return Promise.resolve(depositTransaction)
  .then(([user, transaction]) => {
    const request = makeAuthorizationRequest(user.chtwrsToken, depositAmount, transaction.id);
    return bot.sendChtwrsMessage(request);
  });
};

module.exports = deposit;
