const _ = require('lodash');

const channelController = require('./telegram/channel');
const defaultController = require('./telegram/unknown');

const startController = require('./telegram/start');
const authController = require('./telegram/auth');
const helpController = require('./telegram/help');

const controllerRouter = {
  start: startController,
  auth: authController,
  help: helpController
};

const privateOnlyCommands = new Set(['start', 'auth']);

const telegramRouter = (params) => {
  let controllerName = params.controllerName;
  controllerName = params.isCommand ? params.controllerName.slice(1) : params.controllerName;
  const controller = controllerRouter[controllerName];
  const usableController = !_.isNil(controller) ? controller : defaultController;

  if (params.isChannel && privateOnlyCommands.has(controllerName)) {
    return channelController(params);
  } else {
    return usableController(params);
  }
};

module.exports = telegramRouter;
