import mongoose, { RequiredFields, UniqueFields } from '../Infrastructure/ORM';

const Schema = mongoose.Schema;
const schema = new Schema({
    projectId: { type: String, ref: 'Project', index: true }, //which project does this belong to.
    accountSid: String,
    authToken: String,
    phoneNumber: String,
    iv: Schema.Types.Buffer,
    enabled: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    deleted: { type: Boolean, default: false },

    deletedAt: {
        type: Date,
    },

    deletedById: { type: String, ref: 'User', index: true },
});

export const requiredFields: RequiredFields = schema.requiredPaths();

export const uniqueFields: UniqueFields = [];

export const sligifyField: string = '';

export default mongoose.model('Twilio', schema);
