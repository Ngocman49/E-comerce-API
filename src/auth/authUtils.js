'use strict';

const JWT = require('jsonwebtoken');
const {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} = require('../core/error.response');
const { asyncHandler } = require('../helpers/asyncHandler');

//service
const { findByUserId } = require('./../services/keyToken.service');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id',
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // access Token
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days',
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    });

    // Verify token

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log(`error verify`, err);
      } else {
        console.log(`decode verify`, decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new BadRequestError(`Error::: Create Token pair failed`);
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1 - check userId missing
   * 2 - get access token
   * 3 - verify token
   * 4 - check user in dbs
   * 5 - check keyStore with this userId
   * 6 - OK all => return next()
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError('Invalid Request');
  }
  // 2
  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError('Not found keyStore');
  }
  // 3
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError('Invalid Request');
  }
  // 4
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError('Invalid userId');
    }
    req.keyStore = keyStore;
    return next();
  } catch (err) {
    throw err;
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /**
   * 1 - check userId missing
   * 2 - get access token
   * 3 - verify token
   * 4 - check user in dbs
   * 5 - check keyStore with this userId
   * 6 - OK all => return next()
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError('Invalid Request');
  }
  // 2
  const keyStore = await findByUserId(userId);

  if (!keyStore) {
    throw new NotFoundError('Not found keyStore');
  }
  // 3
  console.log(req.headers[HEADER.REFRESHTOKEN]);
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      console.log(refreshToken);
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError('Invalid userId');
      }
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (err) {
      throw err;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError('Invalid Request');
  }
  try {
    const decodeUser = await JWT.verify(accessToken, keyStore.publicKey);

    if (userId !== decodeUser.userId) {
      throw new AuthFailureError('Invalid UserId');
    }
    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (err) {
    throw err;
  }
});

const verifyJWT = async (token, secrectKey) => {
  return await JWT.verify(token, secrectKey);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
  authenticationV2,
};
