const _ = require('lodash');
const Promise = require('bluebird');
const TreasureHunterGame = require('../../models/treasureHunterGame');
const TreasureHunterPlayer = require('../../models/treasureHunterPlayer');
const User = require('../../models/user');

const makeNewGameMessage = (chatId, gameId) => {
  const text = `A new treasure hunter game has been created! \
Please note the following:
  - Entry fee is 20 gold
  - You still need to do /hunt even if you started the game
  - Game will be cancelled in 120 seconds if there are not enough players`;
  
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeExistingGameMessage = (chatId) => {
  const text = `A game is already running here! Please 
wait for the game to end before starting another.`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeTimeoutMessage = (chatId) => {
  const text = `Not enough players. Game has been cancelled!`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const tryToCancelGame = (chatId, gameId) => {
  const timeout = 120 * 1000;
  setTimeout(async () => {
    const players = await TreasureHunterPlayer.query().where('gameId', gameId);
    if (players.length < 2) {
      const message = makeTimeoutMessage(chatId);
      bot.sendTelegramMessage('sendMessage', message);

      const game = await TreasureHunterGame.query().where('id', gameId).first();
      await game.$query().patch({
        status: 'cancelled'
      });

      players.forEach(async (player) => {
        const user = await User.query().where('id', player.userId).first();
        user.$query().patch({
          balance: user.balance + 20
        });

        const attributes = {
          fromId: 0,
          quantity: 20,
          reason: 'Refunding entry fee for treasure hunter game',
          status: 'completed',
          toId: user.id
        };
        const transaction = await Transaction.create(attributes);
      });
    }
  }, timeout);
};

const treasure = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in treasure: Bot cannot be missing');
  }
  if (_.isNil(params.telegramId) || _.isNil(params.chatId)) {
    return Promise.reject('Rejected in treasure: Missing telegram user id or chat id');
  }

  const bot = params.bot;
  const telegramId = params.telegramId;
  const chatId = params.chatId;

  return TreasureHunterGame.query()
  .whereIn('status', ['pending', 'started'])
  .andWhere('chatId', chatId)
  .first()
  .then((game) => {
    if (!_.isNil(game)) {
      const message = makeExistingGameMessage(chatId);
      return bot.sendTelegramMessage('sendMessage', message);
    }

    const attributes = {
      chatId: chatId,
      status: 'started'
    };
    return TreasureHunterGame.create(attributes)
    .then((game) => {
      tryToCancelGame(chatId, game.id);
      const message = makeNewGameMessage(chatId, game.id);
      return bot.sendTelegramMessage('sendMessage', message);
    });
  });
};

module.exports = treasure;
