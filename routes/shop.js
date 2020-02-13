const path = require('path');

const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProductDetail);
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/delete-cart-item', shopController.deleteCartItem);
router.get('/orders', shopController.getOrders);
router.get('/checkout', shopController.getCheckout);
router.post('/create-order', shopController.createOrder);

module.exports = router;