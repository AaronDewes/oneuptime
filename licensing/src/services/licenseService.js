
module.exports = {
    confirm: async ({ license, email, limit }) => {
        try {
            if (!limit) limit = 9999;

            if (typeof limit === 'string') {
                limit = parseInt(limit);
            }

            const records = await AirtableService.find({
                tableName: 'License',
                view: 'Grid view',
                limit,
            });
            const userRecord = {};

            for (const record of records) {
                const fetchedLicense = record.get('License Key');
                if (license === fetchedLicense) {
                    userRecord['id'] = record.id;
                    userRecord['expiryDate'] = record.get('Expires');
                }
            }

            if (Object.entries(userRecord).length === 0) {
                const error = new Error('Invalid License');
                error.statusCode = 400;
                throw error;
            }

            const presentTime = new Date().getTime();
            const expiryTime = new Date(userRecord.expiryDate).getTime();

            if (expiryTime < presentTime) {
                const error = new Error('License Expired');
                error.statusCode = 400;
                throw error;
            }

            await AirtableService.update({
                tableName: 'License',
                id: userRecord.id,
                fields: {
                    'Contact Email': email,
                },
            });

            const token = generateWebToken({
                license,
                presentTime,
                expiryTime,
            });

            return { token };
        } catch (error) {
            ErrorService.log('licenseService.confirm', error);
            throw error;
        }
    },
};

const generateWebToken = require('../utils/WebToken').generateWebToken;
const AirtableService = require('./airtableService');
const ErrorService = require('./errorService');
