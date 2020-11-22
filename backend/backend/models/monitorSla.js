const mongoose = require('../config/db');
const Schema = mongoose.Schema;

const monitorSlaSchema = new Schema(
    {
        name: String,
        projectId: { ref: 'Project', type: Schema.Types.ObjectId },
        isDefault: { type: Boolean, default: false },
        frequency: { type: String, default: '30' }, // measured in days
        alertTime: String, // measured in days
        deleted: { type: Boolean, default: false },
        deletedAt: Date,
    },
    { timestamps: true } //automatically adds createdAt and updatedAt to the collection
);

module.exports = mongoose.model('MonitorSla', monitorSlaSchema);
