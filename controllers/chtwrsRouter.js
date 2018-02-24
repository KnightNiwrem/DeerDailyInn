const _ = require('lodash');

const inboundController = require('./chtwrs/inbound');
const offersController = require('./chtwrs/offers');
const dealsController = require('./chtwrs/deals');
const defaultController = require('./chtwrs/unknown');

const controllerRouter = {
  inbound: inboundController,
  offers: offersController,
  deals: dealsController
};

const chtwrsRouter = (params) => {
  if (params.rawMessage.fields.redelivered) {
    return;
  }

  const controllerName = params.controllerName;
  const controller = controllerRouter[controllerName];
  const usableController = !_.isNil(controller) ? controller : defaultController;
  return usableController(params);
};

module.exports = chtwrsRouter;
