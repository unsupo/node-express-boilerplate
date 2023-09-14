const config = require('../../config/config');
const {toJSON, paginate} = require("../../models/plugins");
const { info } = require("../../config/logger");
const logger = require("../../config/logger");
const app = require("../../app");
const mongoose = require("mongoose");

const connect = () => {
  return mongoose.connect(config.db.url, config.db.options);
}
const Schema = (modelName, _schema) => {
    const schema = mongoose.Schema(..._schema);

    // add plugin that converts mongoose to json
    schema.plugin(toJSON);
    schema.plugin(paginate);

    return schema;
}



function setStatics(schemaObj) {
  return schemaObj.statics;
}

function setMethods(schemaObj) {
  return schemaObj.methods;
}

function setPre(type, schemaObj, fn){
  return schemaObj.pre(type, fn);
}

function model(name, schemaObj){
  return mongoose.model(name, schemaObj);
}

module.exports = {connect, Schema, setStatics, setMethods, setPre, model}
