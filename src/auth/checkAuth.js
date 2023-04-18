'use strict';

const { findById } = require('../services/apikey.service');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(401).json({
        message: 'Forbidden Error',
      });
    }
    //check obj key
    const objkey = await findById(key);
    if (!objkey) {
      return res.status(401).json({
        message: 'Forbidden Error',
      });
    }
    req.objkey = objkey;
    return next();
  } catch (err) {}
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objkey.permissions) {
      return res.status(403).json({
        message: 'permission denied',
      });
    }
    console.log('permission::', req.objkey.permissions);
    const validPermission = req.objkey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: 'permission denied',
      });
    }
    return next();
  };
};

module.exports = {
  apiKey,
  permission,
};
