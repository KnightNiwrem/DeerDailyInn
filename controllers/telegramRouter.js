const Promise = require('bluebird');
const _ = require('lodash');

const channelController = require('./telegram/channel');
const defaultController = require('./telegram/unknown');

const authController = require('./telegram/auth');
//const balanceController = require('./telegram/balance');
//const confirmController = require('./telegram/confirm');
const dealsController = require('./telegram/deals');
//const depositController = require('./telegram/deposit');
const flashController = require('./telegram/flash');
const getInfoController = require('./telegram/getinfo');
const grantController = require('./telegram/grant');
const helpController = require('./telegram/help');
const infoController = require('./telegram/info');
const startController = require('./telegram/start');
const updateLogController = require('./telegram/updatelog');
//const withdrawController = require('./telegram/withdraw');

const controllerRouter = {
  auth: authController,
  //balance: balanceController,
  //confirm: confirmController,
  deals: dealsController,
  //deposit: depositController,
  flash: flashController,
  getinfo: getInfoController,
  grant: grantController,
  help: helpController,
  info: infoController,
  purchases: dealsController,
  sales: dealsController,
  start: startController,
  updatelog: updateLogController,
  //withdraw: withdrawController
};

const usableCommandsInChannel = new Set([
  'deals',
  'flash',
  'help',
  'info',
  'purchases',
  'sales',
  'updatelog']);
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
