const _ = require('lodash');
const Promise = require('bluebird');

const makeHelpMessage = (chatId) => {
  const helpText = `Here are the currently available commands:

/auth [authorization code] - Completes registration
/balance - Fetches gold balance in Deer Daily Inn
/buy [item code] [quantity] [max price] - Create a buy order
/cancel [item code] - Cancels active buy orders for that item
/confirm [confirmation code] - Completes gold deposit
/deals (optional item name) - Displays your recent sales and purchases
/deposit [number of pouches] - Deposits gold into personal Deer Daily Inn balance
/help - Display this help message
/info - Displays channel and user info
/purchases (optional item name) - Displays your recent purchases
/orders - Displays your current active orders
/sales (optional item name) - Displays your recent sales
/start - Gets authorization code from @chtwrsbot for registration
/withdraw [number of pouches] Withdraws gold from personal Deer Daily Inn balance`;
  
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
