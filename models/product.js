const getDB = require('../utils/database').getDB;
const { ObjectId } = require('mongodb');
const _ = require('lodash');

module.exports = class Product {
    constructor(title, price, imageUrl, description, userId) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.userId = new ObjectId(userId);
    }

    save() {
        const db = getDB();
        return db.collection('products')
            .insertOne(this)
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDB();
        return db.collection('products')
            .find()
            .map(product => {
                return product;
            })
            .toArray()
            .catch(err => console.log(err));
    }

    static findById(producId) {
        const db = getDB();
        return db.collection('products')
            .findOne({ _id: new ObjectId(producId) })
            .then(product => product)
            .catch(err => console.log(err));
    }

    static updateById(productId, updatedProduct) {
        const db = getDB();
        updatedProduct = _.omit(updatedProduct, ['productId']);
        return db.collection('products')
            .updateOne({ _id: new ObjectId(productId) }, { $set: updatedProduct })
            .catch(err => console.log(err));
    }

    static deleteById(productId) {
        const db = getDB();
        return db.collection('products')
            .deleteOne({ _id: new ObjectId(productId) })
            .catch(err => console.log(err));
    }
};