const _ = require('lodash');

const startController = require('./telegram/start');
const defaultController = require('./telegram/unknown');

const controllerRouter = {
  'start': startController
};

const router = (params) => {
  const controllerName = params.isCommand ? params.controllerName.slice(1) : params.controllerName;
  const controller = controllerRouter[controllerName];
  const usableController = !_.isNil(controller) ? controller : defaultController;
  return usableController(params);
};

module.exports = router;
