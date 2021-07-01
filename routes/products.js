const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user')
const twilio = require('twilio');
const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary/index');
const upload = multer({ storage });
const { isLoggedIn } = require('../middleware')

const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;
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
    const foundProducts = await (await Product.find({})).filter(prod => prod.qtyAvl>0);
    //console.log(foundProducts)
    res.render('products/index', { foundProducts })
        //}
})

router.get('/search/:cityOfPresence/:category', async(req, res) => {
    const { cityOfPresence, category } = req.params;
    const foundProducts = await (await Product.find({ cityOfPresence: cityOfPresence, category })).filter(prod => prod.qtyAvl>0);
    //console.log(foundProducts)
    console.log(`${req.user} in search results page!!!`);
    res.render('products/searchResult', { foundProducts })
})

router.get('/search', (req, res) => {
    res.render('products/search');
})

router.post('/search', (req, res) => {
    const { cityOfPresence, category } = req.body;
    //console.log(req.body)
    res.redirect(`/products/search/${cityOfPresence}/${category}`);
})


// Get a form to add new product
router.get('/new', isLoggedIn, (req, res) => {
    res.render('products/new', { categories });
    //res.send(`form for new product`)
})

// CREATE new product
router.post('/', isLoggedIn, upload.array('image'), async(req, res) => {
    const newProduct = new Product(req.body);
    newProduct.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //console.log(req.body, req.files)
    //res.send('Done');
    // console.log(newProduct);
    console.log(req.user);
    // var author = {
    //     id: req.user._id,
    //     username: req.user.username
    // }
    
    const curUser = req.user;
    newProduct.owner = {
        id: curUser._id,
        ownerName: curUser.username
    };
    await newProduct.save();
    console.log(`After creating a new product, newProduct: ${newProduct}`);

    const curSeller = await User.findById(curUser._id);
    curSeller.createdProducts.push(newProduct);
    await curSeller.save();
    console.log(`After creating a new product, seller info: ${curSeller}`);

    res.redirect('/user/myProducts');
})

// GET a particular product
router.get('/:id', async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id).populate("owner");
    // const username = currentUser.username;
    // const foundUser = await User.findOne({ username });
    // const admin = foundUser.isAdmin ? true : false;
    console.log(`${req.user} in SHOW page!!!`);
    res.render('products/show', { foundProduct });
})

router.get('/:id/edit', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
})

// UPDATE a product
router.put('/:id', isLoggedIn, upload.array('image'), async(req, res) => {
    const { id } = req.params;
    //console.log(req.body);
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.images.push(...imgs);
    // if (req.body.deleteImages) {
    //     for (let filename of req.body.deleteImages) {
    //         await cloudinary.uploader.destroy(filename);
    //     }
    //     try {
    //         const delImg = await Product.findByIdAndUpdate(id, { $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    //         console.log(product);
    //         console.log(`Del Img: ${delImg.upsertedId}`)
    //     } catch (err) {
    //         console.log(err);
    //         console.log('deletion failed!!!');
    //     }
    // }
    await product.save();
    //res.redirect(`/products/${id}`);
    res.redirect('/user/myProducts');
})

// Delete a product
router.delete('/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/user/myProducts');
})

router.get('/:id/buy', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    res.render('products/checkout', { foundProduct });
})

router.post('/:id/buy', async(req, res) => {
    console.log(`${req.user} in purchase PAGE!!`);
    const { username, address } = req.body;
    const { id } = req.params;

    const curUser = req.user;
    const foundProduct = await Product.findById(id);
    const buyer = await User.findById(curUser._id);
    buyer.boughtProducts.push(foundProduct);
    await buyer.save();
    
    console.log(`After purchase, buyer info: ${req.user}`);

    if (foundProduct.qtyAvl > 1) {
        foundProduct.qtyAvl--;
        await foundProduct.save();

        client.messages
            .create({
                body: `Dear seller, you have an order request from ${username} for ${foundProduct.name} at address : ${address}`,
                from: '+18173857837',
                to: '+919304257915'
            })
            .then(message => {
                console.log(message.sid);

                res.redirect('/products');
            })
            .catch(err => console.log("UNSUCCESSFUL PURCHASE", err));
    } else {
        foundProduct.qtyAvl--;
        await foundProduct.save();

        client.messages
            .create({
                body: `Dear seller, you have an order request from ${username} for ${foundProduct.name} at address : ${address}`,
                from: '+18173857837',
                to: '+919304257915'
            })
            .then(message => {
                console.log(message.sid);
            });    

        client.messages
            .create({
                body: `Dear seller, the amount of ${foundProduct.name} available for selling on CoMeds.com has reduced to zero, Kindly take necessary actions.`,
                from: '+18173857837',
                to: '+919304257915'
            })
            .then(message => {
                console.log(message.sid);
                res.redirect('/products');
            })
            .catch(err => {
                console.log("PRODUCT NOT AVAILABLE",err);
            })
        
    }

})

module.exports = router