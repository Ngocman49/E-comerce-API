'use strict';

const AccessService = require('./../services/access.service');
const { OK, CREATED, SuccessResponse } = require('./../core/success.response');
const { asyncHandler } = require('../helpers/asyncHandler');

class AcessController {
  handlerRefreshToken = asyncHandler(async (req, res, next) => {
    // V1

    // new SuccessResponse({
    //   message: 'Get token success',
    //   metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
    // }).send(res);

    // V2 fixed, dont need access token

    new SuccessResponse({
      message: 'Get Tokens success',
      metadata: await AccessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  });

  login = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  });

  logout = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Logout success',
      metadata: await AccessService.logout({ keyStore: req.keyStore }),
    }).send(res);
  });

  sigUp = asyncHandler(async (req, res, next) => {
    console.log(`[P]::signUp::`, req.body);

    new CREATED({
      message: 'Registered OK',
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  });
}

module.exports = new AcessController();
