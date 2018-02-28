const repl = require('repl');
const r = repl.start('> ');

r.context._ = require('lodash');
r.context.moment = require('moment');
r.context.Promise = require('bluebird');
r.context.nodeEnv = process.env.NODE_ENV;

// Database libraries
r.context.config = require('./config');
r.context.dbConfig = r.context.config.get('db');
r.context.objection = require('objection');
r.context.Model = r.context.objection.Model;
r.context.Knex = require('knex');

// Initialize knex connection.
r.context.knex = r.context.Knex({
  client: 'pg',
  connection: {
    host : r.context.dbConfig.host,
    port: r.context.dbConfig.port,
    user : r.context.dbConfig.username,
    password : r.context.dbConfig.password,
    database : r.context.dbConfig.database
  }
});

// Give the connection to objection.
r.context.Model.knex(r.context.knex);
r.context.User = require('./models/user');
r.context.Subscription = require('./models/subscription');
r.context.Deal = require('./models/deal');
