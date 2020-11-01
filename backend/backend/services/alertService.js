/**
 *
 * Copyright HackerBay, Inc.
 *
 */

module.exports = {
    hasEnoughBalance: async function(
        projectId,
        alertPhoneNumber,
        userId,
        alertType
    ) {
        const project = await ProjectService.findOneBy({ _id: projectId });
        const balance = project.balance;
        const countryType = getCountryType(alertPhoneNumber);
        const alertChargeAmount = getAlertChargeAmount(alertType, countryType);
        if (balance > alertChargeAmount.minimumBalance) {
            await PaymentService.chargeAlert(
                userId,
                projectId,
                alertChargeAmount.price
            );
            return true;
        } else {
            return false;
        }
    },

    doesPhoneNumberComplyWithHighRiskConfig: async function(
        projectId,
        alertPhoneNumber
    ) {
        const project = await ProjectService.findOneBy({ _id: projectId });
        const alertOptions = project.alertOptions;
        let countryType = getCountryType(alertPhoneNumber);
        if (countryType === 'us') {
            countryType = 'billingUS';
        } else if (countryType === 'non-us') {
            countryType = 'billingNonUSCountries';
        } else if (countryType === 'risk') {
            countryType = 'billingRiskCountries';
        }
        if (alertOptions[countryType]) {
            return true;
        }
        return false;
    },
    findBy: async function({ query, skip, limit, sort }) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 10;

            if (!sort) sort = { createdAt: -1 };

            if (typeof skip === 'string') {
                skip = parseInt(skip);
            }

            if (typeof limit === 'string') {
                limit = parseInt(limit);
            }

            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            const alerts = await AlertModel.find(query)
                .sort(sort)
                .limit(limit)
                .skip(skip)
                .populate('userId', 'name')
                .populate('monitorId', 'name')
                .populate('projectId', 'name');
            return alerts;
        } catch (error) {
            ErrorService.log('alertService.findBy`  ', error);
            throw error;
        }
    },

    create: async function({
        projectId,
        monitorId,
        alertVia,
        userId,
        incidentId,
        onCallScheduleStatus,
        schedule,
        escalation,
        alertStatus,
        error,
        errorMessage,
    }) {
        try {
            const alert = new AlertModel();
            alert.projectId = projectId;
            alert.onCallScheduleStatus = onCallScheduleStatus;
            alert.schedule = schedule;
            alert.escalation = escalation;
            alert.monitorId = monitorId;
            alert.alertVia = alertVia;
            alert.userId = userId;
            alert.incidentId = incidentId;
            alert.alertStatus = alertStatus;

            if (error) {
                alert.error = error;
                alert.errorMessage = errorMessage;
            }

            const savedAlert = await alert.save();

            return savedAlert;
        } catch (error) {
            ErrorService.log('alertService.create', error);
            throw error;
        }
    },

    countBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            const count = await AlertModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('alertService.countBy', error);
            throw error;
        }
    },

    updateOneBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            const updatedAlert = await AlertModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                {
                    new: true,
                }
            );
            return updatedAlert;
        } catch (error) {
            ErrorService.log('AlertService.updateOneBy', error);
            throw error;
        }
    },

    updateBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            let updatedData = await AlertModel.updateMany(query, {
                $set: data,
            });
            updatedData = await this.findBy(query);
            return updatedData;
        } catch (error) {
            ErrorService.log('alertService.updateMany', error);
            throw error;
        }
    },

    deleteBy: async function(query, userId) {
        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            const alerts = await AlertModel.findOneAndUpdate(
                query,
                {
                    $set: {
                        deleted: true,
                        deletedAt: Date.now(),
                        deletedById: userId,
                    },
                },
                {
                    new: true,
                }
            );
            return alerts;
        } catch (error) {
            ErrorService.log('alertService.deleteBy', error);
            throw error;
        }
    },

    sendCreatedIncident: async function(incident) {
        try {
            if (incident) {
                const _this = this;

                const monitorId = incident.monitorId._id
                    ? incident.monitorId._id
                    : incident.monitorId;

                const schedules = await ScheduleService.findBy({
                    monitorIds: monitorId,
                });

                for (const schedule of schedules) {
                    _this.sendAlertsToTeamMembersInSchedule({
                        schedule,
                        incident,
                    });
                }
            }
        } catch (error) {
            ErrorService.log('alertService.sendCreatedIncident', error);
            throw error;
        }
    },

    sendAlertsToTeamMembersInSchedule: async function({ schedule, incident }) {
        const _this = this;
        const monitorId = incident.monitorId._id
            ? incident.monitorId._id
            : incident.monitorId;
        const projectId = incident.projectId._id
            ? incident.projectId._id
            : incident.projectId;
        const monitor = await MonitorService.findOneBy({ _id: monitorId });

        if (!schedule || !incident) {
            return;
        }

        //scheudle has no escalations. Skip.
        if (!schedule.escalationIds || schedule.escalationIds.length === 0) {
            return;
        }

        const callScheduleStatuses = await OnCallScheduleStatusService.findBy({
            query: { incident: incident._id, schedule: schedule },
        });
        let onCallScheduleStatus = null;
        let escalationId = null;
        let currentEscalationStatus = null;

        if (callScheduleStatuses.length === 0) {
            //start with first ecalation policy, and then escalationPolicy will take care of others in escalation policy.
            escalationId = schedule.escalationIds[0];

            if (escalationId && escalationId._id) {
                escalationId = escalationId._id;
            }

            currentEscalationStatus = {
                escalation: escalationId,
                callRemindersSent: 0,
                emailRemindersSent: 0,
                smsRemindersSent: 0,
            };

            //create new onCallScheduleStatus
            onCallScheduleStatus = await OnCallScheduleStatusService.create({
                project: projectId,
                incident: incident._id,
                activeEscalation: escalationId,
                schedule: schedule._id,
                incidentAcknowledged: false,
                escalations: [currentEscalationStatus],
            });
        } else {
            onCallScheduleStatus = callScheduleStatuses[0];
            currentEscalationStatus =
                onCallScheduleStatus.escalations[
                    onCallScheduleStatus.escalations.length - 1
                ];
            escalationId = currentEscalationStatus.escalation._id;
        }

        let shouldSendSMSReminder = false;
        let shouldSendCallReminder = false;
        let shouldSendEmailReminder = false;

        //No escalation found in the database skip.
        const escalation = await EscalationService.findOneBy({
            _id: escalationId,
        });

        if (!escalation) {
            return;
        }

        shouldSendSMSReminder =
            escalation.smsReminders > currentEscalationStatus.smsRemindersSent;
        shouldSendCallReminder =
            escalation.callReminders >
            currentEscalationStatus.callRemindersSent;
        shouldSendEmailReminder =
            escalation.emailReminders >
            currentEscalationStatus.emailRemindersSent;

        if (
            !shouldSendSMSReminder &&
            !shouldSendEmailReminder &&
            !shouldSendCallReminder
        ) {
            _this.escalate({ schedule, incident });
        } else {
            _this.sendAlertsToTeamMembersInEscalationPolicy({
                escalation,
                monitor,
                incident,
                schedule,
                onCallScheduleStatus,
            });
        }
    },

    escalate: async function({ schedule, incident }) {
        const _this = this;
        const callScheduleStatuses = await OnCallScheduleStatusService.findBy({
            query: { incident: incident._id, schedule: schedule._id },
        });
        const monitorId = incident.monitorId._id
            ? incident.monitorId._id
            : incident.monitorId;
        const monitor = await MonitorService.findOneBy({ _id: monitorId });

        if (callScheduleStatuses.length === 0) {
            return;
        }

        const callScheduleStatus = callScheduleStatuses[0];

        const activeEscalation = callScheduleStatus.activeEscalation;

        if (!schedule.escalationIds || schedule.escalationIds.length === 0) {
            return;
        }

        let nextEscalationPolicy = null;

        //find next escalationPolicy.
        let found = false;
        for (let escalationId of schedule.escalationIds) {
            if (found) {
                nextEscalationPolicy = escalationId;
                break;
            }

            if (escalationId && escalationId._id) {
                escalationId = escalationId._id;
            }

            if (activeEscalation._id.toString() === escalationId.toString()) {
                found = true;
            }
        }

        if (
            !nextEscalationPolicy ||
            nextEscalationPolicy._id.toString() !==
                activeEscalation._id.toString()
        ) {
            callScheduleStatus.alertedEveryone = true;
            await callScheduleStatus.save();
            return; //can't escalate anymore.
        }

        callScheduleStatus.escalations.push({
            escalation: nextEscalationPolicy,
            callRemindersSent: 0,
            emailRemindersSent: 0,
            smsRemindersSent: 0,
        });
        callScheduleStatus.activeEscalation = nextEscalationPolicy;

        await callScheduleStatus.save();

        _this.sendAlertsToTeamMembersInEscalationPolicy({
            escalation: nextEscalationPolicy,
            monitor,
            incident,
            schedule,
            onCallScheduleStatus: callScheduleStatus,
        });
    },

    sendAlertsToTeamMembersInEscalationPolicy: async function({
        escalation,
        incident,
        monitor,
        schedule,
        onCallScheduleStatus,
    }) {
        const _this = this;
        const monitorId = monitor._id;

        const projectId = incident.projectId._id
            ? incident.projectId._id
            : incident.projectId;
        const project = await ProjectService.findOneBy({ _id: projectId });

        escalation = await EscalationService.findOneBy({ _id: escalation._id });

        const activeTeam = escalation.activeTeam;
        const currentEscalationStatus =
            onCallScheduleStatus.escalations[
                onCallScheduleStatus.escalations.length - 1
            ];

        const shouldSendSMSReminder =
            escalation.smsReminders > currentEscalationStatus.smsRemindersSent;
        const shouldSendCallReminder =
            escalation.callReminders >
            currentEscalationStatus.callRemindersSent;
        const shouldSendEmailReminder =
            escalation.emailReminders >
            currentEscalationStatus.emailRemindersSent;

        if (shouldSendCallReminder) {
            currentEscalationStatus.callRemindersSent++;
        }

        if (shouldSendEmailReminder) {
            currentEscalationStatus.emailRemindersSent++;
        }

        if (shouldSendSMSReminder) {
            currentEscalationStatus.smsRemindersSent++;
        }

        if (!activeTeam.teamMembers || activeTeam.teamMembers.length === 0) {
            return;
        }

        onCallScheduleStatus.escalations[
            onCallScheduleStatus.escalations.length - 1
        ] = currentEscalationStatus;
        await onCallScheduleStatus.save();

        for (const teamMember of activeTeam.teamMembers) {
            const isOnDuty = await _this.isOnDuty(
                teamMember.timezone,
                teamMember.startTime,
                teamMember.endTime
            );

            if (!isOnDuty) {
                if (escalation.call && shouldSendCallReminder) {
                    await _this.create({
                        projectId: incident.projectId,
                        monitorId,
                        alertVia: AlertType.Call,
                        userId: user._id,
                        incidentId: incident._id,
                        schedule: schedule,
                        escalation: escalation,
                        onCallScheduleStatus: onCallScheduleStatus,
                        alertStatus: 'Not on Duty',
                    });
                }
                if (escalation.email && shouldSendEmailReminder) {
                    await _this.create({
                        projectId: incident.projectId,
                        monitorId,
                        alertVia: AlertType.Email,
                        userId: user._id,
                        incidentId: incident._id,
                        schedule: schedule,
                        escalation: escalation,
                        onCallScheduleStatus: onCallScheduleStatus,
                        alertStatus: 'Not on Duty',
                    });
                }
                if (escalation.sms && shouldSendSMSReminder) {
                    await _this.create({
                        projectId: incident.projectId,
                        monitorId,
                        alertVia: AlertType.SMS,
                        userId: user._id,
                        incidentId: incident._id,
                        schedule: schedule,
                        escalation: escalation,
                        onCallScheduleStatus: onCallScheduleStatus,
                        alertStatus: 'Not on Duty',
                    });
                }

                continue;
            }

            const user = await UserService.findOneBy({
                _id: teamMember.userId,
            });

            if (!user) {
                continue;
            }
            /**
             *  sendSMSAlert & sendCallAlert should not run in parallel
             *  otherwise we will have a wrong project balance in the end.
             *
             */

            if (escalation.sms && shouldSendSMSReminder) {
                await _this.sendSMSAlert({
                    incident,
                    user,
                    project,
                    monitor,
                    schedule,
                    escalation,
                    onCallScheduleStatus,
                });
            }

            if (escalation.email && shouldSendEmailReminder) {
                _this.sendEmailAlert({
                    incident,
                    user,
                    project,
                    monitor,
                    schedule,
                    escalation,
                    onCallScheduleStatus,
                });
            }

            if (escalation.call && shouldSendCallReminder) {
                await _this.sendCallAlert({
                    incident,
                    user,
                    project,
                    monitor,
                    schedule,
                    escalation,
                    onCallScheduleStatus,
                });
            }
        }
    },

    sendEmailAlert: async function({
        incident,
        user,
        project,
        monitor,
        schedule,
        escalation,
        onCallScheduleStatus,
    }) {
        const _this = this;

        let date = new Date();
        const monitorId = monitor._id;
        const accessToken = UserService.getAccessToken({
            userId: user._id,
            expiresIn: 12 * 60 * 60 * 1000,
        });
        const queryString = `projectId=${incident.projectId}&userId=${user._id}&accessToken=${accessToken}`;
        const ack_url = `${global.apiHost}/incident/${incident.projectId}/acknowledge/${incident._id}?${queryString}`;
        const resolve_url = `${global.apiHost}/incident/${incident.projectId}/resolve/${incident._id}?${queryString}`;
        const firstName = user.name;
        const projectId = incident.projectId;

        if (user.timezone && TimeZoneNames.indexOf(user.timezone) > -1) {
            date = moment(date)
                .tz(user.timezone)
                .format();
        }

        try {
            const hasGlobalSmtpSettings = await GlobalConfigService.findOneBy({
                name: 'smtp',
            });
            const areEmailAlertsEnabledInGlobalSettings =
                hasGlobalSmtpSettings &&
                hasGlobalSmtpSettings.value &&
                hasGlobalSmtpSettings.value['email-enabled']
                    ? true
                    : false;
            const hasCustomSmtpSettings = await MailService.hasCustomSmtpSettings(
                projectId
            );
            if (
                !areEmailAlertsEnabledInGlobalSettings &&
                !hasCustomSmtpSettings
            ) {
                return await _this.create({
                    projectId: incident.projectId,
                    monitorId,
                    schedule: schedule._id,
                    escalation: escalation._id,
                    onCallScheduleStatus: onCallScheduleStatus._id,
                    alertVia: AlertType.Email,
                    userId: user._id,
                    incidentId: incident._id,
                    alertStatus: null,
                    error: true,
                    errorMessage:
                        !hasGlobalSmtpSettings && !hasCustomSmtpSettings
                            ? 'SMTP Settings not found on Admin Dashboard'
                            : hasGlobalSmtpSettings &&
                              !areEmailAlertsEnabledInGlobalSettings
                            ? 'Alert Disabled on Admin Dashboard'
                            : 'Error.',
                });
            }
            await MailService.sendIncidentCreatedMail({
                incidentTime: date,
                monitorName: monitor.name,
                email: user.email,
                userId: user._id,
                firstName: firstName.split(' ')[0],
                projectId: incident.projectId,
                acknowledgeUrl: ack_url,
                resolveUrl: resolve_url,
                accessToken,
                incidentType: incident.incidentType,
                projectName: project.name,
            });
            return await _this.create({
                projectId: incident.projectId,
                monitorId,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                alertVia: AlertType.Email,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: 'Success',
            });
        } catch (e) {
            return await _this.create({
                projectId: incident.projectId,
                monitorId,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                alertVia: AlertType.Email,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: 'Cannot Send',
            });
        }
    },

    sendCallAlert: async function({
        incident,
        user,
        project,
        monitor,
        schedule,
        escalation,
        onCallScheduleStatus,
    }) {
        const _this = this;
        let alert, balanceStatus;
        const date = new Date();
        const monitorId = monitor._id;
        const accessToken = UserService.getAccessToken({
            userId: user._id,
            expiresIn: 12 * 60 * 60 * 1000,
        });
        if (!user.alertPhoneNumber) {
            return await _this.create({
                projectId: incident.projectId,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                monitorId,
                alertVia: AlertType.Call,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: null,
                error: true,
                errorMessage: 'No phone number',
            });
        }

        const hasGlobalTwilioSettings = await GlobalConfigService.findOneBy({
            name: 'twilio',
        });
        const areAlertsEnabledGlobally =
            hasGlobalTwilioSettings &&
            hasGlobalTwilioSettings.value &&
            hasGlobalTwilioSettings.value['call-enabled']
                ? true
                : false;
        const hasCustomTwilioSettings = await TwilioService.hasCustomSettings(
            incident.projectId
        );

        if (
            !hasCustomTwilioSettings &&
            ((IS_SAAS_SERVICE &&
                (!project.alertEnable || !areAlertsEnabledGlobally)) ||
                (!IS_SAAS_SERVICE && !areAlertsEnabledGlobally))
        ) {
            return await _this.create({
                projectId: incident.projectId,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                monitorId,
                alertVia: AlertType.Call,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: null,
                error: true,
                errorMessage: !hasGlobalTwilioSettings
                    ? 'Twilio Settings not found on Admin Dashboard'
                    : !areAlertsEnabledGlobally
                    ? 'Alert Disabled on Admin Dashboard'
                    : IS_SAAS_SERVICE && !project.alertEnable
                    ? 'Alert Disabled for this project'
                    : 'Error',
            });
        }

        if (IS_SAAS_SERVICE && !hasCustomTwilioSettings) {
            const doesPhoneNumberComplyWithHighRiskConfig = await _this.doesPhoneNumberComplyWithHighRiskConfig(
                incident.projectId,
                user.alertPhoneNumber
            );
            if (!doesPhoneNumberComplyWithHighRiskConfig) {
                const countryType = getCountryType(user.alertPhoneNumber);
                return await _this.create({
                    projectId: incident.projectId,
                    monitorId,
                    schedule: schedule._id,
                    escalation: escalation._id,
                    onCallScheduleStatus: onCallScheduleStatus._id,
                    alertVia: AlertType.Call,
                    userId: user._id,
                    incidentId: incident._id,
                    alertStatus: null,
                    error: true,
                    errorMessage:
                        countryType === 'us'
                            ? 'Calls for numbers inside US not enabled for this project'
                            : countryType === 'non-us'
                            ? 'Calls for numbers outside US not enabled for this project'
                            : 'Calls to High Risk country not enabled for this project',
                });
            }
            const hasEnoughBalance = await _this.hasEnoughBalance(
                project._id,
                user.alertPhoneNumber,
                user._id,
                AlertType.Call
            );
            if (!hasEnoughBalance) {
                return await _this.create({
                    projectId: incident.projectId,
                    monitorId,
                    schedule: schedule._id,
                    escalation: escalation._id,
                    onCallScheduleStatus: onCallScheduleStatus._id,
                    alertVia: AlertType.Call,
                    userId: user._id,
                    incidentId: incident._id,
                    alertStatus: null,
                    error: true,
                    errorMessage: 'Low Balance',
                });
            }
        }
        const alertStatus = await TwilioService.sendIncidentCreatedCall(
            date,
            monitor.name,
            user.alertPhoneNumber,
            accessToken,
            incident._id,
            incident.projectId,
            incident.incidentType
        );
        if (alertStatus && alertStatus.code && alertStatus.code === 400) {
            return await _this.create({
                projectId: project._id,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                monitorId,
                alertVia: AlertType.Call,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: null,
                error: true,
                errorMessage: 'Error',
            });
        } else if (alertStatus) {
            alert = await _this.create({
                projectId: project._id,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                monitorId,
                alertVia: AlertType.Call,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: 'Success',
            });
            if (IS_SAAS_SERVICE && !hasCustomTwilioSettings) {
                balanceStatus = await _this.getBalanceStatus(
                    project._id,
                    user.alertPhoneNumber,
                    AlertType.Call
                );
                await AlertChargeService.create(
                    incident.projectId,
                    balanceStatus.chargeAmount,
                    balanceStatus.closingBalance,
                    alert._id,
                    monitorId,
                    incident._id,
                    user.alertPhoneNumber
                );
            }
        }
    },

    sendSMSAlert: async function({
        incident,
        user,
        project,
        monitor,
        schedule,
        escalation,
        onCallScheduleStatus,
    }) {
        const _this = this;
        let alert, balanceStatus;
        const projectId = project._id;
        const date = new Date();
        const monitorId = monitor._id;
        if (!user.alertPhoneNumber) {
            return await _this.create({
                projectId,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                monitorId,
                alertVia: AlertType.SMS,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: null,
                error: true,
                errorMessage: 'No phone number',
            });
        }

        const hasGlobalTwilioSettings = await GlobalConfigService.findOneBy({
            name: 'twilio',
        });
        const areAlertsEnabledGlobally =
            hasGlobalTwilioSettings &&
            hasGlobalTwilioSettings.value &&
            hasGlobalTwilioSettings.value['sms-enabled']
                ? true
                : false;
        const hasCustomTwilioSettings = await TwilioService.hasCustomSettings(
            projectId
        );

        if (
            !hasCustomTwilioSettings &&
            ((IS_SAAS_SERVICE &&
                (!project.alertEnable || !areAlertsEnabledGlobally)) ||
                (!IS_SAAS_SERVICE && !areAlertsEnabledGlobally))
        ) {
            return await _this.create({
                projectId: incident.projectId,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                monitorId,
                alertVia: AlertType.SMS,
                userId: user._id,
                incidentId: incident._id,
                alertStatus: null,
                error: true,
                errorMessage: !hasGlobalTwilioSettings
                    ? 'Twilio Settings not found on Admin Dashboard'
                    : !areAlertsEnabledGlobally
                    ? 'Alert Disabled on Admin Dashboard'
                    : IS_SAAS_SERVICE && !project.alertEnable
                    ? 'Alert Disabled for this project'
                    : 'Error',
            });
        }

        if (IS_SAAS_SERVICE && !hasCustomTwilioSettings) {
            const doesPhoneNumberComplyWithHighRiskConfig = await _this.doesPhoneNumberComplyWithHighRiskConfig(
                incident.projectId,
                user.alertPhoneNumber
            );
            if (!doesPhoneNumberComplyWithHighRiskConfig) {
                const countryType = getCountryType(user.alertPhoneNumber);
                return await _this.create({
                    projectId: incident.projectId,
                    monitorId,
                    schedule: schedule._id,
                    escalation: escalation._id,
                    onCallScheduleStatus: onCallScheduleStatus._id,
                    alertVia: AlertType.SMS,
                    userId: user._id,
                    incidentId: incident._id,
                    alertStatus: null,
                    error: true,
                    errorMessage:
                        countryType === 'us'
                            ? 'SMS for numbers inside US not enabled for this project'
                            : countryType === 'non-us'
                            ? 'SMS for numbers outside US not enabled for this project'
                            : 'SMS to High Risk country not enabled for this project',
                });
            }
            const hasEnoughBalance = await _this.hasEnoughBalance(
                incident.projectId,
                user.alertPhoneNumber,
                user._id,
                AlertType.SMS
            );
            if (!hasEnoughBalance) {
                return await _this.create({
                    projectId: incident.projectId,
                    monitorId,
                    schedule: schedule._id,
                    escalation: escalation._id,
                    onCallScheduleStatus: onCallScheduleStatus._id,
                    alertVia: AlertType.SMS,
                    userId: user._id,
                    incidentId: incident._id,
                    alertStatus: null,
                    error: true,
                    errorMessage: 'Low Balance',
                });
            }
        }

        let alertStatus = await TwilioService.sendIncidentCreatedMessage(
            date,
            monitor.name,
            user.alertPhoneNumber,
            incident._id,
            user._id,
            user.name,
            incident.incidentType,
            projectId
        );

        if (alertStatus && alertStatus.code && alertStatus.code === 400) {
            await _this.create({
                projectId: incident.projectId,
                monitorId,
                alertVia: AlertType.SMS,
                userId: user._id,
                incidentId: incident._id,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                alertStatus: null,
                error: true,
                errorMessage: alertStatus.message,
            });
        } else if (alertStatus) {
            alertStatus = 'Success';
            alert = await _this.create({
                projectId: incident.projectId,
                schedule: schedule._id,
                escalation: escalation._id,
                onCallScheduleStatus: onCallScheduleStatus._id,
                monitorId,
                alertVia: AlertType.SMS,
                userId: user._id,
                incidentId: incident._id,
                alertStatus,
            });
            if (IS_SAAS_SERVICE && !hasCustomTwilioSettings) {
                balanceStatus = await _this.getBalanceStatus(
                    incident.projectId,
                    user.alertPhoneNumber,
                    AlertType.SMS
                );
                await AlertChargeService.create(
                    incident.projectId,
                    balanceStatus.chargeAmount,
                    balanceStatus.closingBalance,
                    alert._id,
                    monitorId,
                    incident._id,
                    user.alertPhoneNumber
                );
            }
        }
    },

    sendCreatedIncidentToSubscribers: async function(incident, component) {
        try {
            const _this = this;
            if (incident) {
                const monitorId = incident.monitorId._id
                    ? incident.monitorId._id
                    : incident.monitorId;
                const subscribers = await SubscriberService.findBy({
                    monitorId: monitorId,
                });
                subscribers.forEach(async subscriber => {
                    if (subscriber.statusPageId) {
                        const enabledStatusPage = await StatusPageService.findOneBy(
                            {
                                _id: subscriber.statusPageId,
                                isSubscriberEnabled: true,
                            }
                        );
                        if (enabledStatusPage) {
                            await _this.sendSubscriberAlert(
                                subscriber,
                                incident,
                                'Subscriber Incident Created',
                                enabledStatusPage
                            );
                        }
                    } else {
                        await _this.sendSubscriberAlert(
                            subscriber,
                            incident,
                            null,
                            null,
                            component
                        );
                    }
                });
            }
        } catch (error) {
            ErrorService.log(
                'alertService.sendCreatedIncidentToSubscribers',
                error
            );
            throw error;
        }
    },

    sendAcknowledgedIncidentToSubscribers: async function(incident) {
        try {
            const _this = this;
            if (incident) {
                const monitorId = incident.monitorId._id
                    ? incident.monitorId._id
                    : incident.monitorId;
                const subscribers = await SubscriberService.findBy({
                    monitorId: monitorId,
                });
                subscribers.forEach(async subscriber => {
                    if (subscriber.statusPageId) {
                        const enabledStatusPage = await StatusPageService.findOneBy(
                            {
                                _id: subscriber.statusPageId,
                                isSubscriberEnabled: true,
                            }
                        );
                        if (enabledStatusPage) {
                            await _this.sendSubscriberAlert(
                                subscriber,
                                incident,
                                'Subscriber Incident Acknowldeged',
                                enabledStatusPage
                            );
                        }
                    } else {
                        await _this.sendSubscriberAlert(
                            subscriber,
                            incident,
                            'Subscriber Incident Acknowldeged'
                        );
                    }
                });
            }
        } catch (error) {
            ErrorService.log(
                'alertService.sendAcknowledgedIncidentToSubscribers',
                error
            );
            throw error;
        }
    },

    sendResolvedIncidentToSubscribers: async function(incident) {
        try {
            const _this = this;
            if (incident) {
                const monitorId = incident.monitorId._id
                    ? incident.monitorId._id
                    : incident.monitorId;
                const subscribers = await SubscriberService.findBy({
                    monitorId: monitorId,
                });
                subscribers.forEach(async subscriber => {
                    if (subscriber.statusPageId) {
                        const enabledStatusPage = await StatusPageService.findOneBy(
                            {
                                _id: subscriber.statusPageId,
                                isSubscriberEnabled: true,
                            }
                        );
                        if (enabledStatusPage) {
                            await _this.sendSubscriberAlert(
                                subscriber,
                                incident,
                                'Subscriber Incident Resolved',
                                enabledStatusPage
                            );
                        }
                    } else {
                        await _this.sendSubscriberAlert(
                            subscriber,
                            incident,
                            'Subscriber Incident Resolved'
                        );
                    }
                });
            }
        } catch (error) {
            ErrorService.log(
                'alertService.sendResolvedIncidentToSubscribers',
                error
            );
            throw error;
        }
    },

    sendSubscriberAlert: async function(
        subscriber,
        incident,
        templateType = 'Subscriber Incident Created',
        statusPage,
        // eslint-disable-next-line no-unused-vars
        component
    ) {
        try {
            const _this = this;
            const date = new Date();
            const project = await ProjectService.findOneBy({
                _id: incident.projectId,
            });
            // get thee monitor
            const monitor = await MonitorService.findOneBy({
                _id: incident.monitorId._id
                    ? incident.monitorId._id
                    : incident.monitorId,
            });
            // get the component
            const component = await ComponentService.findOneBy({
                _id:
                    monitor.componentId && monitor.componentId._id
                        ? monitor.componentId._id
                        : monitor.componentId,
            });

            let statusPageUrl;
            if (statusPage) {
                statusPageUrl = `${global.statusHost}/status-page/${statusPage._id}`;
                if (statusPage.domains && statusPage.domains.length > 0) {
                    const domains = statusPage.domains.filter(domainData => {
                        if (domainData.domainVerificationToken.verified) {
                            return true;
                        }
                        return false;
                    });

                    if (domains.length > 0) {
                        statusPageUrl = `${domains[0].domain}/status-page/${statusPage._id}`;
                    }
                }
            }

            if (subscriber.alertVia == AlertType.Email) {
                const hasGlobalSmtpSettings = await GlobalConfigService.findOneBy(
                    {
                        name: 'smtp',
                    }
                );
                const areEmailAlertsEnabledInGlobalSettings =
                    hasGlobalSmtpSettings &&
                    hasGlobalSmtpSettings.value &&
                    hasGlobalSmtpSettings.value['email-enabled']
                        ? true
                        : false;
                const hasCustomSmtpSettings = await MailService.hasCustomSmtpSettings(
                    incident.projectId
                );
                if (
                    !areEmailAlertsEnabledInGlobalSettings &&
                    !hasCustomSmtpSettings
                ) {
                    return await SubscriberAlertService.create({
                        projectId: incident.projectId,
                        incidentId: incident._id,
                        subscriberId: subscriber._id,
                        alertVia: AlertType.Email,
                        eventType:
                            templateType === 'Subscriber Incident Acknowldeged'
                                ? 'acknowledged'
                                : templateType ===
                                  'Subscriber Incident Resolved'
                                ? 'resolved'
                                : 'identified',
                        alertStatus: null,
                        error: true,
                        errorMessage:
                            !hasGlobalSmtpSettings && !hasCustomSmtpSettings
                                ? 'SMTP Settings not found on Admin Dashboard'
                                : hasGlobalSmtpSettings &&
                                  !areEmailAlertsEnabledInGlobalSettings
                                ? 'Alert Disabled on Admin Dashboard'
                                : 'Error',
                    });
                }
                const emailTemplate = await EmailTemplateService.findOneBy({
                    projectId: incident.projectId,
                    emailType: templateType,
                });
                const subscriberAlert = await SubscriberAlertService.create({
                    projectId: incident.projectId,
                    incidentId: incident._id,
                    subscriberId: subscriber._id,
                    alertVia: AlertType.Email,
                    alertStatus: 'Pending',
                    eventType:
                        templateType === 'Subscriber Incident Acknowldeged'
                            ? 'acknowledged'
                            : templateType === 'Subscriber Incident Resolved'
                            ? 'resolved'
                            : 'identified',
                });
                const alertId = subscriberAlert._id;
                const trackEmailAsViewedUrl = `${global.apiHost}/subscriberAlert/${incident.projectId}/${alertId}/viewed`;

                try {
                    if (templateType === 'Subscriber Incident Acknowldeged') {
                        if (statusPage) {
                            if (
                                project.sendAcknowledgedIncidentNotificationEmail
                            ) {
                                await MailService.sendIncidentAcknowledgedMailToSubscriber(
                                    date,
                                    subscriber.monitorName,
                                    subscriber.contactEmail,
                                    subscriber._id,
                                    subscriber.contactEmail,
                                    incident,
                                    project.name,
                                    emailTemplate,
                                    trackEmailAsViewedUrl,
                                    component.name,
                                    statusPageUrl
                                );
                            }
                        } else {
                            await MailService.sendIncidentAcknowledgedMailToSubscriber(
                                date,
                                subscriber.monitorName,
                                subscriber.contactEmail,
                                subscriber._id,
                                subscriber.contactEmail,
                                incident,
                                project.name,
                                emailTemplate,
                                trackEmailAsViewedUrl,
                                component.name,
                                statusPageUrl
                            );
                        }
                    } else if (
                        templateType === 'Subscriber Incident Resolved'
                    ) {
                        if (statusPage) {
                            if (project.sendResolvedIncidentNotificationEmail) {
                                await MailService.sendIncidentResolvedMailToSubscriber(
                                    date,
                                    subscriber.monitorName,
                                    subscriber.contactEmail,
                                    subscriber._id,
                                    subscriber.contactEmail,
                                    incident,
                                    project.name,
                                    emailTemplate,
                                    trackEmailAsViewedUrl,
                                    component.name,
                                    statusPageUrl
                                );
                            }
                        } else {
                            await MailService.sendIncidentResolvedMailToSubscriber(
                                date,
                                subscriber.monitorName,
                                subscriber.contactEmail,
                                subscriber._id,
                                subscriber.contactEmail,
                                incident,
                                project.name,
                                emailTemplate,
                                trackEmailAsViewedUrl,
                                component.name,
                                statusPageUrl
                            );
                        }
                    } else {
                        if (statusPage) {
                            if (project.sendCreatedIncidentNotificationEmail) {
                                await MailService.sendIncidentCreatedMailToSubscriber(
                                    date,
                                    subscriber.monitorName,
                                    subscriber.contactEmail,
                                    subscriber._id,
                                    subscriber.contactEmail,
                                    incident,
                                    project.name,
                                    emailTemplate,
                                    trackEmailAsViewedUrl,
                                    component.name,
                                    statusPageUrl
                                );
                            }
                        } else {
                            await MailService.sendIncidentCreatedMailToSubscriber(
                                date,
                                subscriber.monitorName,
                                subscriber.contactEmail,
                                subscriber._id,
                                subscriber.contactEmail,
                                incident,
                                project.name,
                                emailTemplate,
                                trackEmailAsViewedUrl,
                                component.name,
                                statusPageUrl
                            );
                        }
                    }
                    await SubscriberAlertService.updateOneBy(
                        { _id: alertId },
                        { alertStatus: 'Sent' }
                    );
                } catch (error) {
                    await SubscriberAlertService.updateOneBy(
                        { _id: alertId },
                        { alertStatus: null }
                    );
                    throw error;
                }
            } else if (subscriber.alertVia == AlertType.SMS) {
                const hasGlobalTwilioSettings = await GlobalConfigService.findOneBy(
                    {
                        name: 'twilio',
                    }
                );
                const areAlertsEnabledGlobally =
                    hasGlobalTwilioSettings &&
                    hasGlobalTwilioSettings.value &&
                    hasGlobalTwilioSettings.value['sms-enabled']
                        ? true
                        : false;

                const hasCustomTwilioSettings = await TwilioService.hasCustomSettings(
                    incident.projectId
                );
                if (
                    !hasCustomTwilioSettings &&
                    ((IS_SAAS_SERVICE &&
                        (!project.alertEnable || !areAlertsEnabledGlobally)) ||
                        (!IS_SAAS_SERVICE && !areAlertsEnabledGlobally))
                ) {
                    return await SubscriberAlertService.create({
                        projectId: incident.projectId,
                        incidentId: incident._id,
                        subscriberId: subscriber._id,
                        alertVia: AlertType.SMS,
                        alertStatus: null,
                        error: true,
                        errorMessage: !hasGlobalTwilioSettings
                            ? 'Twilio Settings not found on Admin Dashboard'
                            : !areAlertsEnabledGlobally
                            ? 'Alert Disabled on Admin Dashboard'
                            : IS_SAAS_SERVICE && !project.alertEnable
                            ? 'Alert Disabled for this project'
                            : 'Error',
                        eventType:
                            templateType === 'Subscriber Incident Acknowldeged'
                                ? 'acknowledged'
                                : templateType ===
                                  'Subscriber Incident Resolved'
                                ? 'resolved'
                                : 'identified',
                    });
                }
                const countryCode = await _this.mapCountryShortNameToCountryCode(
                    subscriber.countryCode
                );
                let contactPhone = subscriber.contactPhone;
                if (countryCode) {
                    contactPhone = countryCode + contactPhone;
                }

                if (IS_SAAS_SERVICE && !hasCustomTwilioSettings) {
                    const owner = project.users.filter(
                        user => user.role === 'Owner'
                    )[0];
                    const doesPhoneNumberComplyWithHighRiskConfig = await _this.doesPhoneNumberComplyWithHighRiskConfig(
                        incident.projectId,
                        contactPhone
                    );
                    if (!doesPhoneNumberComplyWithHighRiskConfig) {
                        const countryType = getCountryType(contactPhone);
                        return await SubscriberAlertService.create({
                            projectId: incident.projectId,
                            incidentId: incident._id,
                            subscriberId: subscriber._id,
                            alertVia: AlertType.SMS,
                            alertStatus: null,
                            error: true,
                            errorMessage:
                                countryType === 'us'
                                    ? 'SMS for numbers inside US not enabled for this project'
                                    : countryType === 'non-us'
                                    ? 'SMS for numbers outside US not enabled for this project'
                                    : 'SMS to High Risk country not enabled for this project',
                            eventType:
                                templateType ===
                                'Subscriber Incident Acknowldeged'
                                    ? 'acknowledged'
                                    : templateType ===
                                      'Subscriber Incident Resolved'
                                    ? 'resolved'
                                    : 'identified',
                        });
                    }
                    const hasEnoughBalance = await _this.hasEnoughBalance(
                        incident.projectId,
                        contactPhone,
                        owner.userId,
                        AlertType.SMS
                    );
                    if (!hasEnoughBalance) {
                        return await SubscriberAlertService.create({
                            projectId: incident.projectId,
                            incidentId: incident._id,
                            subscriberId: subscriber._id,
                            alertVia: AlertType.SMS,
                            alertStatus: null,
                            error: true,
                            errorMessage: 'Low Balance',
                            eventType:
                                templateType ===
                                'Subscriber Incident Acknowldeged'
                                    ? 'acknowledged'
                                    : templateType ===
                                      'Subscriber Incident Resolved'
                                    ? 'resolved'
                                    : 'identified',
                        });
                    }
                }

                let sendResult;
                const smsTemplate = await SmsTemplateService.findOneBy({
                    projectId: incident.projectId,
                    smsType: templateType,
                });
                const subscriberAlert = await SubscriberAlertService.create({
                    projectId: incident.projectId,
                    incidentId: incident._id,
                    subscriberId: subscriber._id,
                    alertVia: AlertType.SMS,
                    alertStatus: 'Pending',
                    eventType:
                        templateType === 'Subscriber Incident Acknowldeged'
                            ? 'acknowledged'
                            : templateType === 'Subscriber Incident Resolved'
                            ? 'resolved'
                            : 'identified',
                });
                const alertId = subscriberAlert._id;
                try {
                    if (templateType === 'Subscriber Incident Acknowldeged') {
                        if (statusPage) {
                            if (
                                project.sendAcknowledgedIncidentNotificationSms
                            ) {
                                sendResult = await TwilioService.sendIncidentAcknowldegedMessageToSubscriber(
                                    date,
                                    subscriber.monitorName,
                                    contactPhone,
                                    smsTemplate,
                                    incident,
                                    project.name,
                                    incident.projectId,
                                    component.name,
                                    statusPageUrl
                                );
                            }
                        } else {
                            sendResult = await TwilioService.sendIncidentAcknowldegedMessageToSubscriber(
                                date,
                                subscriber.monitorName,
                                contactPhone,
                                smsTemplate,
                                incident,
                                project.name,
                                incident.projectId,
                                component.name,
                                statusPageUrl
                            );
                        }
                    } else if (
                        templateType === 'Subscriber Incident Resolved'
                    ) {
                        if (statusPage) {
                            if (project.sendResolvedIncidentNotificationSms) {
                                sendResult = await TwilioService.sendIncidentResolvedMessageToSubscriber(
                                    date,
                                    subscriber.monitorName,
                                    contactPhone,
                                    smsTemplate,
                                    incident,
                                    project.name,
                                    incident.projectId,
                                    component.name,
                                    statusPageUrl
                                );
                            }
                        } else {
                            sendResult = await TwilioService.sendIncidentResolvedMessageToSubscriber(
                                date,
                                subscriber.monitorName,
                                contactPhone,
                                smsTemplate,
                                incident,
                                project.name,
                                incident.projectId,
                                component.name,
                                statusPageUrl
                            );
                        }
                    } else {
                        if (statusPage) {
                            if (project.sendCreatedIncidentNotificationSms) {
                                sendResult = await TwilioService.sendIncidentCreatedMessageToSubscriber(
                                    date,
                                    subscriber.monitorName,
                                    contactPhone,
                                    smsTemplate,
                                    incident,
                                    project.name,
                                    incident.projectId,
                                    component.name,
                                    statusPageUrl
                                );
                            }
                        } else {
                            sendResult = await TwilioService.sendIncidentCreatedMessageToSubscriber(
                                date,
                                subscriber.monitorName,
                                contactPhone,
                                smsTemplate,
                                incident,
                                project.name,
                                incident.projectId,
                                component.name,
                                statusPageUrl
                            );
                        }
                    }
                    if (
                        sendResult &&
                        sendResult.code &&
                        sendResult.code === 400
                    ) {
                        await SubscriberAlertService.updateBy(
                            { _id: alertId },
                            {
                                alertStatus: null,
                                error: true,
                                errorMessage: sendResult.message,
                            }
                        );
                    } else {
                        await SubscriberAlertService.updateBy(
                            { _id: alertId },
                            {
                                alertStatus: 'Success',
                            }
                        );
                    }
                } catch (error) {
                    await SubscriberAlertService.updateBy(
                        { _id: alertId },
                        {
                            alertStatus: null,
                            error: true,
                            errorMessage: 'Error',
                        }
                    );
                    throw error;
                }
            } else if (subscriber.alertVia == AlertType.Webhook) {
                await WebHookService.sendNotification(
                    incident.projectId,
                    incident,
                    incident.monitorId,
                    'created',
                    component
                );
            }
        } catch (error) {
            ErrorService.log('alertService.sendSubscriberAlert', error);
            throw error;
        }
    },

    mapCountryShortNameToCountryCode(shortName) {
        return countryCode[[shortName]];
    },

    isOnDuty(timezone, escalationStartTime, escalationEndTime) {
        if (!timezone || !escalationStartTime || !escalationEndTime) {
            return true;
        }

        const currentDate = new Date();
        escalationStartTime = DateTime.changeDateTimezone(
            escalationStartTime,
            timezone
        );
        escalationEndTime = DateTime.changeDateTimezone(
            escalationEndTime,
            timezone
        );
        return DateTime.isInBetween(
            currentDate,
            escalationStartTime,
            escalationEndTime
        );
    },

    getSubProjectAlerts: async function(subProjectIds) {
        const _this = this;
        const subProjectAlerts = await Promise.all(
            subProjectIds.map(async id => {
                const alerts = await _this.findBy({
                    query: { projectId: id },
                    skip: 0,
                    limit: 10,
                });
                const count = await _this.countBy({ projectId: id });
                return { alerts, count, _id: id, skip: 0, limit: 10 };
            })
        );
        return subProjectAlerts;
    },

    hardDeleteBy: async function(query) {
        try {
            await AlertModel.deleteMany(query);
            return 'Alert(s) removed successfully';
        } catch (error) {
            ErrorService.log('alertService.hardDeleteBy', error);
            throw error;
        }
    },

    restoreBy: async function(query) {
        const _this = this;
        query.deleted = true;
        let alert = await _this.findBy({ query });
        if (alert && alert.length > 1) {
            const alerts = await Promise.all(
                alert.map(async alert => {
                    const alertId = alert._id;
                    alert = await _this.updateOneBy(
                        {
                            _id: alertId,
                        },
                        {
                            deleted: false,
                            deletedAt: null,
                            deleteBy: null,
                        }
                    );
                    return alert;
                })
            );
            return alerts;
        } else {
            alert = alert[0];
            if (alert) {
                const alertId = alert._id;
                alert = await _this.updateOneBy(
                    {
                        _id: alertId,
                    },
                    {
                        deleted: false,
                        deletedAt: null,
                        deleteBy: null,
                    }
                );
            }
            return alert;
        }
    },
    getBalanceStatus: async function(projectId, alertPhoneNumber, alertType) {
        const project = await ProjectService.findOneBy({ _id: projectId });
        const balance = project.balance;
        const countryType = getCountryType(alertPhoneNumber);
        const alertChargeAmount = getAlertChargeAmount(alertType, countryType);
        return {
            chargeAmount: alertChargeAmount.price,
            closingBalance: balance,
        };
    },

    //Return true, if the limit is not reached yet.
    checkPhoneAlertsLimit: async function(projectId) {
        const _this = this;
        const hasCustomSettings = await TwilioService.hasCustomSettings(
            projectId
        );
        if (hasCustomSettings) {
            return true;
        }
        const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const alerts = await _this.countBy({
            projectId: projectId,
            alertVia: { $in: [AlertType.Call, AlertType.SMS] },
            error: { $in: [null, undefined, false] },
            createdAt: { $gte: yesterday },
        });
        const smsCounts = await SmsCountService.countBy({
            projectId: projectId,
            createdAt: { $gte: yesterday },
        });
        const project = await ProjectService.findOneBy({ _id: projectId });
        const twilioSettings = await TwilioService.getSettings();
        let limit =
            project && project.alertLimit
                ? project.alertLimit
                : twilioSettings['alert-limit'];
        if (limit && typeof limit === 'string') {
            limit = parseInt(limit, 10);
        }
        if (alerts + smsCounts <= limit) {
            return true;
        } else {
            await ProjectService.updateOneBy(
                { _id: projectId },
                { alertLimitReached: true }
            );
            return false;
        }
    },
};

