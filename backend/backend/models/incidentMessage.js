const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const incidentLogSchema = new Schema({
    incidentId: {
        type: Schema.Types.ObjectId,
        ref: 'Incident',
        alias: 'incident',
    },
    content: String,
    type: {
        type: String,
        enum: ['investigation', 'internal'],
        required: true,
    },
    incident_state: String,
    createdById: { type: String, ref: 'User' }, //userId.
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updated: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: String, ref: 'User' },
});

incidentLogSchema.virtual('incident', {
    localField: '_id',
    foreignField: 'incidentId',
    ref: 'Incident',
    justOne: true,
});

module.exports = mongoose.model('IncidentMessage', incidentLogSchema);
