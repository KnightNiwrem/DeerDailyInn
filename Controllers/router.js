const startController = require('./telegram/start');


const controllerRouter = {
  'start': startController
};

const router = (params) => {
  const controllerName = params.isCommand ? params.controller.slice(1) : params.controller;
  const controller = controllerRouter[controllerName];
  return controller(params);
};

module.exports = router;
