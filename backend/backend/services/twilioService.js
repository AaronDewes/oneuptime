/**
 *
 * Copyright HackerBay, Inc.
 *
 */
const incidentSMSActionModel = require('../models/incidentSMSAction');
const twilio = require('twilio');
const SmsSmtpService = require('./smsSmtpService');
const ErrorService = require('./errorService');
const Handlebars = require('handlebars');
const defaultSmsTemplates = require('../config/smsTemplate');
const GlobalConfigService = require('./globalConfigService');
const UserService = require('./userService');
const SmsCountService = require('./smsCountService');
const AlertService = require('./alertService');

const _this = {
    findByOne: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const twilioSettings = await SmsSmtpService.findOneBy(query);
            return twilioSettings;
        } catch (error) {
            ErrorService.log('SubscriberService.findByOne', error);
            throw error;
        }
    },

    getClient: (accountSid, authToken) => {
        if (!accountSid || !authToken) {
            const error = new Error('Twilio credentials not found.');
            error.code = 400;
            return error;
        }
        return twilio(accountSid, authToken);
    },

    getSettings: async () => {
        const document = await GlobalConfigService.findOneBy({
            name: 'twilio',
        });
        if (document && document.value) {
            return document.value;
        }

        const error = new Error('Twilio settings not found.');
        ErrorService.log('twillioService.getSettings', error);
        throw error;
    },

    sendResponseMessage: async function(to, body) {
        try {
            const creds = await _this.getSettings();

            const options = {
                body,
                from: creds.phone,
                to,
            };

            const twilioClient = _this.getClient(
                creds['account-sid'],
                creds['authentication-token']
            );

            if (creds['sms-enabled']) {
                const message = await twilioClient.messages.create(options);
                return message;
            } else {
                const error = new Error('SMS Not Enabled');
                error.code = 400;
                return error;
            }
        } catch (error) {
            ErrorService.log('twillioService.sendResponseMessage', error);
            throw error;
        }
    },
    sendIncidentCreatedMessage: async function(
        incidentTime,
        monitorName,
        number,
        incidentId,
        userId,
        name,
        incidentType,
        projectId
    ) {
        try {
            const options = {
                body: `Fyipe Alert: Monitor ${monitorName} is ${incidentType}. Please acknowledge or resolve this incident on Fyipe Dashboard.`,
                to: number,
            };

            const customTwilioSettings = await _this.findByOne({
                projectId,
                enabled: true,
            });

            if (customTwilioSettings) {
                options.from = customTwilioSettings.phoneNumber;
                const incidentSMSAction = new incidentSMSActionModel();
                incidentSMSAction.incidentId = incidentId;
                incidentSMSAction.userId = userId;
                incidentSMSAction.number = number;
                incidentSMSAction.name = name;
                await incidentSMSAction.save();

                const twilioClient = _this.getClient(
                    customTwilioSettings.accountSid,
                    customTwilioSettings.authToken
                );
                const message = await twilioClient.messages.create(options);
                return message;
            } else {
                const creds = await _this.getSettings();
                const twilioClient = _this.getClient(
                    creds['account-sid'],
                    creds['authentication-token']
                );

                if (!creds['sms-enabled']) {
                    const error = new Error('SMS Not Enabled');
                    error.code = 400;
                    return error;
                }
                const alertLimit = await AlertService.checkPhoneAlertsLimit(
                    projectId
                );
                if (alertLimit) {
                    options.from = creds.phone;
                    // create incidentSMSAction entry for matching sms from twilio.
                    const incidentSMSAction = new incidentSMSActionModel();
                    incidentSMSAction.incidentId = incidentId;
                    incidentSMSAction.userId = userId;
                    incidentSMSAction.number = number;
                    incidentSMSAction.name = name;
                    await incidentSMSAction.save();
                    const message = await twilioClient.messages.create(options);
                    return message;
                } else {
                    const error = new Error(
                        'Alerts limit reached for the day.'
                    );
                    error.code = 400;
                    return error;
                }
            }
        } catch (error) {
            ErrorService.log(
                'twillioService.sendIncidentCreatedMessage',
                error
            );
            throw error;
        }
    },

    sendIncidentCreatedMessageToSubscriber: async function(
        incidentTime,
        monitorName,
        number,
        smsTemplate,
        incident,
        projectName,
        projectId,
        componentName
    ) {
        try {
            let { template } = await _this.getTemplate(
                smsTemplate,
                'Subscriber Incident Created'
            );
            const data = {
                projectName,
                monitorName: monitorName,
                incidentTime: incidentTime,
                incidentType: incident.incidentType,
                componentName,
            };
            template = template(data);
            const customTwilioSettings = await _this.findByOne({
                projectId,
                enabled: true,
            });

            if (customTwilioSettings) {
                const options = {
                    body: template,
                    from: customTwilioSettings.phoneNumber,
                    to: number,
                };

                const twilioClient = _this.getClient(
                    customTwilioSettings.accountSid,
                    customTwilioSettings.authToken
                );
                const message = await twilioClient.messages.create(options);
                return message;
            } else {
                const creds = await _this.getSettings();
                if (!creds['sms-enabled']) {
                    const error = new Error('SMS Not Enabled');
                    error.code = 400;
                    return error;
                }
                const options = {
                    body: template,
                    from: creds.phone,
                    to: number,
                };
                const twilioClient = _this.getClient(
                    creds['account-sid'],
                    creds['authentication-token']
                );
                let alertLimit = true;

                alertLimit = await AlertService.checkPhoneAlertsLimit(
                    projectId
                );

                if (alertLimit) {
                    const message = await twilioClient.messages.create(options);
                    return message;
                } else {
                    const error = new Error(
                        'Alerts limit reached for the day.'
                    );
                    error.code = 400;
                    return error;
                }
            }
        } catch (error) {
            ErrorService.log(
                'twillioService.sendIncidentCreatedMessageToSubscriber',
                error
            );
            throw error;
        }
    },

    sendIncidentAcknowldegedMessageToSubscriber: async function(
        incidentTime,
        monitorName,
        number,
        smsTemplate,
        incident,
        projectName,
        projectId,
        componentName
    ) {
        try {
            const _this = this;
            let { template } = await _this.getTemplate(
                smsTemplate,
                'Subscriber Incident Acknowldeged'
            );
            const data = {
                projectName,
                monitorName: monitorName,
                incidentTime: incidentTime,
                incidentType: incident.incidentType,
                componentName,
            };
            template = template(data);
            const customTwilioSettings = await _this.findByOne({
                projectId,
                enabled: true,
            });

            if (customTwilioSettings) {
                const options = {
                    body: template,
                    from: customTwilioSettings.phoneNumber,
                    to: number,
                };
                const twilioClient = _this.getClient(
                    customTwilioSettings.accountSid,
                    customTwilioSettings.authToken
                );
                const message = await twilioClient.messages.create(options);
                return message;
            } else {
                const creds = await _this.getSettings();
                if (!creds['sms-enabled']) {
                    const error = new Error('SMS Not Enabled');
                    error.code = 400;
                    return error;
                }
                const options = {
                    body: template,
                    from: creds.phone,
                    to: number,
                };
                const twilioClient = _this.getClient(
                    creds['account-sid'],
                    creds['authentication-token']
                );
                let alertLimit = true;

                alertLimit = await AlertService.checkPhoneAlertsLimit(
                    projectId
                );

                if (alertLimit) {
                    const message = await twilioClient.messages.create(options);
                    return message;
                } else {
                    const error = new Error(
                        'Alerts limit reached for the day.'
                    );
                    error.code = 400;
                    return error;
                }
            }
        } catch (error) {
            ErrorService.log(
                'twillioService.sendIncidentAcknowldegedMessageToSubscriber',
                error
            );
            throw error;
        }
    },

    sendIncidentResolvedMessageToSubscriber: async function(
        incidentTime,
        monitorName,
        number,
        smsTemplate,
        incident,
        projectName,
        projectId,
        componentName
    ) {
        try {
            const _this = this;
            let { template } = await _this.getTemplate(
                smsTemplate,
                'Subscriber Incident Resolved'
            );
            const data = {
                projectName,
                monitorName: monitorName,
                incidentTime: incidentTime,
                incidentType: incident.incidentType,
                componentName,
            };
            template = template(data);
            const customTwilioSettings = await _this.findByOne({
                projectId,
                enabled: true,
            });
            if (customTwilioSettings) {
                const options = {
                    body: template,
                    from: customTwilioSettings.phoneNumber,
                    to: number,
                };

                const twilioClient = _this.getClient(
                    customTwilioSettings.accountSid,
                    customTwilioSettings.authToken
                );
                const message = await twilioClient.messages.create(options);
                return message;
            } else {
                const creds = await _this.getSettings();
                if (!creds['sms-enabled']) {
                    const error = new Error('SMS Not Enabled');
                    error.code = 400;
                    return error;
                }
                const options = {
                    body: template,
                    from: creds.phone,
                    to: number,
                };
                const twilioClient = _this.getClient(
                    creds['account-sid'],
                    creds['authentication-token']
                );
                let alertLimit = true;

                alertLimit = await AlertService.checkPhoneAlertsLimit(
                    projectId
                );

                if (alertLimit) {
                    const message = await twilioClient.messages.create(options);
                    return message;
                } else {
                    const error = new Error(
                        'Alerts limit reached for the day.'
                    );
                    error.code = 400;
                    return error;
                }
            }
        } catch (error) {
            ErrorService.log(
                'twillioService.sendIncidentResolvedMessageToSubscriber',
                error
            );
            throw error;
        }
    },

    test: async function(data) {
        try {
            const options = {
                body: 'This is a test SMS from Fyipe',
                from: data.phoneNumber,
                to: '+19173976235',
            };

            const twilioClient = _this.getClient(
                data.accountSid,
                data.authToken
            );

            const message = await twilioClient.messages.create(options);

            return message;
        } catch (error) {
            let err = Object.assign({}, error);
            if (
                (err && err.status) ||
                error.message === 'accountSid must start with AC'
            ) {
                err = new Error(error.message);
                err.code = 400;
            }
            ErrorService.log('twillioService.test', err);
            throw err;
        }
    },

    sendIncidentCreatedCall: async function(
        incidentTime,
        monitorName,
        number,
        accessToken,
        incidentId,
        projectId,
        redialCount,
        incidentType
    ) {
        try {
            const message =
                '<Say voice="alice">This is an alert from Fyipe. Your monitor ' +
                monitorName +
                ' is ' +
                incidentType +
                '. Please go to Fyipe Dashboard or Mobile app to acknowledge or resolve this incident.</Say>';
            const hangUp = '<Hangup />';
            const twiml = '<Response> ' + message + hangUp + '</Response>';
            const options = {
                twiml: twiml,
                to: number,
            };
            const customTwilioSettings = await _this.findByOne({
                projectId,
                enabled: true,
            });

            if (customTwilioSettings) {
                options.from = customTwilioSettings.phoneNumber;
                const twilioClient = _this.getClient(
                    customTwilioSettings.accountSid,
                    customTwilioSettings.authToken
                );
                const call = await twilioClient.calls.create(options);
                return call;
            } else {
                const creds = await _this.getSettings();
                const twilioClient = _this.getClient(
                    creds['account-sid'],
                    creds['authentication-token']
                );
                if (!creds['call-enabled']) {
                    const error = new Error('Call Not Enabled');
                    error.code = 400;
                    return error;
                }

                const alertLimit = await AlertService.checkPhoneAlertsLimit(
                    projectId
                );
                if (alertLimit) {
                    options.from = creds.phone;
                    if (twilioClient) {
                        const call = await twilioClient.calls.create(options);
                        return call;
                    }
                } else {
                    const error = new Error(
                        'Alerts limit reached for the day.'
                    );
                    error.code = 400;
                    return error;
                }
            }
        } catch (error) {
            ErrorService.log('twillioService.sendIncidentCreatedCall', error);
            throw error;
        }
    },

    getTemplate: async function(smsTemplate, smsTemplateType) {
        const defaultTemplate = defaultSmsTemplates.filter(
            template => template.smsType === smsTemplateType
        )[0];
        let smsContent = defaultTemplate.body;
        if (
            smsTemplate != null &&
            smsTemplate != undefined &&
            smsTemplate.body
        ) {
            smsContent = smsTemplate.body;
        }
        const template = await Handlebars.compile(smsContent);
        return { template };
    },
    sendVerificationSMS: async function(
        to,
        userId,
        projectId,
        validationResult
    ) {
        try {
            const customTwilioSettings = await _this.findByOne({
                projectId,
                enabled: true,
            });
            if (!to.startsWith('+')) {
                to = '+' + to;
            }
            const alertPhoneVerificationCode = process.env
                .TWILIO_SMS_VERIFICATION_CODE
                ? process.env.TWILIO_SMS_VERIFICATION_CODE
                : Math.random()
                      .toString(10)
                      .substr(2, 6);
            if (customTwilioSettings) {
                const template = `Your verification code: ${alertPhoneVerificationCode}`;
                const options = {
                    body: template,
                    from: customTwilioSettings.phoneNumber,
                    to,
                };

                const twilioClient = _this.getClient(
                    customTwilioSettings.accountSid,
                    customTwilioSettings.authToken
                );
                await twilioClient.messages.create(options);
                await UserService.updateOneBy(
                    { _id: userId },
                    {
                        tempAlertPhoneNumber: to,
                        alertPhoneVerificationCode,
                        alertPhoneVerificationCodeRequestTime: Date.now(),
                    }
                );
                return {};
            } else {
                if (!validationResult.validateResend) {
                    throw new Error(validationResult.problem);
                }
                const creds = await _this.getSettings();
                const twilioClient = _this.getClient(
                    creds['account-sid'],
                    creds['authentication-token']
                );

                const alertLimit = await AlertService.checkPhoneAlertsLimit(
                    projectId
                );
                if (alertLimit) {
                    if (!creds['sms-enabled']) {
                        const error = new Error('SMS Not Enabled');
                        error.code = 400;
                        throw error;
                    }
                    const template = `Your verification code: ${alertPhoneVerificationCode}`;
                    const options = {
                        body: template,
                        from: creds.phone,
                        to,
                    };
                    await twilioClient.messages.create(options);
                    await SmsCountService.create(userId, to, projectId);
                    await UserService.updateOneBy(
                        { _id: userId },
                        {
                            tempAlertPhoneNumber: to,
                            alertPhoneVerificationCode,
                            alertPhoneVerificationCodeRequestTime: Date.now(),
                        }
                    );
                    return {};
                } else {
                    const error = new Error(
                        'Alerts limit reached for the day.'
                    );
                    error.code = 400;
                    throw error;
                }
            }
        } catch (error) {
            ErrorService.log('twillioService.sendVerificationSMS', error);
            throw error;
        }
    },
};

module.exports = _this;
