'use strict';
const express = require('express');

const { authentication, authenticationV2 } = require('../../auth/authUtils');
const productController = require('./../../controllers/product.controller');

const router = express.Router();

router.get('/search/:keySearch', productController.getListSearchProduct);
router.get('/', productController.findAllProducts);
router.get('/:product_id', productController.findProduct);

//authenication
router.use(authenticationV2);

router.post('/', productController.createProduct);

router.post('/published/:id', productController.publishProductByShop);
router.post('/unpublished/:id', productController.unPublishProductByShop);

// QUERY //
router.get('/drafts/all', productController.getAllDraftForShop);

router.get('/published/all', productController.getAllPublishedForShop);

module.exports = router;
