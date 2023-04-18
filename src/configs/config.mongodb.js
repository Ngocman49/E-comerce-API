'use strict';

// 1) basic

// const config = {
//   app: {
//     port: 3001,
//   },
//   db: {
//     host: '127.0.0.1',
//     port: '27017',
//     name: 'BookShop',
//   },
// };

// 2) adventure

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3001,
  },
  db: {
    host: process.env.DEV_DB_HOST || '127.0.0.1',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'BookShop',
  },
};

const prod = {
  app: {
    port: process.env.PROD_APP_PORT || 3002,
  },
  db: {
    host: process.env.PROD_DB_HOST || '127.0.0.1',
    port: process.env.PROD_DB_PORT || 27017,
    name: process.env.PROD_DB_NAME || 'prodDb',
  },
};

const config = { dev, prod };
const env = process.env.NODE_ENV || 'dev';
// console.log(config[env], env);
module.exports = config[env];
