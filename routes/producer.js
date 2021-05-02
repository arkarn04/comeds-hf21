const express = require('express');
const router = express.Router();
const Producer = require('../models/producer')
const User = require('../models/user')

router.get('/new', (req, res) => {
    res.render('producers/new')
})

router.post('/new', async(req, res) => {
    const newProducer = new Producer(req.body);
    console.log(req.body)
    const { username } = req.body;
    const foundUser = await User.findOne({ username })
    foundUser.isAdmin = true;
    await foundUser.save();
    await newProducer.save();
    console.log(newProducer);
    console.log(foundUser)
    res.redirect('/products');
})

module.exports = router