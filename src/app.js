const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const { default: helmet } = require('helmet');
const compression = require('compression');
const { checkOverLoad } = require('./helpers/check.connect');
const indexRouter = require('./routes/index');

const app = express();

// init middlewares

app.use(morgan('dev'));
// morgan type:  (dev, combined, common, short, tiny)
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// end init middlewares //

// init DB
require('./dbs/init.mongodb');
// checkOverLoad();

// init routes
app.use('/', indexRouter);

// handling Error

app.use((req, res, next) => {
  const error = new Error(`Not found`);
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal server Error',
  });
});

module.exports = app;
