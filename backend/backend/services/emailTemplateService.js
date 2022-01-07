module.exports = {
    create: async function(data) {
        const emailTemplateModel = new EmailTemplateModel();
        emailTemplateModel.projectId = data.projectId || null;
        emailTemplateModel.subject = data.subject || null;
        emailTemplateModel.body = data.body || null;
        emailTemplateModel.emailType = data.emailType || null;
        emailTemplateModel.allowedVariables =
            emailTemplateVariables[[data.emailType]];
        const emailTemplate = await emailTemplateModel.save();
        return emailTemplate;
    },

    updateOneBy: async function(query, data) {
        if (!query) {
            query = {};
        }

        if (!query.deleted) query.deleted = false;

        if (data.emailType && !data.allowedVariables) {
            data.allowedVariables = emailTemplateVariables[[data.emailType]];
        }
        const updatedEmailTemplate = await EmailTemplateModel.findOneAndUpdate(
            query,
            {
                $set: data,
            },
            {
                new: true,
            }
        );
        return updatedEmailTemplate;
    },

    updateBy: async function(query, data) {
        if (!query) {
            query = {};
        }

        if (!query.deleted) query.deleted = false;
        let updatedData = await EmailTemplateModel.updateMany(query, {
            $set: data,
        });
        const select = 'projectId subject body emailType allowedVariables';
        updatedData = await this.findBy({
            query,
            select,
            populate: [{ path: 'projectId', select: 'nmae' }],
        });
        return updatedData;
    },

    deleteBy: async function(query, userId) {
        const emailTemplate = await EmailTemplateModel.findOneAndUpdate(
            query,
            {
                $set: {
                    deleted: true,
                    deletedById: userId,
                    deletedAt: Date.now(),
                },
            },
            {
                new: true,
            }
        );
        return emailTemplate;
    },

    findBy: async function({ query, skip, limit, select, populate }) {
        if (!skip) skip = 0;

        if (!limit) limit = 10;

        if (typeof skip === 'string') {
            skip = parseInt(skip);
        }

        if (typeof limit === 'string') {
            limit = parseInt(limit);
        }

        if (!query) {
            query = {};
        }

        query.deleted = false;
        let emailTemplates = EmailTemplateModel.find(query)
            .lean()
            .sort([['createdAt', -1]])
            .limit(limit)
            .skip(skip);
        emailTemplates = handleSelect(select, emailTemplates);
        emailTemplates = handlePopulate(populate, emailTemplates);
        const result = await emailTemplates;

        return result;
    },

    findOneBy: async function({ query, select, populate }) {
        if (!query) {
            query = {};
        }

        query.deleted = false;
        let emailTemplate = EmailTemplateModel.findOne(query)
            .lean()
            .sort([['createdAt', -1]]);

        emailTemplate = handleSelect(select, emailTemplate);
        emailTemplate = handlePopulate(populate, emailTemplate);
        const result = await emailTemplate;
        return result;
    },

    countBy: async function(query) {
        if (!query) {
            query = {};
        }

        query.deleted = false;
        const count = await EmailTemplateModel.countDocuments(query);
        return count;
    },

    getTemplates: async function(projectId) {
        const _this = this;
        const select = 'projectId subject body emailType allowedVariables';
        const templates = await Promise.all(
            defaultTemplate.map(async template => {
                const emailTemplate = await _this.findOneBy({
                    query: {
                        projectId: projectId,
                        emailType: template.emailType,
                    },
                    select,
                    populate: [{ path: 'projectId', select: 'nmae' }],
                });
                return emailTemplate != null && emailTemplate != undefined
                    ? emailTemplate
                    : template;
            })
        );
        return templates;
    },

    resetTemplate: async function(projectId, templateId) {
        const _this = this;
        const select = 'projectId subject body emailType allowedVariables';
        const oldTemplate = await _this.findOneBy({
            query: { _id: templateId },
            select,
            populate: [{ path: 'projectId', select: 'nmae' }],
        });
        const newTemplate = defaultTemplate.filter(
            template => template.emailType === oldTemplate.emailType
        )[0];
        const resetTemplate = await _this.updateOneBy(
            {
                _id: oldTemplate._id,
            },
            {
                emailType: newTemplate.emailType,
                subject: newTemplate.subject,
                body: newTemplate.body,
                allowedVariables: newTemplate.allowedVariables,
            }
        );
        return resetTemplate;
    },

    hardDeleteBy: async function(query) {
        await EmailTemplateModel.deleteMany(query);
        return 'Email Template(s) removed successfully';
    },
};

const EmailTemplateModel = require('../models/emailTemplate');
const emailTemplateVariables = require('../config/emailTemplateVariables');
const defaultTemplate = require('../config/emailTemplate');
const handleSelect = require('../utils/select');
const handlePopulate = require('../utils/populate');
