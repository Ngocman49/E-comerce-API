'use strict';
const express = require('express');
const router = express.Router();
const accessController = require('./../../controllers/access.controller');
const { asyncHandler } = require('./../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');

router.post('/shop/signup', accessController.sigUp);

router.post('/shop/login', accessController.login);

//authentication //
router.use(authenticationV2);
/////////////////////
router.post('/shop/logout', accessController.logout);

router.post('/shop/handlerRefreshToken', accessController.handlerRefreshToken);

module.exports = router;
