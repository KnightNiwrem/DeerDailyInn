const _ = require('lodash');
const { transaction } = require('objection');
const User = require('../../models/user');
const Transaction = require('../../models/transaction');

const respondToAuth = (content, bot) => {
  const userAttributes = {
    telegramId: content.payload.userId
  };
  User.findOrCreate(userAttributes)
  .then()
  .catch(console.warn);
};

const respondToGrant = (content, bot) => {
  const userAttributes = {
    chtwrsId: content.payload.id,
    chtwrsToken: content.payload.token
  };
  User.query()
  .patch(userAttributes)
  .where('telegramId', content.payload.userId)
  .then(() => {
    const respondToGrantMessage = JSON.stringify({
      chat_id: content.payload.userId,
      text: 'Great! That seemed to have worked! You have been authenticated and are ready to go!'
    });
    return bot.sendTelegramMessage('sendMessage', respondToGrantMessage);
  })
  .catch(console.warn);
};

const requestConfirmationText = `Great! Please confirm the deposit \
using the confirmation code from @chtwrsbot.

To confirm, please do:
/confirm [confirmation code from @chtwrsbot]`;

const contactDeveloperText = `Sorry! There seems to be a problem \
with your request. Please try again. If you believe that this \
message was sent in error, please contact @knightniwrem instead.`;

const respondToAuthorizePayment = (content, bot) => {
  const telegramId = content.payload.userId;
  const transactionId = content.payload.transactionId;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';
  const status = hasSuccessfulResult ? 'pending' : 'cancelled';
  const text = hasSuccessfulResult ? requestConfirmationText : contactDeveloperText;
  const attributes = {
    apiStatus: content.result,
    status: status
  };
  Transaction.query()
  .patch(attributes)
  .where('id', transactionId)
  .first()
  .then(() => {
    const message = JSON.stringify({
      chat_id: telegramId,
      text: text
    });
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

const respondToPay = (content, bot) => {
  const transactionId = content.payload.transactionId;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';

  const depositTransaction = transaction(bot.knex, async (transactionObject) => {
    const transaction = await Transaction.query(transactionObject).where('id', transactionId).first();
    const user = await User.query(transactionObject).where('id', transaction.toId).first();
    const telegramId = user.telegramId;

    let finalBalance = user.balance;
    if (hasSuccessfulResult) {
      finalBalance = user.balance + content.payload.debit.gold;
      await user.$query(transactionObject).patch({ 
        balance: finalBalance 
      });
    }

    const status = hasSuccessfulResult ? 'completed' : 'pending';
    await transaction.$query(transactionObject).patch({
      apiStatus: content.result,
      status: status
    });

    const text = hasSuccessfulResult ? `Your deposit request is successful! Your new balance is ${finalBalance} gold.` : contactDeveloperText;
    const message = JSON.stringify({
      chat_id: telegramId,
      text: text
    });
    return bot.sendTelegramMessage('sendMessage', message);
  });

  return Promise.resolve(depositTransaction);
};

const respondToPayout = (content, bot) => {
  const telegramId = content.payload.userId;
  const transactionId = content.payload.transactionId;
  const hasSuccessfulResult = content.result.toLowerCase() === 'ok';

  const withdrawalTransaction = transaction(bot.knex, async (transactionObject) => {
    const attributes = {
      apiStatus: content.result,
      status: hasSuccessfulResult ? 'completed' : 'pending'
    };
    const transaction = await Transaction.query(transactionObject).patch(attributes).where('id', transactionId);
    const user = await User.query(transactionObject).where('telegramId', telegramId).first();

    if (!hasSuccessfulResult) {
      await user.$query(transactionObject).patch({ 
        balance: user.balance + content.payload.debit.gold 
      });
    }

    const text = hasSuccessfulResult ? `Your withdrawal request is successful! Your new balance is ${finalBalance} gold.` : contactDeveloperText;
    const message = JSON.stringify({
      chat_id: telegramId,
      text: text
    });
    return bot.sendTelegramMessage('sendMessage', message);
  });

  return Promise.resolve(withdrawalTransaction);
};

const respondToUnknown = (content) => {
  console.warn(`Inbound queue: ${content.action} returned status code ${content.result}`);
};

const inboundResponders = {
  'authorizePayment': respondToAuthorizePayment,
  'createAuthCode': respondToAuth,
  'grantToken': respondToGrant,
  'pay': respondToPay,
  'payout': respondToPayout
};

const inboundErrorResponders = {
  'authorizePayment': respondToAuthorizePayment,
  'pay': respondToPay,
  'payout': respondToPayout
};

const inbound = (params) => {
  if (_.isNil(params.bot)) {
    console.warn('Inbound queue: Bot cannot be missing');
    return;
  }

  const bot = params.bot;
  const content = JSON.parse(params.rawMessage.content.toString());
  if (_.isEmpty(content.action) && !_.isEmpty(content.payload.operation)) {
    content.action = 'authAdditionalOperation';
  }

  const responderMap = content.result.toLowerCase() === 'ok' ? inboundResponders : inboundErrorResponders;
  const action = content.action;
  const responder = responderMap[action];
  const usableResponder = !_.isNil(responder) ? responder : respondToUnknown;
  usableResponder(content, bot);
};

module.exports = inbound;
