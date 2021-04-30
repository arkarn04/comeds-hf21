const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const productRoutes = require('./routes/products')

// Database Config
mongoose.connect('mongodb+srv://userC01:Website123@comeds0.iglnm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`MongoDB Connected`)
    })
    .catch(err => {
        console.log(`Database Error!!!`);
        console.log(err);
    })


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', productRoutes)

app.get('/', (req, res) => {
    res.send("Hi there!!!")
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
})