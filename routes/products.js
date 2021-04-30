const express = require('express');
const router = express.Router();
const Product = require('../models/product');

const categories = ['medicine', 'oxygen-cylinder', 'equipments'];

//GET all products
router.get('/products', async(req, res) => {
    const foundProducts = await Product.find({})
    res.render('products/index', { foundProducts })
})


// Get a form to add new product
router.get('/products/new', (req, res) => {
    res.render('products/new', { categories });
    //res.send(`form for new product`)
})

// CREATE new product
router.post('/products', async(req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect('/products');
})

// GET a particular product
router.get('/products/:id', async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    res.render('products/show', { foundProduct });
})

router.get('/products/:id/edit', async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
})

router.put('/products/:id', async(req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${id}`);

})

router.delete('/products/:id', async(req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

module.exports = router