const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: String,
    email: String,
    tempEmail: String,
    password: String,
    isVerified: {
        type: Boolean,
        default: false,
    },
    sso: { type: String, ref: 'Sso' },
    companyName: String,
    companyRole: String,
    companySize: String,
    referral: String,
    companyPhoneNumber: String,

    airtableId: String,

    onCallAlert: Array,
    profilePic: String,

    twoFactorAuthEnabled: { type: Boolean, default: false },
    twoFactorSecretCode: String,
    otpauth_url: String,
    backupCodes: Array,

    jwtRefreshToken: String,
    stripeCustomerId: String,
    resetPasswordToken: String,
    resetPasswordExpires: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    timezone: String,
    lastActive: {
        type: Date,
        default: Date.now,
    },
    coupon: String,

    disabled: {
        type: Boolean,
        default: false,
    },
    paymentFailedDate: {
        type: Date,
        default: null,
    },
    role: {
        type: String,
        enum: ['master-admin', 'user'],
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    adminNotes: [
        {
            note: { type: String },
            createdAt: { type: Date },
        },
    ],

    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: String, ref: 'User' },
    alertPhoneNumber: {
        type: String,
        default: '',
    },
    alertPhoneVerificationCode: {
        type: String,
        default: '',
    },
    alertPhoneVerificationCodeRequestTime: {
        type: Date,
    },
    tempAlertPhoneNumber: String,
    tutorial: Object,
    createdBy: { type: String, ref: 'User' },
});

module.exports = mongoose.model('User', userSchema);
