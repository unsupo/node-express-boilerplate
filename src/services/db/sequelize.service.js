const { Sequelize } = require("sequelize");
const config = require('../../config/config');
const { DataTypes } = require('sequelize');
const { roles } = require("../../config/roles");


let server;
const getServer = () => {
  if (!server) {
    server = new Sequelize(config.db.name, config.db.username, config.db.password, {
      dialect: config.db.dialect,
      host: config.db.host,
      port: config.db.port,
      storage: config.db.storage
    });
  }
  return server;
}
const connect = () => {
  return new Promise(async resolve => {
    await getServer().sync();
    resolve(getServer());
  });
}
const Schema = (modelName, _schema) => {
  return getServer().define(modelName, convertMongooseToSequelize(_schema, server), _schema[1]);
}

// Define a function to convert Mongoose schema to Sequelize schema
function convertMongooseToSequelize(mongooseSchema) {
  const sequelizeSchema = {};
  // TODO indexes

  // Iterate through the Mongoose schema's paths
  for (const key in mongooseSchema[0]) {
    sequelizeSchema[key] = {}
    sequelizeSchema[key]['type'] = getSequelizeDataType(mongooseSchema[0][key]['type']);
    sequelizeSchema[key]['validate']={}
    if('required' in mongooseSchema[0][key])
      sequelizeSchema[key]['validate']["allowNull"] = mongooseSchema[0][key]['required'];
    if('trim' in mongooseSchema[0][key])
      sequelizeSchema[key]['validate']["trim"] = mongooseSchema[0][key]['trim'];
    if('unique' in mongooseSchema[0][key] || 'index' in mongooseSchema[0][key])
      sequelizeSchema[key]['validate']["unique"] = mongooseSchema[0][key]['unique'];
    if('lowercase' in mongooseSchema[0][key]) //lowercase
      sequelizeSchema[key]['validate']["isLowercase"] = mongooseSchema[0][key]['lowercase'];
    if('minlength' in mongooseSchema[0][key])
      sequelizeSchema[key]['validate']["min"] = mongooseSchema[0][key]['minlength'];
    if('enum' in mongooseSchema[0][key]) {
      sequelizeSchema[key]["type"] = DataTypes.ENUM;
      sequelizeSchema[key]["values"] = mongooseSchema[0][key]['enum']
    }
    if('default' in mongooseSchema[0][key])
      sequelizeSchema[key]["defaultValue"] = mongooseSchema[0][key]['default'];
    if(typeof mongooseSchema[0][key].validate === 'function')
       sequelizeSchema[key]["validate"] = mongooseSchema[0][key].validate;
  }

  return sequelizeSchema;
}
function getSequelizeDataType(type) {
  switch (type.name) {
    case 'String':
      return DataTypes.STRING;
    case 'Number':
      return DataTypes.INTEGER;
    case 'Boolean':
      return DataTypes.BOOLEAN;
    case 'Date':
      return DataTypes.DATE;
    // Add more cases for other types as needed
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

function setStatics(schemaObj) {
  return schemaObj;
}

function setMethods(schemaObj) {
  return schemaObj.prototype;
}

function setPre(type, schemaObj, fn){
  return schemaObj.addHook("before"+convertSaveType(type), fn);
}
function convertSaveType(type){
  switch(type){
      case "save":
        return "Create";
      case "update":
        return "Update";
      case "delete":
        return "Destroy";
      default:
        return type;
   }
}


function model(name, schemaObj) {
  return schemaObj;
}

module.exports = {connect, Schema, setStatics, setMethods, setPre, model}
