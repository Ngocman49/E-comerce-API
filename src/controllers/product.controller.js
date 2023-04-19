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

  // put//

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Published product success',
      metadata: await ProductServiceV2.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'unPublished product success',
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // end put //

  // Query //

  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list Draft success',

      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list Publish success',

      metadata: await ProductServiceV2.findAllPublishedForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    console.log(`key search is`, req.params);
    new SuccessResponse({
      message: 'Search success',
      metadata: await ProductServiceV2.searchProducts(req.params),
    }).send(res);
  };
  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list products success',
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get product success',
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  // End Query//
}

module.exports = new ProductController();
