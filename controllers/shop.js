const _ = require('lodash');

const Product = require('../models/product');

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('shop/product-list', {
                products,
                docTitle: "All Products",
                path: '/shop/products',
                isAuthenticated: _.get(req.session, 'isLoggedIn')
            });
        });
};

module.exports.getProductDetail = (req, res, next) => {
    const productId = _.get(req.params, 'productId');

    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product,
                docTitle: 'Product Detail',
                path: '/shop/product-detail',
                isAuthenticated: _.get(req.session, 'isLoggedIn')
            });
        });
};

module.exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('shop/index', {
                products,
                docTitle: "Shop",
                path: '/shop',
                isAuthenticated: _.get(req.session, 'isLoggedIn')
            });
        });
};

module.exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cartProducts => {
            res.render('shop/cart', {
                path: '/shop/cart',
                docTitle: 'Your cart',
                products: cartProducts,
                isAuthenticated: _.get(req.session, 'isLoggedIn')
            });
        });
};

module.exports.postCart = (req, res, next) => {
    const productId = _.get(req.body, 'productId');

    req.user.addToCart(productId)
        .then(result => {
            res.redirect('/shop/cart');
        });
};

module.exports.deleteCartItem = (req, res, next) => {
    const productId = _.get(req.body, 'productId');

    req.user.deleteItemFromCart(productId)
        .then(result => res.redirect('/shop/cart'));
};

module.exports.createOrder = (req, res, next) => {
    req.user.addOrder()
        .then(() => {
            res.redirect('/shop/orders');
        });
};

module.exports.getOrders = (req, res, next) => {
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders', {
                path: '/shop/orders',
                docTitle: 'Your order',
                orders,
                isAuthenticated: _.get(req.session, 'isLoggedIn')
            });
        });
};

module.exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/shop/checkout',
        docTitle: 'Checkout',
        isAuthenticated: _.get(req.session, 'isLoggedIn')
    });
};