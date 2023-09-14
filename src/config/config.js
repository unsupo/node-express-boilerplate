const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const { en } = require("faker/lib/locales");

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    DB_NAME: Joi.string().default(""),
    DB_USERNAME: Joi.string().default(""),
    DB_PASSWORD: Joi.string().default(""),
    DB_HOST: Joi.string(),
    DB_PORT: Joi.number(),
    DB_DIALECT: Joi.string().lowercase().valid('mysql', 'postgresql', 'sqlite', 'mariadb', 'mssql', 'db2', 'snowflake', 'oracle', 'mongoose').default("sqlite").required().description('DB of choice'),
    DB_URL: Joi.string().description("DB url string"),
    DB_STORAGE: Joi.string().description("The path the sqlite db file"),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    dialect: envVars.DB_DIALECT,
    name: envVars.DB_NAME,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    storage: envVars.DB_STORAGE,

    url: envVars.DB_URL + (envVars.DB_TYPE === 'mongoose' && envVars.NODE_ENV === 'test' ? '-test' : ''),
    // mongoose options
    ...(envVars.DB_TYPE === 'mongoose' ? {options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }} : {}),
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
