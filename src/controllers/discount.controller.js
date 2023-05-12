'use strict';

const { SuccessResponse } = require('./../core/success.response');

const DiscountService = require('../services/discount.service');
const { asyncHandler } = require('../helpers/asyncHandler');

class DiscountController {
  createDiscountCode = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'success code generations',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  });

  getAllDiscountCodes = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Success found code',
      metadata: await DiscountService.getAllDiscountCode({
        ...req.body,
      }),
    }).send(res);
  });
  getDiscountAmount = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Success get discount amount',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  });
  getAllDiscountByShop = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: 'Success get code',
      metadata: await DiscountService.getAllDiscountCodeByShop({
        shopId: req.user.userId,
      }),
    }).send(res);
  });
}

module.exports = new DiscountController();
