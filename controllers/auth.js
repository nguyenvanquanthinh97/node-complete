const bcrypt = require('bcryptjs');
const _ = require('lodash');
const EmailTemplate = require('email-templates');
const sgMail = require('@sendgrid/mail');
const randomBytes = require('randombytes');

const User = require('../models/user');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.getLogin = (req, res, next) => {
    let errors = req.flash('error');
    if (errors.length > 0) {
        errors = errors[0];
    } else {
        errors = null;
    }
    res.render("auth/login", {
        docTitle: "Login Page",
        path: "/auth/login",
        isAuthenticated: _.get(req.session, 'isLoggedIn'),
        error: errors
    });
};

module.exports.postLogin = (req, res, next) => {
    const email = _.get(req.body, 'email');
    const inputPassword = _.get(req.body, 'password');

    return User.findByEmail(email)
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid Email or Password');
                return res.redirect('/auth/login');
            }
            return bcrypt.compare(inputPassword, _.get(user, 'password'))
                .then(result => {
                    if (result) {
                        _.set(req.session, 'user', user);
                        _.set(req.session, 'isLoggedIn', true);
                        req.session.save(() => {
                            res.redirect('/');
                        });
                    }
                    else {
                        req.flash('error', 'Invalid Email or Password');
                        return res.redirect('/auth/login');
                    }
                });
        })
        .catch(err => {
            req.flash('error', 'Invalid Email or Password');
            console.log(err);
        });
};

module.exports.logout = (req, res, next) => {
    return req.session.destroy(err => {
        if (err) {
            console.log(err);
        }

        res.redirect('/');
    });
};

module.exports.getSignup = (req, res, next) => {
    let errors = req.flash('error');
    if (errors.length === 0) {
        errors = null;
    } else {
        errors = errors[0];
    }

    res.render('auth/signup', {
        docTitle: "Signup Page",
        path: "/auth/signup",
        error: errors
    });
};

module.exports.postSignup = (req, res, next) => {
    const username = _.get(req.body, 'username');
    const password = _.get(req.body, 'password');
    const confirmPassword = _.get(req.body, 'confirmPassword');
    const email = _.get(req.body, 'email');

    if (confirmPassword !== password) {
        req.flash('error', "Password doesn't match with Confirm Passsword");
        return res.redirect('/auth/signup');
    }

    return bcrypt.genSalt(12)
        .then(salt => {
            return bcrypt.hash(password, salt);
        })
        .then(hashPassword => {
            const user = new User(username, email, [], '', hashPassword);
            return user;
        })
        .then(user => {
            return user.save()
                .then(() => {
                    res.redirect('/auth/login');
                    let template = new EmailTemplate({
                        views: {
                            root: 'views'
                        }
                    });
                    template.render('verify-email.pug', {
                        username: username
                    })
                        .then(result => {
                            sgMail.send({
                                to: email,
                                from: 'CongtyABC@gmail.com',
                                subject: 'Validation',
                                html: result
                            });
                        });
                })
                .catch(err => {
                    console.log(err);
                    req.flash('error', 'Email is already existed');
                    res.redirect('/auth/signup');
                });
        })
        .catch(err => console.log(err));
};

module.exports.getReset = (req, res, next) => {
    let errors = req.flash('error');
    if (errors.length > 0) {
        errors = errors[0];
    } else {
        errors = null;
    }

    res.render('auth/reset', {
        docTitle: 'Reset Password Page',
        path: '/auth/reset',
        error: errors
    });
};

module.exports.postReset = (req, res, next) => {
    const email = _.get(req.body, 'email');

    return randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/auth/reset');
        }
        const token = buffer.toString('hex');
        return User.findByEmail(email)
            .then(user => {
                if (!user) {
                    req.flash('error', 'Your email does not exist');
                    return res.redirect('/auth/reset');
                }
                const expiration = Date.now() + 3600 * 1000;
                return User.updateToken(user._id, token, expiration)
                    .then(result => {
                        res.redirect('/');
                        let template = new EmailTemplate({
                            views: {
                                root: 'views'
                            }
                        });
                        return template.render('reset-email.pug', {
                            username: _.get(user, 'username'),
                            token: token
                        })
                            .then(result => {
                                return sgMail.send({
                                    to: email,
                                    from: 'CongtyABC@gmail.com',
                                    subject: 'Validation',
                                    html: result
                                });
                            }
                            );
                    });
            })
            .catch(err => {
                console.log(err);
            });
    });
};