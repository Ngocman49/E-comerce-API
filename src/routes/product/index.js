'use strict';
const express = require('express');

const { authentication, authenticationV2 } = require('../../auth/authUtils');
const productController = require('./../../controllers/product.controller');

const router = express.Router();

router.get('/search/:keySearch', productController.getListSearchProduct);
router.get('/', productController.findAllProducts);
router.get('/:productId', productController.findProduct);

//authenication
router.use(authenticationV2);

router.post('/', productController.createProduct);
router.patch('/:productId', productController.updateProduct);

router.post('/published/:productId', productController.publishProductByShop);
router.post(
  '/unpublished/:productId',
  productController.unPublishProductByShop
);

// QUERY //
router.get('/drafts/all', productController.getAllDraftForShop);

router.get('/published/all', productController.getAllPublishedForShop);

module.exports = router;
