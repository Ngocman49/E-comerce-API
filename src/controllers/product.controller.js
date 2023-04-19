'use strict';
const ProductService = require('./../services/product.service');
const ProductServiceV2 = require('./../services/product.serviceV2');

const { SuccessResponse } = require('./../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { search } = require('../routes/product');
const { asyncHandler } = require('./../helpers/asyncHandler');

class ProductController {
  createProduct = asyncHandler(async (req, res, next) => {
    //   new SuccessResponse({
    //     message: 'Create new product success',
    //     metadata: await ProductService.createProduct(req.body.product_type, {
    //       ...req.body,
    //       product_shop: req.user.userId,
    //     }),
    //   }).send(res);
    // };

    const newProduct = await ProductServiceV2.createProduct(
      req.body.product_type,
      {
        ...req.body,
        product_shop: req.user.userId,
      }
    );
    if (!newProduct) {
      return next(
        new BadRequestError('something wrong went create new product')
      );
    }
    new SuccessResponse({
      message: 'Create new product success',
      metadata: newProduct,
    }).send(res);
  });

  // put//

  publishProductByShop = asyncHandler(async (req, res, next) => {
    const published = await ProductServiceV2.publishProductByShop({
      product_shop: req.user.userId,
      product_id: req.params.id,
    });
    if (!published) {
      return next(new BadRequestError(`published failed`));
    }

    new SuccessResponse({
      message: 'Published product success',
      metadata: published,
    }).send(res);
  });

  unPublishProductByShop = asyncHandler(async (req, res, next) => {
    const unPublished = await ProductServiceV2.unPublishProductByShop({
      product_shop: req.user.userId,
      product_id: req.params.id,
    });
    if (!unPublished) {
      return next(new BadRequestError(`unpublished failed`));
    }
    new SuccessResponse({
      message: 'unPublished product success',
      metadata: unPublished,
    }).send(res);
  });

  // end put //

  // Query //

  getAllDraftForShop = asyncHandler(async (req, res, next) => {
    const foundDraft = await ProductServiceV2.findAllDraftsForShop({
      product_shop: req.user.userId,
    });
    if (!foundDraft) {
      return next(new BadRequestError(`Cant get draft list items`));
    }
    new SuccessResponse({
      message: 'Get list Draft success',

      metadata: foundDraft,
    }).send(res);
  });

  getAllPublishedForShop = asyncHandler(async (req, res, next) => {
    const foundPublished = await ProductServiceV2.findAllPublishedForShop({
      product_shop: req.user.userId,
    });
    if (!foundPublished) {
      return next(new BadRequestError(`Cant get published list items`));
    }

    new SuccessResponse({
      message: 'Get list Publish success',

      metadata: foundPublished,
    }).send(res);
  });

  getListSearchProduct = asyncHandler(async (req, res, next) => {
    const searchProducts = await ProductServiceV2.searchProducts(req.params);

    if (searchProducts.length === 0) {
      return next(
        new BadRequestError(
          `There is no product with this keywords::: ${req.params.keySearch}`
        )
      );
    }
    console.log(`key search is`, req.params);
    new SuccessResponse({
      message: 'Search success',
      metadata: searchProducts,
    }).send(res);
  });
  findAllProducts = asyncHandler(async (req, res, next) => {
    const products = await ProductServiceV2.findAllProducts(req.query);
    if (!products) {
      return next(new BadRequestError(`Request Error::: no product found!!!`));
    }
    new SuccessResponse({
      message: 'Get list products success',
      metadata: products,
    }).send(res);
  });
  findProduct = asyncHandler(async (req, res, next) => {
    const foundProduct = await ProductServiceV2.findProduct({
      product_id: req.params.product_id,
    });
    if (!foundProduct) {
      return next(
        new BadRequestError(
          `Product not found with that id:::${req.params.product_id}`
        )
      );
    }
    new SuccessResponse({
      message: 'Get product success',
      metadata: foundProduct,
    }).send(res);
  });

  // End Query//
}

module.exports = new ProductController();
