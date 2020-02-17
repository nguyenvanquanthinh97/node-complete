const { ObjectId } = require('mongodb');
const getDB = require('../utils/database').getDB;

module.exports = class User {
    constructor(username, email, cart, id, password) {
        this.username = username;
        this.email = email;
        this.cart = cart;
        if (id.toString().trim().length > 0) {
            this._id = id;
        }
        this.password = password;
    }

    save() {
        const db = getDB();
        return db.collection('users')
            .insertOne(this);
    }

    addToCart(productId) {
        const db = getDB();

        if (this.cart === undefined) {
            this.cart = [];
        }

        const existingIdx = this.cart.findIndex(product => product.productId.toString() === productId.toString());

        if (existingIdx !== -1) {
            return db.collection('users')
                .updateOne({ _id: new ObjectId(this._id), "cart.productId": new ObjectId(productId) }, { $inc: { "cart.$.qty": 1 } })
                .then(result => result)
                .catch(err => console.log(err));
        }
        return db.collection('users')
            .updateOne({ _id: new ObjectId(this._id) }, { $push: { cart: { productId: new ObjectId(productId), qty: 1 } } })
            .then(result => result)
            .catch(err => console.log(err));

    }

    getCart() {
        const db = getDB();

        const productIds = this.cart.map(item => item.productId);

        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        qty: this.cart.find(item => item.productId.toString() === product._id.toString()).qty
                    };
                });
            })
            .catch(err => console.log(err));
    }

    deleteItemFromCart(productId) {
        const db = getDB();

        return db.collection('users')
            .updateOne({ _id: new ObjectId(this._id) }, { $pull: { cart: { productId: new ObjectId(productId) } } })
            .then(result => result)
            .catch(err => err);
    }

    addOrder() {
        const db = getDB();

        const productIds = this.cart.map(item => item.productId);

        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        qty: this.cart.find(item => item.productId.toString() === product._id.toString()).qty
                    };
                });
            })
            .then(items => {
                const order = {
                    items,
                    user: {
                        _id: new ObjectId(this._id),
                        username: this.username
                    }
                };

                return db.collection('orders')
                    .insertOne(order)
                    .then(result => {
                        this.cart = [];
                        return db.collection('users')
                            .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: [] } });
                    });
            })
            .catch(err => console.log(err));
    }

    getOrders() {
        const db = getDB();

        return db.collection('orders')
            .find({ "user._id": new ObjectId(this._id) })
            .toArray()
            .catch(err => console.log(err));
    }

    static updateToken(userId, token, expiration) {
        const db = getDB();

        return db.collection('users')
            .updateOne({ _id: new ObjectId(userId) }, { $set: { token: token, expiration: expiration } });
    }

    static findById(userId) {
        const db = getDB();
        return db.collection('users')
            .findOne({ _id: new ObjectId(userId) })
            .catch(err => console.log(err));
    }

    static findByEmail(email) {
        const db = getDB();
        return db.collection('users')
            .findOne({ email: email });
    }
};