const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const monitorSchema = new Schema({
    idNumber: {
        type: Schema.Types.Number,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        alias: 'project',
    }, //which project this incident belongs to.
    title: {
        type: Schema.Types.String,
    },
    description: {
        type: Schema.Types.String,
    },
    reason: {
        type: Schema.Types.String,
    },
    response: Object,
    monitorId: { type: String, ref: 'Monitor' }, // which monitor does this incident belongs to.
    notificationId: { type: String, ref: 'Notification' },
    incidentPriority: {
        type: String,
        ref: 'IncidentPriority',
    },
    acknowledged: {
        type: Boolean,
        default: false,
    },
    acknowledgedBy: { type: String, ref: 'User' }, // userId
    acknowledgedAt: {
        type: Date,
    },
    acknowledgedByZapier: {
        type: Boolean,
        default: false,
    }, // is true when zapier acknowledges incident

    resolved: {
        type: Boolean,
        default: false,
    },
    incidentType: {
        type: String,
        enum: ['online', 'offline', 'degraded'],
        required: false,
    },
    probes: [
        {
            probeId: { type: String, ref: 'Probe' },
            updatedAt: { type: Date },
            status: { type: Boolean, default: true },
            reportedStatus: {
                type: String,
                enum: ['online', 'offline', 'degraded'],
                required: false,
            },
        },
    ],
    resolvedBy: { type: String, ref: 'User' }, // userId
    resolvedAt: { type: Date },
    resolvedByZapier: {
        type: Boolean,
        default: false,
    }, // is true when zapier resolves incident

    internalNote: { type: String, default: '' },
    investigationNote: { type: String, default: '' },

    createdById: { type: String, ref: 'User' }, // userId

    createdAt: {
        type: Date,
        default: Date.now,
    },

    createdByZapier: {
        type: Boolean,
        default: false,
    }, // is true when zapier creates incident

    notClosedBy: [{ type: String, ref: 'User' }],
    manuallyCreated: { type: Boolean, default: false },

    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: String, ref: 'User' },
    breachedCommunicationSla: { type: Boolean, default: false },
    customFields: [{ fieldName: String, fieldValue: Schema.Types.Mixed }],
});
module.exports = mongoose.model('Incident', monitorSchema);
