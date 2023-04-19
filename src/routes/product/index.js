'use strict';
const express = require('express');

const { asyncHandler } = require('./../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const productController = require('./../../controllers/product.controller');

const router = express.Router();

router.get(
  '/search/:keySearch',
  asyncHandler(productController.getListSearchProduct)
);
router.get('/', asyncHandler(productController.findAllProducts));
router.get('/:product_id', asyncHandler(productController.findProduct));

//authenication
router.use(authenticationV2);

router.post('/', asyncHandler(productController.createProduct));

router.post(
  '/published/:id',
  asyncHandler(productController.publishProductByShop)
);
router.post(
  '/unpublished/:id',
  asyncHandler(productController.unPublishProductByShop)
);

// QUERY //
router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop));

router.get(
  '/published/all',
  asyncHandler(productController.getAllPublishedForShop)
);

module.exports = router;
