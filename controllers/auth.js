const _ = require('lodash');

module.exports.getLogin = (req, res, next) => {
    res.render("auth/login", {
        docTitle: "Login Page",
        path: "/auth/login",
        isAuthenticated: (_.get(req.cookies, 'loggedIn') === 'true')
    })
}

module.exports.postLogin = (req, res, next) => {
    res.cookie('loggedIn', 'true', {httpOnly: true});
    res.redirect('/');
}