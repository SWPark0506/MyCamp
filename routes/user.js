const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const { model } = require('mongoose');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const user = require('../controllers/users')

router.route('/register')
    .get(user.renderRegister)
    .post(catchAsync(user.register))

router.route('/login')
    .get(user.renderLogin)
    .post(storeReturnTo,
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        user.login)

router.get('/logout', user.logout)

module.exports = router;
