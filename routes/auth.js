const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
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

router.post('/register', async(req, res, next) => {
    const { username, email, dateOfBirth, password } = req.body;
    const user = new User({ username, email, dateOfBirth });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
            if (err) return next(err)
            res.redirect('/products');
        })
        // const hash = await bcrypt.hash(password, 12);
        // const user = new User({
        //     name,
        //     email,
        //     dateOfBirth,
        //     password: hash
        // })
        // await user.save();
        // req.session.user_id = user._id;

})

router.get('/login', (req, res) => {
    res.render('auth/login');
})

router.post('/login', passport.authenticate('local', {
    // successRedirect: '/products',
    faliureRedirect: '/user/login'
}), (req, res) => {
    // req.flash('success', 'Welcome!!!')
    const redirectUrl = req.session.returnTo || '/products'
    delete req.session.returnTo;
    res.redirect(redirectUrl);

})

// router.post('/login', async(req, res) => {
//     const { email, password } = req.body;
//     const foundUser = await User.findOne({ email });
//     const isValidUser = await bcrypt.compare(password, foundUser.password);
//     if (isValidUser) {
//         req.session.user_id = foundUser._id;
//         res.redirect('/products')
//     } else {
//         res.redirect('/user/login')
//     }
// })

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/user/login')
})

// router.post('/logout', (req, res) => {
//     req.session.user_id = null;
//     res.redirect('/user/login')
// })

module.exports = router