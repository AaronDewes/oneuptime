import mongoose, { RequiredFields, UniqueFields } from '../Infrastructure/ORM';
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        name: String,
        projectId: { ref: 'Project', type: Schema.Types.ObjectId, index: true },
        isDefault: { type: Boolean, default: false },
        duration: { type: String, default: '60' },
        alertTime: String,
        deleted: { type: Boolean, default: false },
        deletedAt: Date,
    },
    { timestamps: true } //automatically adds createdAt and updatedAt to the collection
);

export const requiredFields: RequiredFields = schema.requiredPaths();

export const uniqueFields: UniqueFields = [];

export const sligifyField: string = '';

export default mongoose.model('IncidentCommunicationSla', schema);
