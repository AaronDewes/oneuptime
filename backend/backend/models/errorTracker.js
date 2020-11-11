const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const errorTrackerSchema = new Schema({
    componentId: {
        type: Schema.Types.ObjectId,
        ref: 'Component',
        alias: 'component',
    }, //which component this error tracker belongs to.
    name: String,
    key: String,
    resourceCategory: {
        type: Schema.Types.ObjectId,
        ref: 'ResourceCategory',
    },
    createdById: { type: String, ref: 'User' }, //userId.
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: String, ref: 'User' },
});

errorTrackerSchema.virtual('component', {
    localField: '_id',
    foreignField: 'componentId',
    ref: 'Component',
    justOne: true,
});

module.exports = mongoose.model('ErrorTracker', errorTrackerSchema);
