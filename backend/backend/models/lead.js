const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const leadSchema = new Schema({
    type: String,
    name: String,
    email: String,
    website: String,
    phone: String,
    whitepaperName: String,
    country: String,
    companySize: String,
    message: String,

    createdAt: { type: Date, default: Date.now },

    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },
    source: Object,
    deletedById: { type: String, ref: 'User', index: true },
});
module.exports = mongoose.model('Lead', leadSchema);
