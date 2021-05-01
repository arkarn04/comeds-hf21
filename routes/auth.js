const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session')
const User = require('../models/user');

const isUserLoggedin = () => {
    if (!req.session.user_id) {
        return res.redirect('/user/login')
    }
    next();
}

router.get('/register', (req, res) => {
    res.render('auth/register');
})

router.post('/register', async(req, res) => {
    const { name, email, dateOfBirth, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        name,
        email,
        dateOfBirth,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/products');
})

router.get('/login', (req, res) => {
    res.render('auth/login');
})

router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    const isValidUser = await bcrypt.compare(password, foundUser.password);
    if (isValidUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/products')
    } else {
        res.redirect('/user/login')
    }
})

router.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/user/login')
})

module.exports = router