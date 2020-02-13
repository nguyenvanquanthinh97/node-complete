const _ = require('lodash');

const Product = require('../models/product');

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: '/admin/add-product'
    });
};

module.exports.postAddProduct = (req, res, next) => {
    const title = _.get(req.body, 'title');
    const imageUrl = _.get(req.body, 'imageUrl');
    const price = _.get(req.body, 'price');
    const description = _.get(req.body, 'description');
    const userId = _.get(req.user, "_id");

    const product = new Product(title, price, imageUrl, description, userId);

    product.save().then((product) => {
        res.redirect("/");
    });
};

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('admin/products', {
                products,
                docTitle: "Shop",
                path: '/admin/products'
            });
        });
};

module.exports.getEditProduct = (req, res, next) => {
    const productId = _.get(req.params, 'productId');

    Product.findById(productId)
        .then(product => {
            res.render('admin/edit-product', {
                docTitle: 'Edit Page',
                path: '/admin/edit-product',
                editing: true,
                product
            });
        });
};

module.exports.updateProduct = async (req, res, next) => {
    const prodId = _.get(req.body, 'productId');

    Product.updateById(prodId, req.body)
        .then(result => {
            res.redirect('/admin/products');
        });
};

module.exports.deleteProduct = async (req, res, next) => {
    const prodId = _.get(req.body, 'productId');

    Product.deleteById(prodId)
        .then(result => {
            res.redirect('/admin/products');
        });
};