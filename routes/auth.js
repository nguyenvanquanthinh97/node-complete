const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();

const authenticationMiddleware = require('../middleware/authentication');
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authenticationMiddleware, authController.logout);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

module.exports = router;