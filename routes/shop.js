const path = require('path');

const express = require('express');
const router = express.Router();

const authenticationMiddleware = require('../middleware/authentication');
const shopController = require('../controllers/shop');

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProductDetail);
router.get('/cart', authenticationMiddleware, shopController.getCart);
router.post('/cart', authenticationMiddleware, shopController.postCart);
router.post('/delete-cart-item', authenticationMiddleware, shopController.deleteCartItem);
router.get('/orders', authenticationMiddleware, shopController.getOrders);
router.get('/checkout', authenticationMiddleware, shopController.getCheckout);
router.post('/create-order', authenticationMiddleware, shopController.createOrder);

module.exports = router;