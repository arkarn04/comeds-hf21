const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const twilio = require('twilio');
const { isLoggedIn } = require('../middleware')

const accountSid = 'AC68ec3537a966821af42b2faa906c17f0';
const authToken = 'a0ddcaaf9d152560f539fdb5056bb444';
const client = require('twilio')(accountSid, authToken);

const categories = ['medicine', 'oxygen-cylinder', 'equipments'];

//GET all products
router.get('/', async(req, res) => {
    // if (req.query.city && req.query.category) {
    //     const queryCity = req.query.city;
    //     const queryCat = req.query.category;
    //     const foundSortedProducts = await Product.find({ city: queryCity, category: queryCat });
    //     res.render('products/index', { foundProducts: foundSortedProducts })
    // } else {
    const foundProducts = await Product.find({})
    console.log(foundProducts)
    res.render('products/index', { foundProducts })
        //}
})

router.get('/search/:cityOfPresence/:category', async(req, res) => {
    const { cityOfPresence, category } = req.params;
    const foundProducts = await Product.find({ cityOfPresence: cityOfPresence });
    console.log(foundProducts)
    res.render('products/searchResult', { foundProducts })
})

router.get('/search', (req, res) => {
    res.render('products/search');
})

router.post('/search', (req, res) => {
    const { cityOfPresence, category } = req.body;
    console.log(req.body)
    res.redirect(`/products/search/${cityOfPresence}/${category}`);
})


// Get a form to add new product
router.get('/new', isLoggedIn, (req, res) => {
    res.render('products/new', { categories });
    //res.send(`form for new product`)
})

// CREATE new product
router.post('/', isLoggedIn, async(req, res) => {
    const newProduct = new Product(req.body);
    console.log(req.body)
    await newProduct.save();
    res.redirect('/products');
})

// GET a particular product
router.get('/:id', async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    // const username = currentUser.username;
    // const foundUser = await User.findOne({ username });
    // const admin = foundUser.isAdmin ? true : false;
    res.render('products/show', { foundProduct });
})

router.get('/:id/edit', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
})

router.put('/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${id}`);

})

router.delete('/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

router.get('/:id/buy', async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    res.render('products/checkout', { foundProduct })
})

router.post('/:id/buy', async(req, res) => {
    const { username, address } = req.body;
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    if (foundProduct.qtyAvl > 0) {
        foundProduct.qtyAvl--;
        await foundProduct.save();

        client.messages
            .create({
                body: `Dear seller, you have an order request from ${username} for ${foundProduct.name} at address : ${address}`,
                from: '+18173857837',
                to: '+919304257915'
            })
            .then(message => console.log(message.sid));
        res.redirect('/products')
    } else {
        client.messages
            .create({
                body: `Dear seller, the amount of ${foundProduct.name} available for selling on CoMeds.com has reduced to zero, Kindly take necessary actions.`,
                from: '+18173857837',
                to: '+919304257915'
            })
            .then(message => console.log(message.sid));
        res.redirect('/products')
    }

})

module.exports = router