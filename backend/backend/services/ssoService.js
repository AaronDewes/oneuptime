module.exports = {
    findBy: async function({ query, limit, skip, select, populate }) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};

            if (!query.deleted) query.deleted = false;

            let ssosQuery = SsoModel.find(query, {
                _id: 1,
                domain: 1,
                createdAt: 1,
            })
                .lean()
                .sort([['createdAt', -1]])
                .skip(skip)
                .limit(limit);

            ssosQuery = handleSelect(select, ssosQuery);
            ssosQuery = handlePopulate(populate, ssosQuery);

            const ssos = await ssosQuery;
            return ssos;
        } catch (error) {
            ErrorService.log('ssoService.findBy', error);
            throw error;
        }
    },

    deleteBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const sso = await SsoModel.findOneAndUpdate(
                query,
                { $set: { deleted: true, deletedAt: Date.now() } },
                { new: true }
            );
            if (sso) {
                const { _id: domain } = sso;
                const ssoDefaultRoles = await SsoDefaultRolesService.findBy({
                    query: { domain },
                    select: '_id',
                });
                for (const ssoDefaultRole of ssoDefaultRoles) {
                    const { _id } = ssoDefaultRole;
                    await SsoDefaultRolesService.deleteBy({ _id });
                }
            }
            return sso;
        } catch (error) {
            ErrorService.log('ssoService.deleteBy', error);
            throw error;
        }
    },

    create: async function(data) {
        try {
            const sso = new SsoModel();
            sso['saml-enabled'] = data['saml-enabled'] || false;

            if (!data.domain) {
                const error = new Error('Domain must be defined.');
                error.code = 400;
                ErrorService.log('ssoService.create', error);
                throw error;
            }
            sso.domain = data.domain;

            if (!data.entityId) {
                const error = new Error('Application ID must be defined');
                error.code = 400;
                ErrorService.log('ssoService.create', error);
                throw error;
            }
            sso.entityId = data.entityId;

            if (!data.remoteLoginUrl) {
                const error = new Error('Remote Login Url must be defined.');
                error.code = 400;
                ErrorService.log('ssoService.create', error);
                throw error;
            }
            sso.remoteLoginUrl = data.remoteLoginUrl;

            sso.certificateFingerprint = data.certificateFingerprint;

            if (!data.remoteLogoutUrl) {
                const error = new Error('Remote Logout URL must be defined.');
                error.code = 400;
                ErrorService.log('ssoService.create', error);
                throw error;
            }
            sso.remoteLogoutUrl = data.remoteLogoutUrl;

            sso.ipRanges = data.ipRanges;

            const savedSso = await sso.save();
            return savedSso;
        } catch (error) {
            ErrorService.log('ssoService.create', error);
            throw error;
        }
    },

    findOneBy: async function({ query, select, populate }) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) {
                query.deleted = false;
            }
            let ssoQuery = SsoModel.findOne(query).lean();

            ssoQuery = handleSelect(select, ssoQuery);
            ssoQuery = handlePopulate(populate, ssoQuery);

            const sso = await ssoQuery;

            return sso;
        } catch (error) {
            ErrorService.log('ssoService.findOneBy', error);
            throw error;
        }
    },

    updateBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }
            if (query.createdAt !== undefined) {
                delete query.createdAt;
            }
            query.deleted = false;

            await SsoModel.updateMany(query, {
                $set: data,
            });

            const selectSso =
                '_id saml-enabled domain entityId remoteLoginUrl certificateFingerprint remoteLogoutUrl ipRanges createdAt deleted deletedAt deletedById';
            const sso = await this.findBy({ query, select: selectSso });
            return sso;
        } catch (error) {
            ErrorService.log('ssoService.updateBy', error);
            throw error;
        }
    },

    countBy: async function(query) {
        if (!query) {
            query = {};
        }

        if (!query.deleted) query.deleted = false;

        const count = await SsoModel.countDocuments(query);
        return count;
    },

    hardDeleteBy: async function(query) {
        try {
            await SsoModel.deleteMany(query);
            return 'SSO(s) removed successfully!';
        } catch (error) {
            ErrorService.log('ssoService.hardDeleteBy', error);
            throw error;
        }
    },

    // grab the email from xml response
    // assuming there's only one email in the xml response
    // or the same email x times in the response
    getEmail: function(xml) {
        const stringifiedXml = String(xml);
        // eslint-disable-next-line no-control-regex
        const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
        return stringifiedXml.match(regex)[0];
    },
};

const SsoModel = require('../models/sso');
const SsoDefaultRolesService = require('./ssoDefaultRolesService');
const ErrorService = require('./errorService');
const handlePopulate = require('../utils/populate');
const handleSelect = require('../utils/select');
