const path = require('path');

const express = require('express');
const _ = require('lodash');
const router = express.Router();
const { check } = require('express-validator');

const authenticationMiddleware = require('../middleware/authentication');
const adminController = require('../controllers/admin');

router.get('/add-product', authenticationMiddleware, adminController.getAddProduct);

router.get('/products', authenticationMiddleware, adminController.getProducts);

router.post('/add-product', authenticationMiddleware, adminController.postAddProduct);

router.get('/edit-product/:productId', authenticationMiddleware, adminController.getEditProduct);

router.post('/edit-product', authenticationMiddleware, adminController.updateProduct);

// router.post('/delete-product', authenticationMiddleware, adminController.deleteProduct);

router.delete('/product/:productId', authenticationMiddleware, adminController.deleteProduct)

module.exports = router;