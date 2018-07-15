const Promise = require('bluebird');
const _ = require('lodash');

const channelController = require('./telegram/channel');
const defaultController = require('./telegram/unknown');

const authController = require('./telegram/auth');
const authExtraController = require('./telegram/authextra');
const balanceController = require('./telegram/balance');
const buyController = require('./telegram/buy');
const cancelController = require('./telegram/cancel');
const coffeeController = require('./telegram/coffee');
const confirmController = require('./telegram/confirm');
const cmdController = require('./telegram/cmd');
const dealsController = require('./telegram/deals');
const depositController = require('./telegram/deposit');
const flashController = require('./telegram/flash');
const getInfoController = require('./telegram/getinfo');
const grantController = require('./telegram/grant');
const helpController = require('./telegram/help');
const infoController = require('./telegram/info');
const manageFlashController = require('./telegram/manageflash');
const ordersController = require('./telegram/orders');
const pokeFleeController = require('./telegram/pokeflee');
const pokePlayersController = require('./telegram/pokeplayers');
const pokeRegisterController = require('./telegram/pokeregister');
const startController = require('./telegram/start');
const updateLogController = require('./telegram/updatelog');
const withdrawController = require('./telegram/withdraw');
const wtbController = require('./telegram/wtb');

const controllerRouter = {
  auth: authController,
  authextra: authExtraController,
  balance: balanceController,
  buy: buyController,
  cancel: cancelController,
  coffee: coffeeController,
  confirm: confirmController,
  cmd: cmdController,
  deals: dealsController,
  deposit: depositController,
  f: flashController,
  flash: flashController,
  getinfo: getInfoController,
  grant: grantController,
  help: helpController,
  info: infoController,
  manageflash: manageFlashController,
  mf: manageFlashController,
  orders: ordersController,
  pokeflee: pokeFleeController,
  pokeplayers: pokePlayersController,
  pokeregister: pokeRegisterController,
  purchases: dealsController,
  sales: dealsController,
  start: startController,
  updatelog: updateLogController,
  withdraw: withdrawController,
  wtb: wtbController
};

const usableCommandsInChannel = new Set([
  'balance',
  'coffee',
  'confirm',
  'deposit',
  'deals',
  'flash',
  'help',
  'info',
  'pokeflee',
  'pokeplayers',
  'pokeregister',
  'purchases',
  'sales',
  'updatelog',
  'wtb']);
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
