const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const DbService = require('./services/db/db.service');
const { info } = require("./config/logger");

let server;
DbService.connect().then(() => {
  info('Connected to '+config.db.type);
  server = app.listen(config.port, () => {
    logger.info(`API Server listening to http://localhost:${config.port}`);
  });
});
