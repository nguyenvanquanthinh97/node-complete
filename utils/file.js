const fs = require('fs');

module.exports.removeFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw new Error(err);
        }
    });
};