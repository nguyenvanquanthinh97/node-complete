const { get } = require('lodash');
module.exports = (req, res, next) => {
    if (!get(req.session, 'isLoggedIn')) {
        return res.redirect('/auth/login');
    }
    next();
};