const AlertModel = require('../models/alert');
const ProjectService = require('./projectService');
const PaymentService = require('./paymentService');
const AlertType = require('../config/alertType');
const ScheduleService = require('./scheduleService');
const SubscriberService = require('./subscriberService');
const SubscriberAlertService = require('./subscriberAlertService');
const EmailTemplateService = require('./emailTemplateService');
const SmsTemplateService = require('./smsTemplateService');
const EscalationService = require('./escalationService');
const MailService = require('./mailService');
const UserService = require('./userService');
const MonitorService = require('./monitorService');
const TwilioService = require('./twilioService');
const ErrorService = require('./errorService');
const StatusPageService = require('./statusPageService');
const AlertChargeService = require('./alertChargeService');
const countryCode = require('../config/countryCode');
const { getAlertChargeAmount, getCountryType } = require('../config/alertType');
const SmsCountService = require('./smsCountService');
const DateTime = require('../utils/DateTime');
const moment = require('moment-timezone');
const TimeZoneNames = moment.tz.names();
const OnCallScheduleStatusService = require('./onCallScheduleStatusService');
const { IS_SAAS_SERVICE } = require('../config/server');
const ComponentService = require('./componentService');
const GlobalConfigService = require('./globalConfigService');
const WebHookService = require('../services/webHookService');
