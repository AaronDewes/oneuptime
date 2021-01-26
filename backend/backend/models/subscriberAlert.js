const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const subscriberAlertSchema = new Schema({
    projectId: { type: String, ref: 'Project' },
    subscriberId: { type: String, ref: 'Subscriber' },
    incidentId: { type: String, ref: 'Incident' },
    alertVia: {
        type: String,
        enum: ['sms', 'email', 'webhook'],
        required: true,
    },
    alertStatus: String,
    eventType: {
        type: String,
        enum: [
            'identified',
            'acknowledged',
            'resolved',
            'Investigation note created',
            'Investigation note updated',
        ],
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
    error: { type: Boolean, default: false },
    errorMessage: String,
    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: String, ref: 'User' },
    totalSubscribers: { type: Number },
    identification: { type: Number },
});
module.exports = mongoose.model('SubscriberAlert', subscriberAlertSchema);
