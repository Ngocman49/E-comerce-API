'use strict';

const express = require('express');
const router = express.Router();
const accessRouter = require('./access/index');
const { apiKey, permission } = require('../auth/checkAuth');

// check api key
router.use(apiKey);
router.use(permission('000'));

// check permission

router.use('/v1/api/', accessRouter);
router.use('/v1/api/product', require('./product'));

module.exports = router;