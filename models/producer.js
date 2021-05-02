const mongoose = require('mongoose');
const { Schema } = mongoose;

const producerSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: Number
    },
    dateOfBirth: {
        type: Date
    },
    storeName: {
        type: String
    },
    storeStreet: String,
    storeCity: String,
    storeState: String,
    storePIN: {
        type: String
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
})