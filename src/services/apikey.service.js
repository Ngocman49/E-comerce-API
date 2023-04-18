'use strict';
// const crypto = require('crypto');
const apiKeyModel = require('./../models/apikey.model');

const findById = async (key) => {
  // const newKey = await apiKeyModel.create({
  //   key: crypto.randomBytes(64).toString('hex'),
  //   permissions: ['000'],
  // });
  // console.log(`new key: `, newKey);
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objKey;
};

module.exports = {
  findById,
};
