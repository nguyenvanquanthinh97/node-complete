const Path = require('path');

const _ = require('lodash');
const Joi = require('@hapi/joi');
const Datauri = require('datauri');

const fileHelper = require('../utils/file');
const Product = require('../models/product');
const { uploader } = require('../config/cloudinaryConfig');

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: '/admin/add-product',
        isAuthenticated: _.get(req.session, 'isLoggedIn')
    });
};

module.exports.postAddProduct = (req, res, next) => {
    const userId = _.get(req.user, "_id");
    const image = req.file;
    console.log(image);

    if (!image) {
        req.flash('error', 'File is not attached yet !');
        return res.status(300).redirect('/admin/add-product');
    }

    const schema = Joi.object().keys({
        _csrf: Joi.string(),
        title: Joi.string().required(),
        price: Joi.number().required(),
        imageUrl: Joi.string().optional().allow('', null),
        description: Joi.string().trim().min(10).max(200).required(),
        productId: Joi.string().optional().allow('', null)
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        console.log(error);
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            path: '/admin/add-product',
            isAuthenticated: _.get(req.session, 'isLoggedIn'),
            error: _.get(error, "details[0].message", error)
        });
    }

    const datauri = new Datauri();
    datauri.format(Path.extname(req.file.originalname).toString(), image.buffer);

    return uploader.upload(datauri.content)
        .then(result => {
            console.log("Cloudinary Result", result);
            const imageUrl = result.url;
            const product = new Product(_.get(value, 'title'), _.get(value, 'price'), imageUrl, _.get(value, 'description'), userId);

            return product.save()
                .then((product) => {
                    if (!product) {
                        throw new Error("Internal error in adding product");
                    }
                    res.redirect("/");
                });
        })
        .catch(error => next(new Error(error)));

    // const path = _.get(image, 'path').split('/').slice(1).join('/');

    // const imageUrl = path;

    // const product = new Product(_.get(value, 'title'), _.get(value, 'price'), imageUrl, _.get(value, 'description'), userId);

    // product.save()
    //     .then((product) => {
    //         if (!product) {
    //             throw new Error("Internal error in adding product");
    //         }
    //         res.redirect("/");
    //     })
    //     .catch(err => {
    //         const error = new Error(err);
    //         return next(error);
    //     });
};

module.exports.getProducts = (req, res, next) => {
    Product.fetchProductsByUserId(req.user._id)
        .then(products => {
            res.render('admin/products', {
                products,
                docTitle: "Shop",
                path: '/admin/products',
                isAuthenticated: _.get(req.session, 'isLoggedIn')
            });
        });
};

module.exports.getEditProduct = (req, res, next) => {
    const productId = _.get(req.params, 'productId');

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/admin/products');
            }
            res.render('admin/edit-product', {
                docTitle: 'Edit Page',
                path: '/admin/edit-product',
                editing: true,
                product,
                isAuthenticated: _.get(req.session, 'isLoggedIn')
            });
        })
        .catch(err => console.log(err));
};

module.exports.updateProduct = async (req, res, next) => {
    const prodId = _.get(req.body, 'productId');

    const image = req.file;

    const schema = Joi.object().keys({
        productId: Joi.string(),
        _csrf: Joi.string(),
        title: Joi.string().required(),
        imageUrl: Joi.string().optional().allow('', null),
        price: Joi.number().required(),
        description: Joi.string().trim().min(10).max(200).required(),
    });

    const { error, value } = schema.validate(req.body);

    // if (image) {
    //     const path = _.get(image, 'path').split('/').slice(1).join('/');
    //     _.set(value, 'imageUrl', path);
    // }

    if (error) {
        console.log(error);
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Edit Page',
            path: '/admin/edit-product',
            editing: true,
            product,
            isAuthenticated: _.get(req.session, 'isLoggedIn'),
            error: _.get(error, "details[0].message", error)
        });
    }

    const datauri = new Datauri();
    let imageUrl;

    if (image) {
        datauri.format(Path.extname(image.originalname).toString(), image.buffer);
        return uploader.upload(datauri.content)
            .then(result => {
                imageUrl = _.get(result, 'url');
                _.set(value, 'imageUrl', imageUrl);

                Product.updateWithUserId(prodId, value, req.user._id)
                    .then(result => {
                        res.redirect('/admin/products');
                    })
                    .catch(err => {
                        const error = new Error(err);
                        return next(error);
                    });
            })
            .catch(err => next(new Error(err)));
    }
    return Product.updateWithUserId(prodId, value, req.user._id)
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            return next(error);
        });
};

module.exports.deleteProduct = async (req, res, next) => {
    // const prodId = _.get(req.body, 'productId');

    const prodId = _.get(req.params, 'productId');

    Product.findById(prodId)
        .then(product => {
            if (!product) {
                // next(new Error("Product doesn't exist"));
                return res.status(500).json({message: "Product doesn't exist"});
            }
            // fileHelper.removeFile('public/' + product.imageUrl);
            return Product.deleteWithUserId(prodId, req.user._id)
                .then(result => {
                    return res.status(200).json({ message: 'Success' });
                });

        }).catch(err => {
            const error = new Error(err);
            return res.status(500).json({message: "Delete Product Fail"});
        });
};