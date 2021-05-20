/* eslint-disable linebreak-style */
/**
 *
 * Copyright HackerBay, Inc.
 *
 */
module.exports = {
    //Description: Create new user entry on airtable.
    //Params:
    //Param 1: data: User data (name, email, phone, company, jobRole, createdAt).
    //Returns: promise

    find: async function({ tableName, view, limit }) {
        return base(tableName)
            .select({ view, pageSize: limit })
            .firstPage();
    },

    update: async function({ tableName, id, fields }) {
        return base(tableName).update(id, fields);
    },

    create: async function({ tableName, fields }) {
        return base(tableName).create(fields);
    },

    delete: async function({ tableName, id }) {
        return base(tableName).destroy(id);
    },

    logUser: function({
        name,
        email,
        phone,
        company,
        jobRole,
        createdAt,
        source,
    }) {
        if (!base) return;

        return base('User').create({
            Name: name,
            Email: email,
            Phone: phone,
            Company: company,
            'Job Role': jobRole,
            'Created At': createdAt,
            Source: source,
        });
    },

    deleteUser: function(airtableId) {
        if (!base) return;

        return base('User').destroy(airtableId);
    },

    //Description: Create new feedback entry on airtable.
    //Params:
    //Param 1: data: Feedback data (message, name, email, project, page).
    //Returns: promise
    logFeedback: function({ message, name, email, project, page }) {
        if (!base) return;

        return base('Feedback').create({
            'Feedback Text': message,
            'User Full Name': name,
            'User Email': email,
            'Project Name': project,
            'Page Name': page,
        });
    },

    deleteFeedback: function(airtableId) {
        if (!base) return;

        if (!airtableId) {
            return;
        }

        return base('Feedback').destroy(airtableId);
    },

    deleteAll: async function({ tableName, view, limit }) {
        if (!view) {
            view = 'Grid view';
        }

        if (!limit) {
            limit = 10;
        }

        if (limit > 10) {
            throw new Error('Pagesize cannot be greater than 10');
        }

        const records = await base(tableName)
            .select({ view, pageSize: limit })
            .firstPage();

        if (records && records.length > 0) {
            const recordIds = records.map(function(record) {
                return record.id;
            });

            return await base(tableName).destroy(recordIds);
        }
    },

    logProjectDeletionFeedback: function({ reason, project, name, email }) {
        if (!base) return;

        return base('Project Delete').create({
            'Reason for Deletion': reason,
            'Project Name': project,
            'Full Name': name,
            Email: email,
        });
    },
};

const Airtable = require('airtable');
const AirtableApiKey = process.env['AIRTABLE_API_KEY'];
const AirtableBaseId = process.env['AIRTABLE_BASE_ID'];
let base = null;
if (AirtableApiKey && AirtableBaseId)
    base = new Airtable({ apiKey: AirtableApiKey }).base(AirtableBaseId);
