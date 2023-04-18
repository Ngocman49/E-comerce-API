'use strict';

const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const shopModel = require('./../models/shop.model');
const KeytokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('./../utils/index');
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require('../core/error.response');
const { findByEmail } = require('./shop.service');
const RoleShop = {
  SHOP: '0001',
  WRITER: '0010',
  EDITOR: '0011',
};

class AccessService {
  static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    console.log(keyStore);
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeytokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something went wrong!!! please login again');
    }
    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError('Shop not registed');
    }
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError('Shop not registed');
    }
    /// create new token
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );
    // update Token

    const updateTokens = await KeytokenService.updateRefreshToken(
      refreshToken,
      tokens.refreshToken
    );
    if (!updateTokens) {
      throw new BadRequestError(`Update Token failed`);
    }
    return {
      user: { userId, email },
      tokens,
    };

    // const foundToken = await KeytokenService.findByRefreshTokenUsed(
    //   refreshToken
    // );
    // if (foundToken) {
    //   // decode user
    //   const { userId, email } = await verifyJWT(
    //     refreshToken,
    //     foundToken.privateKey
    //   );
    //   // xoa
    //   await KeytokenService.deleteKeyById(userId);
    //   throw new ForbiddenError(
    //     'Error: Something went wrong, please login again! '
    //   );
    // }
    // const holderToken = await KeytokenService.findByRefreshToken(refreshToken);
    // if (!holderToken) {
    //   throw new AuthFailureError('Shop not registed');
    // }
    // /// verify token
    // const { userId, email } = await verifyJWT(
    //   refreshToken,
    //   holderToken.privateKey
    // );
    // // check userId
    // const foundShop = await findByEmail({ email });
  };
  /**
   * check refresh token?
   */
  static handlerRefreshToken = async (refreshToken) => {
    const foundToken = await KeytokenService.findByRefreshTokenUsed(
      refreshToken
    );
    if (foundToken) {
      // decode user
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      // xoa
      await KeytokenService.deleteKeyById(userId);
      throw new ForbiddenError(
        'Error: Something went wrong, please login again! '
      );
    }
    const holderToken = await KeytokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError('Shop not registed');
    }
    /// verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError('Shop not registed');
    }
    /// create new token
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );
    // update Token

    const updateTokens = await KeytokenService.updateRefreshToken(
      refreshToken,
      tokens.refreshToken
    );
    if (!updateTokens) {
      throw new BadRequestError(`Update Token failed`);
    }
    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeytokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };

  /*
          login 
    1 - check email in dbs
    2 - match password
    3 - create AI vs RT and save
    4 - generate token
    5 - get data return login
  */

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    //1
    if (!foundShop) {
      throw new BadRequestError('Error: Shop not registered');
    }
    // 2
    const match = await bcrypt.compare(password, foundShop.password);

    if (!match) {
      throw new AuthFailureError(`Error: authentication error`);
    }
    //3
    //created privateKey, publickey
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');
    const { _id: userId } = foundShop._id;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeytokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });
    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    // step1: check email exits?

    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError('Error: Shop already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });
    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString('hex');
      const publicKey = crypto.randomBytes(64).toString('hex');

      console.log(privateKey, publicKey); // save collection keystore
      const keyStore = await KeytokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError(`Error: Key store error`);
      }
      // create token pair

      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );
      console.log(`create Token success `, tokens);
      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ['_id', 'name', 'email'],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
    // } catch (err) {
    //   throw new BadRequestError(`Error: ${err.message}`);
    // }
  };
}
module.exports = AccessService;
