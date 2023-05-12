'use strict';

const express = require('express');
const { authenticationV2 } = require('../../auth/authUtils');
const discountController = require('../../controllers/discount.controller');

const router = express.Router();

router.get('/', discountController.getAllDiscountCodes);

router.use(authenticationV2);

router.post('/create', discountController.createDiscountCode);
router.post('/amount', discountController.getDiscountAmount);
router.get('/shop', discountController.getAllDiscountByShop);

module.exports = router;
