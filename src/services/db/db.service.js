

const config = require('../../config/config');
const logger = require("../../config/logger");

let service;
const getService = () => {
  switch (config.db.dialect.toLowerCase()) {
    case 'postgresql':
    case 'mysql':
    case 'mariadb':
    case 'sqlite':
    case 'mssql':
    case 'oracle':
    case 'redshift': // db2
    case 'snowflake':
      service = require('./sequelize.service');
      break;
    case 'mongoose':
      service = require('./mongoose.service');
      break;
    default:
      throw new Error('Unsupported database type');
  }
  return service;
}
let server;
function connect() {
  return getService().connect();
}
function Schema(modelName, schema) {
  return getService().Schema(modelName, schema);
}
function setStatics(schemaObj) {
  return getService().setStatics(schemaObj);
}
function setMethods(schemaObj) {
  return getService().setMethods(schemaObj);
}

function setPre(type, schemaObj, fn){
  return getService().setPre(type, schemaObj, fn)
}

function model(name, schemaObj){
  return getService().model(name, schemaObj);
}



const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

module.exports = {connect, Schema, setStatics, setMethods, setPre, model}
