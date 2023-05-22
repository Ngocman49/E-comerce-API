const express = require('express');
const cartController = require('../../controllers/cart.controller');

const router = express.Router();

router.post('', cartController.addTocart);

router.delete('', cartController.delete);
router.get('', cartController.listToCart);
router.post('/update', cartController.update);

module.exports = router;
