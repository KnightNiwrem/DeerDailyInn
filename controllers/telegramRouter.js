const _ = require('lodash');

const channelController = require('./telegram/channel');
const defaultController = require('./telegram/unknown');

const startController = require('./telegram/start');
const authController = require('./telegram/auth');
const helpController = require('./telegram/help');
const salesController = require('./telegram/sales');
const purchasesController = require('./telegram/purchases');
const dealsController = require('./telegram/deals');

const controllerRouter = {
  start: startController,
  auth: authController,
  help: helpController,
  sales: salesController,
  purchases: purchasesController,
  deals: dealsController
};

const privateOnlyCommands = new Set(['start', 'auth']);

const telegramRouter = (params) => {
  let controllerName = params.controllerName;
  const controller = controllerRouter[controllerName];
  const usableController = !_.isNil(controller) ? controller : defaultController;

  if (params.isChannel && privateOnlyCommands.has(controllerName)) {
    return channelController(params);
  } else {
    return usableController(params);
  }
};

module.exports = telegramRouter;
