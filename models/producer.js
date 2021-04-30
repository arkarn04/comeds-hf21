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
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    storeName: {
        type: String
    },
    storeStreet: String,
    storeCity: String,
    storeState: String,
    storeCountry: String,
    storeAddress:
})