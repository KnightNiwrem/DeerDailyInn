const Promise = require('bluebird');
const _ = require('lodash');

const channelController = require('./telegram/channel');
const defaultController = require('./telegram/unknown');

const startController = require('./telegram/start');
const authController = require('./telegram/auth');
const helpController = require('./telegram/help');
const dealsController = require('./telegram/deals');

const updateLogController = require('./telegram/updatelog');

const controllerRouter = {
  auth: authController,
  deals: dealsController,
  help: helpController,
  purchases: dealsController,
  sales: dealsController,
  start: startController,
  updatelog: updateLogController
};

const usableCommandsInChannel = new Set(['deals', 'help', 'purchases', 'sales', 'updatelog']);
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
