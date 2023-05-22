'use strict';

const { asyncHandler } = require('../helpers/asyncHandler');
const { SuccessResponse } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
  addTocart = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Cart success',
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  });
  update = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Cart success',
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  });
  delete = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Cart success',
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  });
  listToCart = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Cart success',
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  });
}
module.exports = new CartController();
