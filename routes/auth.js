const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session')
const User = require('../models/user');
const Product =require('../models/product');

const client = require('twilio')(process.env.VERIFY_ACCOUNTSID, process.env.VERIFY_AUTHTOKEN);

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

router.get('/mobileverifyS1', async ( req, res ) => {
    const curUser = await User.findById(req.user._id);
    if(curUser.isSeller) res.redirect('/user/myProducts');
    else res.render('auth/mobileenter');
})

router.post('/mobileverifyS1', async (req, res) => {
    console.log(req.body);
    console.log(`${req.user} in /mobileverifyS1 page!!!`);

    const phone = req.body.ccode + req.body.phone;

    const data = await client
        .verify
        .services(process.env.VERIFY_SERVICEID)
        .verifications
        .create({
            to: phone,
            channel: 'sms'
        })
     
    res.render('auth/codeenter', { phone })
    //res.redirect('/user/mobileverifyS2');    
    //res.send(`Form submitted`);
})

router.get('/mobileverifyS2', (req, res) => {
    res.render('auth/codeenter');
})

router.post('/mobileverifyS2', async (req, res) => {
    console.log(`${req.body} in /mobileverifyS2 page!!!`);
    try {
        const phone = req.body.ccode + req.body.phone;
        const code = req.body.otp;
        const data = await client
            .verify
            .services(process.env.VERIFY_SERVICEID)
            .verificationChecks
            .create({
                to: phone,
                code: code
            })
        const curUser = req.user;
        console.log(`Current User: ${curUser}`);
        const seller = await User.findById(curUser._id);
        seller.isSeller=true;
        seller.phone = phone;
        await seller.save();
        console.log(`Seller: ${seller}`);   
        //res.send('Verified!!!');
        res.redirect('/user/myProducts');
    }
    catch(err) {
        console.log(err);
    }
})

router.get('/personaldetails', async (req, res) => {
    const curUser = await User.findById(req.user);
    res.render('auth/accountdetails', { curUser }); 
})

router.get('/purchasehistory', async (req, res) => {
    const curUser = req.user;
    const buyer = await User.findById(curUser._id).populate("boughtProducts");
    //console.log(`Buyer Info: ${buyer}`);
    res.render('products/purchasedProducts', { buyer });
})

router.get('/myProducts', async (req, res) => {
    const curUser = req.user;
    console.log(`Before populating: ${curUser}`);
    const seller = await User.findById(curUser._id).populate("createdProducts");
        
    //const addedProducts = seller.createdProducts.map(prod => prod);
    console.log(`After populating: ${seller}`);
    console.log(`RESULT: ${seller.createdProducts}`);
    //console.log(`Products added by current seller: ${addedProducts? addedProducts : "NIL"}`);
    res.render('products/createdProducts', { seller });
        
    
})


router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/user/login')
})

// router.post('/logout', (req, res) => {
//     req.session.user_id = null;
//     res.redirect('/user/login')
// })

module.exports = router
