/* eslint-disable*/
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import {
    createMonitor,
    createMonitorSuccess,
    createMonitorFailure,
    resetCreateMonitor,
    editMonitor,
    editMonitorSwitch,
    setMonitorCriteria,
    addSeat,
} from '../../actions/monitor';
import { RenderField } from '../basic/RenderField';
import { makeCriteria } from '../../config';
import { FormLoader } from '../basic/Loader';
import { openModal, closeModal } from '../../actions/modal';
import {
    fetchMonitorCriteria,
    fetchMonitorsIncidents,
    fetchMonitorsSubscribers,
    toggleEdit
} from '../../actions/monitor';
import { showUpgradeForm } from '../../actions/project';
import ShouldRender from '../basic/ShouldRender';
import { fetchSchedules, scheduleSuccess } from '../../actions/schedule';
import ApiAdvance from './ApiAdvance';
import ResponseComponent from './ResponseComponent';
import { User } from '../../config';
import { ValidateField } from '../../config';
import { RenderSelect } from '../basic/RenderSelect';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS, PricingPlan as PlanListing } from '../../config';
import Tooltip from '../basic/Tooltip';
import PricingPlan from '../basic/PricingPlan';
const selector = formValueSelector('NewMonitor');
const dJSON = require('dirty-json');
import { history } from '../../store';

import {
    fetchCommunicationSlas
} from '../../actions/incidentCommunicationSla';
import { fetchMonitorSlas } from '../../actions/monitorSla';

class NewMonitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            advance: false,
            script: '',
            type: props.edit ? props.editMonitorProp.type : props.type,
        };
    }

    componentDidMount() {
        const userId = User.getUserId();
        const projectMember = this.props.currentProject.users.find(
            user => user.userId === userId
        );
        //load call schedules
        if (projectMember) {
            this.props.fetchMonitorSlas(this.props.currentProject._id)
            this.props.fetchCommunicationSlas(this.props.currentProject._id)
            this.props.fetchSchedules(this.props.currentProject._id);
        }
        this.props.fetchMonitorCriteria();
    }

    //Client side validation
    validate = values => {
        const errors = {};
        if (!ValidateField.text(values[`name_${this.props.index}`])) {
            errors.name = 'Name is required.';
        }
        if (values[`type_${this.props.index}`] === 'url') {
            if (!ValidateField.text(values[`url_${this.props.index}`])) {
                errors.url = 'URL is required.';
            } else if (!ValidateField.url(values[`url_${this.props.index}`])) {
                errors.url = 'URL is invalid.';
            }
        }

        if (values[`type_${this.props.index}`] === 'device') {
            if (!ValidateField.text(values[`deviceId_${this.props.index}`])) {
                errors.deviceId = 'Device ID is required.';
            } else if (
                !ValidateField.url(values[`deviceId_${this.props.index}`])
            ) {
                errors.deviceId = 'Device ID is invalid.';
            }
        }

        if (!values['resourceCategoriesId']) {
            errors.resourceCategories = 'Resource Category is required';
        }

        return errors;
    };

    componentDidUpdate() {
        const { monitor } = this.props;
        if (
            monitor.newMonitor.error ===
            "You can't add any more monitors. Please upgrade plan."
        ) {
            this.props.showUpgradeForm();
        }
    }

    submitForm = values => {
        const thisObj = this;
        const postObj = { data: {}, criteria: {} };
        postObj.componentId = thisObj.props.componentId;
        postObj.projectId = this.props.projectId;
        postObj.incidentCommunicationSla = values.incidentCommunicationSla;
        postObj.monitorSla = values.monitorSla;
        postObj.name = values[`name_${this.props.index}`];
        postObj.type = values[`type_${this.props.index}`]
            ? values[`type_${this.props.index}`]
            : this.props.edit
            ? this.props.editMonitorProp.type
            : this.props.type;
        postObj.resourceCategory =
            values[`resourceCategory_${this.props.index}`];
        postObj.callScheduleId = values[`callSchedule_${this.props.index}`];
        if (postObj.type === 'manual')
            postObj.data.description =
                values[`description_${this.props.index}`] || null;

        if (postObj.type === 'device')
            postObj.data.deviceId = values[`deviceId_${this.props.index}`];

        if (postObj.type === 'url' || postObj.type === 'api')
            postObj.data.url = values[`url_${this.props.index}`];

        if (postObj.type === 'script') {
            postObj.data.script = thisObj.state.script;
        }

        if (
            postObj.type === 'url' ||
            postObj.type === 'api' ||
            postObj.type === 'server-monitor' ||
            postObj.type === 'script'
        ) {
            if (
                values &&
                values[`up_${this.props.index}`] &&
                values[`up_${this.props.index}`].length
            ) {
                postObj.criteria.up = makeCriteria(
                    values[`up_${this.props.index}`]
                );
                postObj.criteria.up.createAlert =
                    values && values[`up_${this.props.index}_createAlert`]
                        ? true
                        : false;
                postObj.criteria.up.autoAcknowledge =
                    values && values[`up_${this.props.index}_autoAcknowledge`]
                        ? true
                        : false;
                postObj.criteria.up.autoResolve =
                    values && values[`up_${this.props.index}_autoResolve`]
                        ? true
                        : false;
            }

            if (
                values &&
                values[`degraded_${this.props.index}`] &&
                values[`degraded_${this.props.index}`].length
            ) {
                postObj.criteria.degraded = makeCriteria(
                    values[`degraded_${this.props.index}`]
                );
                postObj.criteria.degraded.createAlert =
                    values && values[`degraded_${this.props.index}_createAlert`]
                        ? true
                        : false;
                postObj.criteria.degraded.autoAcknowledge =
                    values &&
                    values[`degraded_${this.props.index}_autoAcknowledge`]
                        ? true
                        : false;
                postObj.criteria.degraded.autoResolve =
                    values && values[`degraded_${this.props.index}_autoResolve`]
                        ? true
                        : false;
            }

            if (
                values &&
                values[`down_${this.props.index}`] &&
                values[`down_${this.props.index}`].length
            ) {
                postObj.criteria.down = makeCriteria(
                    values[`down_${this.props.index}`]
                );
                postObj.criteria.down.createAlert =
                    values && values[`down_${this.props.index}_createAlert`]
                        ? true
                        : false;
                postObj.criteria.down.autoAcknowledge =
                    values && values[`down_${this.props.index}_autoAcknowledge`]
                        ? true
                        : false;
                postObj.criteria.down.autoResolve =
                    values && values[`down_${this.props.index}_autoResolve`]
                        ? true
                        : false;
            }
        }
        if (postObj.type === 'api') {
            if (
                values &&
                values[`method_${this.props.index}`] &&
                values[`method_${this.props.index}`].length
            ) {
                postObj.method = values[`method_${this.props.index}`];
            }
            if (
                values &&
                values[`headers_${this.props.index}`] &&
                values[`headers_${this.props.index}`].length
            ) {
                postObj.headers = values[`headers_${this.props.index}`];
            }
            if (
                values &&
                values[`bodyType_${this.props.index}`] &&
                values[`bodyType_${this.props.index}`].length
            ) {
                postObj.bodyType = values[`bodyType_${this.props.index}`];
            }
            if (
                values &&
                values[`formData_${this.props.index}`] &&
                values[`formData_${this.props.index}`].length &&
                (postObj.bodyType === 'form-data' ||
                    postObj.bodyType === 'x-www-form-urlencoded')
            ) {
                postObj.formData = values[`formData_${this.props.index}`];
            }
            if (
                values &&
                values[`text_${this.props.index}`] &&
                values[`text_${this.props.index}`].length &&
                !(
                    postObj.bodyType === 'form-data' ||
                    postObj.bodyType === 'x-www-form-urlencoded'
                )
            ) {
                let text = values[`text_${this.props.index}`];
                if (postObj.bodyType === 'application/json') {
                    try {
                        const val = text.replace(/^,{+|},+$/g, '');
                        const r = dJSON.parse(val);
                        text = JSON.stringify(r);
                    } catch (e) {
                    }
                }
                postObj.text = text;
            }
        }

        if (this.props.edit) {
            const { monitorId } = this.props;
            postObj._id = this.props.editMonitorProp._id;
            this.props.editMonitor(postObj.projectId, postObj).then(() => {
                this.props.toggleEdit(false);
                thisObj.props.destroy();
                if (monitorId === this.props.editMonitorProp._id) {
                    this.props.fetchMonitorsIncidents(
                        postObj.projectId,
                        this.props.editMonitorProp._id,
                        0,
                        5
                    );
                    this.props.fetchMonitorsSubscribers(
                        postObj.projectId,
                        this.props.editMonitorProp._id,
                        0,
                        5
                    );
                } else {
                    this.props.fetchMonitorsIncidents(
                        postObj.projectId,
                        this.props.editMonitorProp._id,
                        0,
                        3
                    );
                }
                if (SHOULD_LOG_ANALYTICS) {
                    logEvent(
                        'EVENT: DASHBOARD > PROJECT > COMPONENT > MONITOR > EDIT MONITOR',
                        values
                    );
                }
            });
        } else {
            this.props.createMonitor(postObj.projectId, postObj).then(
                (data) => {
                    thisObj.props.reset();
                    if (SHOULD_LOG_ANALYTICS) {
                        logEvent(
                            'EVENT: DASHBOARD > PROJECT > COMPONENT > MONITOR > NEW MONITOR',
                            values
                        );
                    }
                    history.push(
                        `/dashboard/project/${this.props.currentProject._id}/${this.props.componentId}/monitoring/${data.data._id}`
                    );
                },
                error => {
                    if (error && error.message) {
                        return error;
                    }
                }
            );
        }

        this.setState({
            advance: false,
            script: '',
            type: this.props.edit
                ? this.props.editMonitorProp.type
                : this.props.type,
        });
    };

    scheduleChange = (e, value) => {
        //load call schedules
        if (value && value !== '') {
            this.props.fetchSchedules(value);
        } else {
            const userId = User.getUserId();
            const projectMember = this.props.currentProject.users.find(
                user => user.userId === userId
            );
            if (projectMember)
                this.props.fetchSchedules(this.props.currentProject._id);
        }
    };

    cancelEdit = () => {
        this.props.editMonitorSwitch(this.props.index);
        this.props.toggleEdit(false);
    };

    openAdvance = () => {
        this.setState({ advance: !this.state.advance });
    };

    changeBox = (e, value) => {
        this.setState({ advance: false, type: value });
        this.props.setMonitorCriteria(
            this.props.name,
            this.props.category,
            this.props.subProject,
            this.props.schedule,
            this.props.monitorSla,
            this.props.incidentCommunicationSla,
            value
        );
    };

    scriptTextChange = newValue => {
        this.setState({ script: newValue });
    };

    monitorTypeDescription = {
        url:
            'Monitor your website and get notified when it goes down or performs poorly.',
        device:
            'Monitor IoT devices constantly and notify your team when they do not behave the way you want.',
        manual: (
            <>
                Manual monitors do not monitor any resource. You can change
                monitor status by using{' '}
                <a href="https://fyipe.com/docs">Fyipe’s API</a>. This is
                helpful when you use different monitoring tool but want to
                record monitor status on Fyipe.
            </>
        ),
        api: (
            <>
                Monitor{' '}
                <a href="https://en.wikipedia.org/wiki/Representational_state_transfer">
                    REST
                </a>{' '}
                endpoints constantly and notify your team when they do not
                behave the way you want.
            </>
        ),
        script:
            'Run custom JavaScript script and alerts you when script fails.',
        'server-monitor':
            'Monitor servers constantly and notify your team when they do not behave the way you want.',
    };

    getCurrentMonitorCount = monitor => {
        let count = 0;
        if (monitor.monitorsList.monitors.length > 0) {
            monitor.monitorsList.monitors.map(monitorObj => {
                count += monitorObj.count;
                return monitorObj;
            });
        }
        return count;
    };

    getNextPlan = plan => {
        const plans = ['Startup', 'Growth', 'Scale', 'Enterprise'];
        const nextPlanIndex = plans.indexOf(plan) + 1;

        if (nextPlanIndex >= plans.length) {
            return plans[plans.length - 1];
        }

        return plans[nextPlanIndex];
    };

    getUserCount = (project, subProjects) => {
        let count = 0;
        if (subProjects.length > 0) {
            const users = [];
            subProjects.map(subProject => {
                subProject.users.map(user => {
                    // ensure a user is not counted twice
                    // even when they're added to multiple subprojects
                    if (!users.includes(user.userId)) {
                        users.push(user.userId);
                    }
                    return user;
                });
                return subProject;
            });
            count = users.length;
        } else {
            count = project.users.length;
        }
        return count;
    };

    render() {
        const requesting =
            (this.props.monitor.newMonitor.requesting && !this.props.edit) ||
            (this.props.monitor.editMonitor.requesting && this.props.edit) ||
            this.props.requestingSla || this.props.requestingMonitorSla;

        const {
            handleSubmit,
            subProjects,
            schedules,
            resourceCategoryList,
            monitor,
            project,
            currentPlanId,
        } = this.props;
        const type = this.state.type;

        const unlimitedMonitors = ['Scale', 'Enterprise'];
        const planCategory =
            currentPlanId === 'enterprise'
                ? 'Enterprise'
                : PlanListing.getPlanById(currentPlanId).category;
        const numOfUsers = this.getUserCount(project, subProjects);
        const monitorPerUser =
            planCategory === 'Startup' ? 5 : planCategory === 'Growth' ? 10 : 0;
        const monitorCount = numOfUsers * monitorPerUser;
        const currentMonitorCount = this.getCurrentMonitorCount(monitor);

        return (
            <div className="Box-root Margin-bottom--12">
                <div className="bs-ContentSection Card-root Card-shadow--medium">
                    <div className="Box-root">
                        <div className="bs-ContentSection-content Box-root Box-divider--surface-bottom-1 Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--16">
                            <div className="Box-root">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>
                                        <ShouldRender if={!this.props.edit}>
                                            <span>New Monitor</span>
                                        </ShouldRender>

                                        <ShouldRender if={this.props.edit}>
                                            <span>
                                                Edit Monitor
                                                {this.props.editMonitorProp &&
                                                this.props.editMonitorProp.name
                                                    ? ' - ' +
                                                      this.props.editMonitorProp
                                                          .name
                                                    : null}
                                            </span>
                                        </ShouldRender>
                                    </span>
                                </span>
                                <p>
                                    <ShouldRender if={!this.props.edit}>
                                        <span>
                                            Monitor any resources (Websites,
                                            API, Servers, IoT Devices and more)
                                            constantly and notify your team when
                                            they do not behave the way you want.
                                        </span>
                                    </ShouldRender>
                                    <ShouldRender if={this.props.edit}>
                                        <span>
                                            Edit Name and URL of
                                            {this.props.editMonitorProp &&
                                            this.props.editMonitorProp.name
                                                ? ` ${this.props.editMonitorProp.name}`
                                                : ''}
                                        </span>
                                    </ShouldRender>
                                </p>
                            </div>
                        </div>

                        <form
                            id="form-new-monitor"
                            onSubmit={handleSubmit(this.submitForm)}
                        >
                            <div
                                className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-vertical--2"
                                style={{ boxShadow: 'none' }}
                            >
                                <div>
                                    <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                        <fieldset className="bs-Fieldset">
                                            <div className="bs-Fieldset-rows">
                                                <div className="bs-Fieldset-row">
                                                    <label className="bs-Fieldset-label">
                                                        Name
                                                    </label>
                                                    <div className="bs-Fieldset-fields">
                                                        <Field
                                                            className="db-BusinessSettings-input TextInput bs-TextInput"
                                                            component={
                                                                RenderField
                                                            }
                                                            type="text"
                                                            name={`name_${this.props.index}`}
                                                            id="name"
                                                            placeholder="Home Page"
                                                            disabled={
                                                                requesting
                                                            }
                                                            validate={
                                                                ValidateField.text
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <ShouldRender
                                                    if={this.props.incidentSlas.length > 0}
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Monitor SLA
                                                        </label>

                                                        <div className="bs-Fieldset-fields">
                                                            <span className="flex">
                                                                <Field
                                                                    className="db-select-nw"
                                                                    component={
                                                                        RenderSelect
                                                                    }
                                                                    name="monitorSla"
                                                                    id="monitorSla"
                                                                    placeholder="Monitor SLA"
                                                                    disabled={
                                                                        requesting
                                                                    }
                                                                    options={[
                                                                        {
                                                                            value:
                                                                                '',
                                                                            label:
                                                                                'Select Monitor SLA',
                                                                        },
                                                                        ...this.props.monitorSlas.map(sla => ({
                                                                            value: sla._id,
                                                                            label: sla.name,
                                                                        }))
                                                                    ]}
                                                                />
                                                               </span>
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={this.props.incidentSlas.length > 0}
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Incident Communication SLA
                                                        </label>

                                                        <div className="bs-Fieldset-fields">
                                                            <span className="flex">
                                                                <Field
                                                                    className="db-select-nw"
                                                                    component={
                                                                        RenderSelect
                                                                    }
                                                                    name="incidentCommunicationSla"
                                                                    id="incidentCommunicationSla"
                                                                    placeholder="Incident Communication SLA"
                                                                    disabled={
                                                                        requesting
                                                                    }
                                                                    options={[
                                                                        {
                                                                            value:
                                                                                '',
                                                                            label:
                                                                                'Select Incident Communication SLA',
                                                                        },
                                                                        ...this.props.incidentSlas.map(sla => ({
                                                                            value: sla._id,
                                                                            label: sla.name,
                                                                        }))
                                                                    ]}
                                                                />
                                                               </span>
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={
                                                        resourceCategoryList &&
                                                        resourceCategoryList.length >
                                                            0
                                                    }
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Resource Category
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <Field
                                                                className="db-select-nw"
                                                                component={
                                                                    RenderSelect
                                                                }
                                                                name={`resourceCategory_${this.props.index}`}
                                                                id="resourceCategory"
                                                                placeholder="Choose Resource Category"
                                                                disabled={
                                                                    requesting
                                                                }
                                                                options={[
                                                                    {
                                                                        value:
                                                                            '',
                                                                        label:
                                                                            'Select resource category',
                                                                    },
                                                                    ...(resourceCategoryList &&
                                                                    resourceCategoryList.length >
                                                                        0
                                                                        ? resourceCategoryList.map(
                                                                              category => ({
                                                                                  value:
                                                                                      category._id,
                                                                                  label:
                                                                                      category.name,
                                                                              })
                                                                          )
                                                                        : []),
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={!this.props.edit}
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Monitor Type
                                                        </label>

                                                        <div className="bs-Fieldset-fields">
                                                            <span className="flex">
                                                                <Field
                                                                    className="db-select-nw"
                                                                    component={
                                                                        RenderSelect
                                                                    }
                                                                    name={`type_${this.props.index}`}
                                                                    id="type"
                                                                    placeholder="Monitor Type"
                                                                    disabled={
                                                                        requesting
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                        v
                                                                    ) =>
                                                                        this.changeBox(
                                                                            e,
                                                                            v
                                                                        )
                                                                    }
                                                                    validate={
                                                                        ValidateField.select
                                                                    }
                                                                    options={[
                                                                        {
                                                                            value:
                                                                                '',
                                                                            label:
                                                                                'Select monitor type',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'url',
                                                                            label:
                                                                                'Website',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'device',
                                                                            label:
                                                                                'IoT Device',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'manual',
                                                                            label:
                                                                                'Manual',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'api',
                                                                            label:
                                                                                'API',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'script',
                                                                            label:
                                                                                'Script',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'server-monitor',
                                                                            label:
                                                                                'Server',
                                                                        },
                                                                    ]}
                                                                />
                                                                <Tooltip title="Monitor Types">
                                                                    <div>
                                                                        <p>
                                                                            {' '}
                                                                            <b>
                                                                                What
                                                                                are
                                                                                monitors?
                                                                            </b>
                                                                        </p>
                                                                        <p>
                                                                            {' '}
                                                                            Monitors
                                                                            lets
                                                                            you
                                                                            monitor
                                                                            any
                                                                            reosurces
                                                                            you
                                                                            have
                                                                            like
                                                                            API&#39;s,
                                                                            Websites,
                                                                            Servers,
                                                                            Containers,
                                                                            IoT
                                                                            device
                                                                            or
                                                                            more.{' '}
                                                                        </p>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                        }}
                                                                    >
                                                                        <p>
                                                                            {' '}
                                                                            <b>
                                                                                Website
                                                                                Monitors
                                                                            </b>
                                                                        </p>
                                                                        <p>
                                                                            {' '}
                                                                            Monitor
                                                                            your
                                                                            website
                                                                            and
                                                                            get
                                                                            notified
                                                                            when
                                                                            it
                                                                            goes
                                                                            down
                                                                            or
                                                                            performs
                                                                            poorly.
                                                                        </p>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                        }}
                                                                    >
                                                                        <p>
                                                                            {' '}
                                                                            <b>
                                                                                IoT
                                                                                Device
                                                                            </b>
                                                                        </p>
                                                                        <p>
                                                                            {' '}
                                                                            Monitor
                                                                            IoT
                                                                            devices
                                                                            constantly
                                                                            and
                                                                            notify
                                                                            your
                                                                            team
                                                                            when
                                                                            they
                                                                            do
                                                                            not
                                                                            behave
                                                                            the
                                                                            way
                                                                            you
                                                                            want.{' '}
                                                                        </p>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                        }}
                                                                    >
                                                                        <p>
                                                                            {' '}
                                                                            <b>
                                                                                Manual
                                                                                Monitors
                                                                            </b>
                                                                        </p>
                                                                        <p>
                                                                            {' '}
                                                                            <>
                                                                                Manual
                                                                                monitors
                                                                                do
                                                                                not
                                                                                monitor
                                                                                any
                                                                                resource.
                                                                                You
                                                                                can
                                                                                change
                                                                                monitor
                                                                                status
                                                                                by
                                                                                using{' '}
                                                                                <a href="https://fyipe.com/docs">
                                                                                    Fyipe’s
                                                                                    API
                                                                                </a>

                                                                                .
                                                                                This
                                                                                is
                                                                                helpful
                                                                                when
                                                                                you
                                                                                use
                                                                                different
                                                                                monitoring
                                                                                tool
                                                                                but
                                                                                want
                                                                                to
                                                                                record
                                                                                monitor
                                                                                status
                                                                                on
                                                                                Fyipe.
                                                                            </>{' '}
                                                                        </p>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                        }}
                                                                    >
                                                                        <p>
                                                                            {' '}
                                                                            <b>
                                                                                API
                                                                                Monitor
                                                                            </b>
                                                                        </p>
                                                                        <p>
                                                                            {' '}
                                                                            <>
                                                                                Monitor{' '}
                                                                                <a href="https://en.wikipedia.org/wiki/Representational_state_transfer">
                                                                                    REST
                                                                                </a>{' '}
                                                                                endpoints
                                                                                constantly
                                                                                and
                                                                                notify
                                                                                your
                                                                                team
                                                                                when
                                                                                they
                                                                                do
                                                                                not
                                                                                behave
                                                                                the
                                                                                way
                                                                                you
                                                                                want.
                                                                            </>{' '}
                                                                        </p>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                        }}
                                                                    >
                                                                        <p>
                                                                            {' '}
                                                                            <b>
                                                                                Script
                                                                                Monitor
                                                                            </b>
                                                                        </p>
                                                                        <p>
                                                                            {' '}
                                                                            Run
                                                                            custom
                                                                            JavaScript
                                                                            script
                                                                            and
                                                                            alerts
                                                                            you
                                                                            when
                                                                            script
                                                                            fails.
                                                                        </p>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                        }}
                                                                    >
                                                                        <p>
                                                                            {' '}
                                                                            <b>
                                                                                Server
                                                                                Monitor
                                                                            </b>
                                                                        </p>
                                                                        <p>
                                                                            {' '}
                                                                            Monitor
                                                                            servers
                                                                            constantly
                                                                            and
                                                                            notify
                                                                            your
                                                                            team
                                                                            when
                                                                            they
                                                                            do
                                                                            not
                                                                            behave
                                                                            the
                                                                            way
                                                                            you
                                                                            want.
                                                                        </p>
                                                                    </div>
                                                                </Tooltip>
                                                            </span>
                                                            <span
                                                                className="Text-color--inherit Text-display--inline Text-lineHeight--24 Text-typeface--base Text-wrap--wrap"
                                                                style={{
                                                                    marginTop: 10,
                                                                }}
                                                            >
                                                                <span>
                                                                    {
                                                                        this
                                                                            .monitorTypeDescription[
                                                                            [
                                                                                this
                                                                                    .state
                                                                                    .type,
                                                                            ]
                                                                        ]
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                
                                                <ShouldRender
                                                    if={type === 'api'}
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            HTTP Method
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <Field
                                                                className="db-select-nw"
                                                                component={
                                                                    RenderSelect
                                                                }
                                                                name={`method_${this.props.index}`}
                                                                id="method"
                                                                placeholder="Http Method"
                                                                disabled={
                                                                    requesting
                                                                }
                                                                validate={
                                                                    ValidateField.select
                                                                }
                                                                options={[
                                                                    {
                                                                        value:
                                                                            '',
                                                                        label:
                                                                            'Select method',
                                                                    },
                                                                    {
                                                                        value:
                                                                            'get',
                                                                        label:
                                                                            'GET',
                                                                    },
                                                                    {
                                                                        value:
                                                                            'post',
                                                                        label:
                                                                            'POST',
                                                                    },
                                                                    {
                                                                        value:
                                                                            'put',
                                                                        label:
                                                                            'PUT',
                                                                    },
                                                                    {
                                                                        value:
                                                                            'delete',
                                                                        label:
                                                                            'DELETE',
                                                                    },
                                                                ]}
                                                                style={{
                                                                    height:
                                                                        '28px',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={
                                                        type === 'url' ||
                                                        type === 'api'
                                                    }
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            URL
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <Field
                                                                className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                component={
                                                                    RenderField
                                                                }
                                                                type="url"
                                                                name={`url_${this.props.index}`}
                                                                id="url"
                                                                placeholder={`https://mywebsite.com${
                                                                    type ===
                                                                    'api'
                                                                        ? '/api'
                                                                        : ''
                                                                }`}
                                                                disabled={
                                                                    requesting
                                                                }
                                                                validate={[
                                                                    ValidateField.required,
                                                                    ValidateField.url,
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={type === 'manual'}
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Description
                                                            (optional)
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <Field
                                                                className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                component={
                                                                    RenderField
                                                                }
                                                                type="text"
                                                                name={`description_${this.props.index}`}
                                                                id="description"
                                                                placeholder="Home Page's Monitor"
                                                                disabled={
                                                                    requesting
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                {type === 'device' && (
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Device ID
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <Field
                                                                className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                component={
                                                                    RenderField
                                                                }
                                                                type="deviceId"
                                                                name={`deviceId_${this.props.index}`}
                                                                id="deviceId"
                                                                placeholder="of234dfgqwe"
                                                                disabled={
                                                                    requesting
                                                                }
                                                                validate={
                                                                    ValidateField.required
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <ShouldRender
                                                    if={type === 'script'}
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Script
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <span>
                                                                <span>
                                                                    <AceEditor
                                                                        placeholder="Enter script here"
                                                                        mode="javascript"
                                                                        theme="github"
                                                                        value={
                                                                            this
                                                                                .state
                                                                                .script
                                                                        }
                                                                        style={{
                                                                            backgroundColor:
                                                                                '#fff',
                                                                            borderRadius:
                                                                                '4px',
                                                                            boxShadow:
                                                                                '0 0 0 1px rgba(50, 50, 93, 0.16), 0 0 0 1px rgba(50, 151, 211, 0), 0 0 0 2px rgba(50, 151, 211, 0), 0 1px 1px rgba(0, 0, 0, 0.08)',
                                                                        }}
                                                                        name={`script_${this.props.index}`}
                                                                        id="script"
                                                                        editorProps={{
                                                                            $blockScrolling: true,
                                                                        }}
                                                                        setOptions={{
                                                                            enableBasicAutocompletion: true,
                                                                            enableLiveAutocompletion: true,
                                                                            enableSnippets: true,
                                                                            showGutter: false,
                                                                        }}
                                                                        height="150px"
                                                                        highlightActiveLine={
                                                                            true
                                                                        }
                                                                        onChange={
                                                                            this
                                                                                .scriptTextChange
                                                                        }
                                                                    />
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={
                                                        schedules &&
                                                        schedules.length > 0
                                                    }
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Call Schedule
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <Field
                                                                className="db-select-nw"
                                                                component={
                                                                    RenderSelect
                                                                }
                                                                name={`callSchedule_${this.props.index}`}
                                                                id="callSchedule"
                                                                placeholder="Call Schedule"
                                                                disabled={
                                                                    requesting
                                                                }
                                                                style={{
                                                                    height:
                                                                        '28px',
                                                                }}
                                                                options={[
                                                                    {
                                                                        value:
                                                                            '',
                                                                        label:
                                                                            'Select call schedule',
                                                                    },
                                                                    ...(schedules &&
                                                                    schedules.length >
                                                                        0
                                                                        ? schedules.map(
                                                                              schedule => ({
                                                                                  value:
                                                                                      schedule._id,
                                                                                  label:
                                                                                      schedule.name,
                                                                              })
                                                                          )
                                                                        : []),
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={
                                                        type &&
                                                        (type === 'api' ||
                                                            type === 'url' ||
                                                            type ===
                                                                'server-monitor' ||
                                                            type ===
                                                                'script') &&
                                                        !this.state.advance
                                                    }
                                                >
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label"></label>
                                                        <div className="bs-Fieldset-fields">
                                                            <button
                                                                id="advanceOptions"
                                                                className="button-as-anchor"
                                                                onClick={() =>
                                                                    this.openAdvance()
                                                                }
                                                            >
                                                                {' '}
                                                                Advance Options.
                                                            </button>
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <ShouldRender
                                                    if={
                                                        this.state.advance &&
                                                        (type === 'api' ||
                                                            type === 'url' ||
                                                            type ===
                                                                'server-monitor' ||
                                                            type === 'script')
                                                    }
                                                >
                                                    <ShouldRender
                                                        if={
                                                            this.state
                                                                .advance &&
                                                            type === 'api'
                                                        }
                                                    >
                                                        <ApiAdvance
                                                            index={
                                                                this.props.index
                                                            }
                                                        />
                                                    </ShouldRender>
                                                    <ResponseComponent
                                                        head="Monitor up criteria"
                                                        tagline="This is where you describe when your monitor is considered up"
                                                        fieldname={`up_${this.props.index}`}
                                                        index={this.props.index}
                                                        type={this.state.type}
                                                    />
                                                    <ResponseComponent
                                                        head="Monitor degraded criteria"
                                                        tagline="This is where you describe when your monitor is considered degraded"
                                                        fieldname={`degraded_${this.props.index}`}
                                                        index={this.props.index}
                                                        type={this.state.type}
                                                    />
                                                    <ResponseComponent
                                                        head="Monitor down criteria"
                                                        tagline="This is where you describe when your monitor is considered down"
                                                        fieldname={`down_${this.props.index}`}
                                                        index={this.props.index}
                                                        type={this.state.type}
                                                    />
                                                </ShouldRender>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>
                            <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--12">
                                <div className="bs-Tail-copy">
                                    <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                        <ShouldRender
                                            if={
                                                this.props.monitor.newMonitor
                                                    .error ||
                                                this.props.monitor.editMonitor
                                                    .error
                                            }
                                        >
                                            <div className="Box-root Margin-right--8">
                                                <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                                            </div>
                                            <div className="Box-root">
                                                <span
                                                    style={{ color: 'red' }}
                                                    id="formNewMonitorError"
                                                >
                                                    {this.props.monitor
                                                        .newMonitor.error ||
                                                        this.props.monitor
                                                            .editMonitor.error}
                                                </span>
                                            </div>
                                        </ShouldRender>
                                    </div>
                                </div>
                                <div>
                                    <ShouldRender
                                        if={!requesting && this.props.edit}
                                    >
                                        <button
                                            className="bs-Button"
                                            disabled={requesting}
                                            onClick={this.cancelEdit}
                                        >
                                            <span>Cancel</span>
                                        </button>
                                    </ShouldRender>
                                    <button
                                        id="addMonitorButton"
                                        className="bs-Button bs-Button--blue"
                                        disabled={requesting}
                                        type="submit"
                                    >
                                        <PricingPlan
                                            plan={this.getNextPlan(
                                                planCategory
                                            )}
                                            hideChildren={false}
                                            disabled={
                                                unlimitedMonitors.includes(
                                                    planCategory
                                                ) ||
                                                currentMonitorCount <
                                                    monitorCount
                                            }
                                        >
                                            <ShouldRender
                                                if={
                                                    !this.props.edit &&
                                                    !requesting
                                                }
                                            >
                                                <span>Add Monitor</span>
                                            </ShouldRender>
                                        </PricingPlan>
                                        <ShouldRender
                                            if={this.props.edit && !requesting}
                                        >
                                            <span>Edit Monitor </span>
                                        </ShouldRender>

                                        <ShouldRender if={requesting}>
                                            <FormLoader />
                                        </ShouldRender>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

NewMonitor.displayName = 'NewMonitor';

const NewMonitorForm = new reduxForm({
    form: 'NewMonitor',
    destroyOnUnmount: true,
    enableReinitialize: true,
})(NewMonitor);

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            createMonitor,
            createMonitorSuccess,
            createMonitorFailure,
            resetCreateMonitor,
            editMonitorSwitch,
            openModal,
            closeModal,
            editMonitor,
            fetchMonitorCriteria,
            setMonitorCriteria,
            addSeat,
            fetchMonitorsIncidents,
            fetchMonitorsSubscribers,
            fetchSchedules,
            scheduleSuccess,
            showUpgradeForm,
            toggleEdit,
            fetchCommunicationSlas,
            fetchMonitorSlas,
        },
        dispatch
    );

const mapStateToProps = (state, ownProps) => {
    const name = selector(state, 'name_1000');
    const type = selector(state, 'type_1000');
    const category = selector(state, 'resourceCategory_1000');
    const schedule = selector(state, 'callSchedule_1000');
    const monitorSla = selector(state, 'monitorSla')
    const incidentCommunicationSla = selector(state, 'incidentCommunicationSla')
    let projectId = null;

    for (const project of state.component.componentList.components) {
        for (const component of project.components) {
            if (component._id === ownProps.componentId) {
                projectId = component.projectId._id;
                break;
            }
        }
    }
    if (projectId === null)
        projectId = ownProps.currentProject && ownProps.currentProject._id;

    const currentPlanId =
        state.project &&
        state.project.currentProject &&
        state.project.currentProject.stripePlanId
            ? state.project.currentProject.stripePlanId
            : '';

    if (ownProps.edit) {
        const monitorId = ownProps.match
            ? ownProps.match.params
                ? ownProps.match.params.monitorId
                : null
            : null;
        return {
            monitor: state.monitor,
            currentProject: state.project.currentProject,
            name,
            type,
            category,
            schedule,
            monitorSla,
            incidentCommunicationSla,
            subProjects: state.subProject.subProjects.subProjects,
            schedules: state.schedule.schedules.data,
            resourceCategoryList:
                state.resourceCategories.resourceCategoryListForNewResource
                    .resourceCategories,
            monitorId,
            project: state.project.currentProject
                ? state.project.currentProject
                : {},
            currentPlanId,
            projectId,
            incidentSlas: state.incidentSla.incidentCommunicationSlas.incidentSlas,
            requestingSla: state.incidentSla.incidentCommunicationSlas.requesting,
            fetchSlaError: state.incidentSla.incidentCommunicationSlas.error,
            monitorSlas: state.monitorSla.monitorSlas.slas,
            requestingMonitorSla: state.monitorSla.monitorSlas.requesting,
            fetchSlaError: state.monitorSla.monitorSlas.error,
        };
    } else {
        return {
            initialValues: state.monitor.newMonitor.initialValue,
            monitor: state.monitor,
            currentProject: state.project.currentProject,
            name,
            type,
            category,
            schedule,
            monitorSla,
            incidentCommunicationSla,
            resourceCategoryList:
                state.resourceCategories.resourceCategoryListForNewResource
                    .resourceCategories,
            subProjects: state.subProject.subProjects.subProjects,
            schedules: state.schedule.schedules.data,
            project: state.project.currentProject
                ? state.project.currentProject
                : {},
            currentPlanId,
            projectId,
            incidentSlas: state.incidentSla.incidentCommunicationSlas.incidentSlas,
            requestingSla: state.incidentSla.incidentCommunicationSlas.requesting,
            fetchSlaError: state.incidentSla.incidentCommunicationSlas.error,
            monitorSlas: state.monitorSla.monitorSlas.slas,
            requestingMonitorSla: state.monitorSla.monitorSlas.requesting,
            fetchSlaError: state.monitorSla.monitorSlas.error,
        };
    }
};

NewMonitor.propTypes = {
    index: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired,
    ]),
    editMonitorSwitch: PropTypes.func.isRequired,
    currentProject: PropTypes.object.isRequired,
    editMonitor: PropTypes.func.isRequired,
    createMonitor: PropTypes.func.isRequired,
    monitor: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    fetchMonitorsIncidents: PropTypes.func.isRequired,
    fetchMonitorsSubscribers: PropTypes.func.isRequired,
    fetchSchedules: PropTypes.func.isRequired,
    editMonitorProp: PropTypes.object,
    edit: PropTypes.bool,
    name: PropTypes.string,
    type: PropTypes.string,
    category: PropTypes.string,
    subProject: PropTypes.string,
    schedule: PropTypes.string,
    monitorSla: PropTypes.string,
    incidentCommunicationSla: PropTypes.string,
    resourceCategoryList: PropTypes.array,
    schedules: PropTypes.array,
    monitorId: PropTypes.string,
    setMonitorCriteria: PropTypes.func,
    fetchMonitorCriteria: PropTypes.func,
    showUpgradeForm: PropTypes.func,
    project: PropTypes.object,
    currentPlanId: PropTypes.string,
    projectId: PropTypes.string,
    subProjects: PropTypes.array,
    toggleEdit: PropTypes.func,
    fetchCommunicationSlas: PropTypes.func,
    incidentSlas: PropTypes.array,
    fetchSlaError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    requestingSla: PropTypes.bool,
    fetchMonitorSlas: PropTypes.func,
    monitorSlas: PropTypes.array,
    fetchMonitorSlaError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    requestingMonitorSla: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMonitorForm);
