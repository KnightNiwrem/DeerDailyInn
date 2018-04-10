const { exec } = require('child_process');
const _ = require('lodash');
const Promise = require('bluebird');

const makeNoPermissionMessage = (chatId) => {
  const text = `You do not have sufficient permissions to run this command!`;
  const message = JSON.stringify({
    chat_id: chatId,
    text: text
  });
  return message;
};

const makeOutputMessage = (chatId, output) => {
  const message = JSON.stringify({
    chat_id: chatId,
    text: "```" + output + "```"
  });
  return message;
};

const cmd = (params) => {
  if (_.isNil(params.bot)) {
    return Promise.reject('Rejected in getinfo: Bot cannot be missing');
  }
  if (_.isNil(params.chatId) || _.isNil(params.telegramId)) {
    return Promise.reject('Rejected in getinfo: Missing chat id or telegram id');
  }

  const bot = params.bot;
  const chatId = params.chatId;
  const telegramId = params.telegramId;

  if (telegramId != 41284431) {
    const message = makeNoPermissionMessage(chatId);
    return bot.sendTelegramMessage('sendMessage', message);
  }
  
  const command = params.options.join(' ');
  const execPromise = new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      const output = `Error: ${error}\nStdout: ${stdout}\nStderr: ${stderr}`;
      resolve(output);
    });
  });
  execPromise
  .then((output) => {
    const message = makeOutputMessage(chatId, output);
    return bot.sendTelegramMessage('sendMessage', message);
  });
};

module.exports = cmd;
