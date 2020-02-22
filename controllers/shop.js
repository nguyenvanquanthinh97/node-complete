const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const _ = require('lodash');

const Product = require('../models/product');
const User = require('../models/user');

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

module.exports.getInvoice = (req, res, next) => {
    const orderId = _.get(req.params, 'orderId');
    const invoiceName = 'invoice' + '-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoice', invoiceName);

    return User.findOrderById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error("Order can't be found"));
            }
            if (order.user._id.toString() !== req.session.user._id.toString()) {
                return next(new Error("Unauthorization"));
            }

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline;filename=${invoiceName}`);

            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(16).text(`Your Order: ${order._id.toString()}`);
            pdfDoc.moveDown(2);
            pdfDoc.font('Times-Bold').text('Title',100, 100).text('Quantity', 250, 100).text('Price', 400, 100);

            let totalPrice = 0;
            let colPos = 130;
            order.items.forEach(item => {
                totalPrice += item.qty * item.price;
                pdfDoc.fontSize(14).font('Times-Roman').text(item.title, 100, colPos, {width: 150}).text(item.qty, 280, colPos).text(item.qty * item.price, 400, colPos);
                colPos += 50;
            });

            pdfDoc.moveDown(2);
            pdfDoc.font('Times-Bold').text(`Your total money is: ${totalPrice}`, 100)
            
            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', `inline;filename=${invoiceName}`);
            //     res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
            // file.pipe(res);
        })
        .catch(err => {
            console.log(err);
            return next(new Error("Error in Connect to Database"));
        });
};