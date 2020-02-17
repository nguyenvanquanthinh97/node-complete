const express = require('express');

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

module.exports = router;