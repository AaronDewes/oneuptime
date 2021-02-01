const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const teamSchema = new Schema({
    teamMembers: [
        {
            startTime: Date,
            endTime: Date,
            timezone: String,
            userId: { type: String, ref: 'User', index: true, },
        },
    ],
});

const escalationSchema = new Schema({
    projectId: {
        type: String,
        ref: 'Project',
        alias: 'project',
        default: null,
        index: true,
    },
    callReminders: { type: Number, default: null },
    emailReminders: { type: Number, default: null },
    smsReminders: { type: Number, default: null },
    rotateBy: { type: String, default: null },
    rotationInterval: { type: Number, default: null },
    firstRotationOn: Date,
    rotationTimezone: String,
    call: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    createdById: { type: String, ref: 'User', default: null, index: true, },
    scheduleId: { type: String, ref: 'Schedule', default: null },
    teams: { type: [teamSchema], default: null },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: String, ref: 'User', index: true, },
});
module.exports = mongoose.model('Escalation', escalationSchema);
