const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://Thinh97:0981864371@office-manager-3cpmo.mongodb.net/test?retryWrites=true&w=majority';

let _db;

const initialConnect = (callback) => {
    MongoClient.connect(url)
        .then(client => {
            _db = client.db('shop');
            return callback();
        })
        .catch(err => {
            if (err) {
                throw err;
            }
        });
};

const getDB = () => {
    if (_db) {
        return _db;
    }
    throw new Error("Error in connecting to Mongodb");
};

module.exports = {
    initialConnect,
    getDB
};