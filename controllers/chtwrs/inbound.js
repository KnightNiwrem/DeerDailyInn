const _ = require('lodash');
const User = require('../../models/user');

const respondToAuth = (content, bot) => {
  const userAttributes = {
    telegramId: content.payload.userId
  };
  User.findOrCreate(userAttributes).catch(console.warn);
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
}

const respondToUnknown = (content) => {
  console.warn(`Inbound queue: received unknown action '${content.action}'`);
};

const inboundResponders = {
  'createAuthCode': respondToAuth,
  'grantToken', respondToGrant
};

const inbound = (params) => {
  if (_.isNil(params.bot)) {
    console.warn('Inbound queue: Bot cannot be missing');
    return;
  }

  const content = JSON.parse(params.rawMessage.content.toString());
  if (content.result.toLowerCase() !== 'ok') {
    console.warn(`Inbound queue: ${content.action} returned status code ${content.result}`);
    return;
  }

  const bot = params.bot;
  const action = content.action;
  const responder = inboundResponders[action];
  const usableResponder = !_.isNil(responder) ? responder : respondToUnknown;
  usableResponder(content, bot);
};

module.exports = inbound;
