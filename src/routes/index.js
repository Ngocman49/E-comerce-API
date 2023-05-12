'use strict';

const express = require('express');
const router = express.Router();
const accessRouter = require('./access/index');
const { apiKey, permission } = require('../auth/checkAuth');

// check api key
router.use(apiKey);
router.use(permission('000'));

// check permission
router.use('/v1/api/product', require('./product'));

router.use('/v1/api/', require('./access'));

router.use('/v1/api/discount', require('./discount'));

module.exports = router;
