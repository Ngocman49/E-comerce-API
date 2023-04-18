'use strict';
const ProductService = require('./../services/product.service');
const ProductServiceV2 = require('./../services/product.serviceV2');

const { SuccessResponse } = require('./../core/success.response');

class ProductController {
  createProduct = async (req, res, next) => {
    //   new SuccessResponse({
    //     message: 'Create new product success',
    //     metadata: await ProductService.createProduct(req.body.product_type, {
    //       ...req.body,
    //       product_shop: req.user.userId,
    //     }),
    //   }).send(res);
    // };
    new SuccessResponse({
      message: 'Create new product success',
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // Query //

  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list Draft success',

      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // End Query//
}

module.exports = new ProductController();
