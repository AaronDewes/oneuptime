const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const statusSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        alias: 'project',
        index: true,
    }, //which project this statuspage belongs to.
    domains: [
        {
            domain: String, // complete domain eg status.fyipe.com
            cert: String, // filename gridfs
            privateKey: String, // filename gridfs
            enableHttps: { type: Boolean, default: false },
            autoProvisioning: { type: Boolean, default: false },
            domainVerificationToken: {
                type: Schema.Types.ObjectId,
                ref: 'DomainVerificationToken',
                index: true,
            },
        },
    ],
    monitors: [
        {
            monitor: {
                type: Schema.Types.ObjectId,
                ref: 'Monitor',
                index: true,
            },
            description: String,
            uptime: Boolean,
            memory: Boolean,
            cpu: Boolean,
            storage: Boolean,
            responseTime: Boolean,
            temperature: Boolean,
            runtime: Boolean,
        },
    ],
    links: Array,
    slug: String,
    title: { type: String, default: 'Status Page' },
    name: String,
    isPrivate: {
        type: Boolean,
        default: false,
    },
    isSubscriberEnabled: {
        type: Boolean,
        default: false,
    },
    isGroupedByMonitorCategory: {
        type: Boolean,
        default: false,
    },
    showScheduledEvents: {
        type: Boolean,
        default: true,
    },
    // show incident to the top of status page
    moveIncidentToTheTop: {
        type: Boolean,
        default: false,
    },
    // show or hide the probe bar
    hideProbeBar: {
        type: Boolean,
        default: false,
    },
    // show or hide uptime (%) on the status page
    hideUptime: {
        type: Boolean,
        default: false,
    },
    // show or hide resolved incident on the status page
    hideResolvedIncident: {
        type: Boolean,
        default: false,
    },
    description: String,
    copyright: String,
    faviconPath: String,
    logoPath: String,
    bannerPath: String,
    colors: Object,
    layout: Object,
    classicThemeLayout: Object,
    cleanThemeLayout: Object,
    headerHTML: String,
    footerHTML: String,
    customCSS: String,
    customJS: String,
    statusBubbleId: String,
    embeddedCss: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    enableRSSFeed: {
        type: Boolean,
        default: true,
    },
    emailNotification: {
        type: Boolean,
        default: true,
    },
    smsNotification: {
        type: Boolean,
        default: true,
    },
    webhookNotification: {
        type: Boolean,
        default: true,
    },
    selectIndividualMonitors: {
        type: Boolean,
        default: false,
    },
    enableIpWhitelist: { type: Boolean, default: false },
    ipWhitelist: { type: Array, default: [] },
    deleted: { type: Boolean, default: false },
    incidentHistoryDays: { type: Number, default: 14 },
    scheduleHistoryDays: { type: Number, default: 14 },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    theme: { type: String, default: 'Clean Theme' },
});
module.exports = mongoose.model('StatusPage', statusSchema);
