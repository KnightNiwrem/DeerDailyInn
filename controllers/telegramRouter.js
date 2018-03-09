const Promise = require('bluebird');
const _ = require('lodash');

const channelController = require('./telegram/channel');
const defaultController = require('./telegram/unknown');

const startController = require('./telegram/start');
const authController = require('./telegram/auth');
const confirmController = require('./telegram/confirm');
const depositController = require('./telegram/deposit');
const withdrawController = require('./telegram/withdraw');
const helpController = require('./telegram/help');
const dealsController = require('./telegram/deals');
const flashController = require('./telegram/flash');
const grantController = require('./telegram/grant');

const updateLogController = require('./telegram/updatelog');

const controllerRouter = {
  auth: authController,
  confirm: confirmController,
  deals: dealsController,
  deposit: depositController,
  flash: flashController,
  grant: grantController,
  help: helpController,
  purchases: dealsController,
  sales: dealsController,
  start: startController,
  updatelog: updateLogController,
  withdraw: withdrawController
};

const usableCommandsInChannel = new Set(['deals', 'flash', 'help', 'purchases', 'sales', 'updatelog']);
const definedCommands = new Set(_.keys(controllerRouter));

const telegramRouter = (params) => {
  let controllerName = params.controllerName;
  const controller = controllerRouter[controllerName];
  const usableController = !_.isNil(controller) ? controller : defaultController;

  // If command is not understood in channel, we assume it is not for us
  if (params.isChannel && !definedCommands.has(controllerName)) {
    return Promise.resolve();
  } else if (params.isChannel && !usableCommandsInChannel.has(controllerName)) {
    return channelController(params);
  } else {
    return usableController(params);
  }
};

module.exports = telegramRouter;
