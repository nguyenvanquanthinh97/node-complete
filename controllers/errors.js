const _ = require('lodash');

module.exports.error404 = (req, res, next) => {
    res.status(404).render('404', {
        docTitle: "Page Not Found",
        isAuthenticated: _.get(req.session, 'isLoggedIn')
    });
}

module.exports.error500 = (req, res, next) => {
    res.status(500).render('500', {
        docTitle: 'Internal Error',
        isAuthenticated: _.get(req.session, 'isLoggedIn')
    })
}