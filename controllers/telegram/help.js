const _ = require('lodash');
const Promise = require('bluebird');

const makeHelpMessage = (chatId) => {
  const helpText = `Here are the currently available commands:
/start - Gets authorization code from @chtwrsbot for registration
/auth [authorization code] - Completes registration
/sales (optional limit, max 100) - Displays your recent sales
/purchases (optional limit, max 100) - Displays your recent purchases
/deals (optional limit, max 200) - Displays your recent sales and purchases
/help - Display this help message`;
  
  const helpMessage = JSON.stringify({
    chat_id: chatId,
    text: helpText
  });
  return helpMessage;
};

const help = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in help: Bot cannot be missing');
  }
  if (_.isNil(params.chatId)) {
    return Promise.reject('Rejected in help: Missing chat id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const helpMessage = makeHelpMessage(chatId);
  return bot.sendTelegramMessage('sendMessage', helpMessage);
};

module.exports = help;
