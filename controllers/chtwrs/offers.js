const _ = require('lodash');

const offers = (params) => {
  if (_.isNil(params.bot)) {
    console.warn('Offers queue: Bot cannot be missing');
    return;
  }
};

module.exports = offers;
