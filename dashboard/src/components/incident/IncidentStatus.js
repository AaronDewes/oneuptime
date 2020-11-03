import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import {
    acknowledgeIncident,
    resolveIncident,
    closeIncident,
    getIncidentTimeline,
} from '../../actions/incident';
import { FormLoader, Spinner } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { User } from '../../config';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS } from '../../config';
import DataPathHoC from '../DataPathHoC';
import { openModal } from '../../actions/modal';
import EditIncident from '../modals/EditIncident';
import { history } from '../../store';
import MessageBox from '../modals/MessageBox';
import { markAsRead } from '../../actions/notification';
import ViewJsonLogs from '../modals/ViewJsonLogs';

export class IncidentStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editIncidentModalId: uuid.v4(),
            messageModalId: uuid.v4(),
            viewJsonModalId: uuid.v4(),
            resolveLoad: false,
            value: undefined,
            stats: false,
        };
    }
    acknowledge = () => {
        const userId = User.getUserId();
        this.props
            .acknowledgeIncident(
                this.props.incident.projectId,
                this.props.incident._id,
                userId,
                this.props.multiple
            )
            .then(() => {
                this.setState({ resolveLoad: false });
                this.props.getIncidentTimeline(
                    this.props.currentProject._id,
                    this.props.incident._id,
                    parseInt(0),
                    parseInt(10)
                );
            });
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > INCIDENT ACKNOWLEDGED',
                {
                    ProjectId: this.props.incident.projectId,
                    incidentId: this.props.incident._id,
                    userId: userId,
                }
            );
        }
    };

    resolve = () => {
        const userId = User.getUserId();
        this.props
            .resolveIncident(
                this.props.incident.projectId,
                this.props.incident._id,
                userId,
                this.props.multiple
            )
            .then(() => {
                this.setState({ resolveLoad: false, value: '', stats: false });
                this.props.markAsRead(
                    this.props.incident.projectId,
                    this.props.incident.notificationId
                );
                this.props.getIncidentTimeline(
                    this.props.currentProject._id,
                    this.props.incident._id,
                    parseInt(0),
                    parseInt(10)
                );
            });
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > INCIDENT RESOLVED',
                {
                    ProjectId: this.props.incident.projectId,
                    incidentId: this.props.incident._id,
                    userId: userId,
                }
            );
        }
    };

    closeIncident = () => {
        this.props.closeIncident(
            this.props.incident.projectId,
            this.props.incident._id
        );
    };

    handleIncident = (value, stats) => {
        if (!this.props.incident.acknowledged) {
            this.setState({ resolveLoad: true, value, stats });
            this.acknowledge();
        } else if (
            this.props.incident.acknowledged &&
            !this.props.incident.resolved
        ) {
            this.setState({ resolveLoad: true, value, stats });
            this.resolve();
        }
    };

    render() {
        const subProject =
            this.props.subProjects &&
            this.props.subProjects.filter(
                subProject => subProject._id === this.props.incident.projectId
            )[0];
        const loggedInUser = User.getUserId();
        const isUserInProject =
            this.props.currentProject &&
            this.props.currentProject.users.some(
                user => user.userId === loggedInUser
            );
        let isUserInSubProject = false;
        if (isUserInProject) isUserInSubProject = true;
        else
            isUserInSubProject = subProject.users.some(
                user => user.userId === loggedInUser
            );
        const monitorName =
            (this.props.multiple &&
                this.props.incident &&
                this.props.incident.monitorId) ||
                (this.props.incident && this.props.incident.monitorId)
                ? this.props.incident.monitorId.name
                : '';
        const projectId = this.props.currentProject
            ? this.props.currentProject._id
            : '';
        const incidentId = this.props.incident ? this.props.incident._id : '';
        const componentId = this.props.incident
            ? this.props.incident.monitorId.componentId._id
            : '';
        const homeRoute = this.props.currentProject
            ? '/dashboard/project/' + this.props.currentProject._id
            : '';
        const monitorRoute = this.props.currentProject
            ? '/dashboard/project/' +
            projectId +
            '/' +
            componentId +
            '/monitoring'
            : '';
        const incidentRoute = this.props.currentProject
            ? '/dashboard/project/' +
            projectId +
            '/' +
            componentId +
            '/incidents/' +
            this.props.incident._id
            : '';

        const showResolveButton = this.props.multipleIncidentRequest
            ? !this.props.multipleIncidentRequest.resolving
            : this.props.incidentRequest &&
            !this.props.incidentRequest.resolving;

        const incidentReason =
            this.props.incident.reason &&
            this.props.incident.reason.split('\n');

        return (
            <div
                id={`incident_${this.props.count}`}
                className="Box-root Margin-bottom--12"
            >
                <div className="bs-ContentSection Card-root Card-shadow--medium">
                    <div className="Box-root">
                        <div className="bs-ContentSection-content Box-root Box-divider--surface-bottom-1 Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--16">
                            <div className="Box-root">
                                <div className="bs-flex-display">
                                    <div className="bs-incident-title bs-i-title">
                                        <div>INCIDENT</div>
                                        <div className="bs-numb">{`#${this.props.incident.idNumber}`}</div>
                                    </div>
                                    <div className="bs-incident-title bs-i-title-right">
                                        <div className="bs--header">
                                            <div className="bs-font-header">
                                                {monitorName} is{' '}
                                                {
                                                    this.props.incident
                                                        .incidentType
                                                }
                                            </div>
                                            {
                                                (incidentReason && incidentReason.length > 1) &&
                                                <div className="bs-redun">
                                                    Acknowledge and Resolve this
                                                    incident.
                                            </div>
                                            }
                                            {this.props.incident
                                                .manuallyCreated && (
                                                    <div className="bs-flex-display">
                                                        <span className="bs-font-normal">Cause:&nbsp; </span>
                                                        <span className="bs-flex-display bs-font-normal">
                                                            <span>
                                                                This incident was
                                                                created by
                                                        </span>
                                                            <Link
                                                                style={{
                                                                    textDecoration:
                                                                        'underline',
                                                                    marginLeft:
                                                                        '4px',
                                                                }}
                                                                to={
                                                                    '/dashboard/profile/' +
                                                                    this.props
                                                                        .incident
                                                                        .createdById
                                                                        ._id
                                                                }
                                                            >
                                                                <div>
                                                                    {
                                                                        this.props
                                                                            .incident
                                                                            .createdById
                                                                            .name
                                                                    }
                                                                </div>
                                                            </Link>
                                                        </span>
                                                    </div>
                                                )}
                                            {this.props.incident
                                                .incidentType &&
                                                this.props.incident
                                                    .reason && (incidentReason && incidentReason.length < 2) && (
                                                    <div className="bs-font-normal bs-flex-display">
                                                        <label className="bs-h">
                                                            Cause:
                                                            </label>
                                                        <div
                                                            className="bs-content-inside bs-status"
                                                            id={`${monitorName}_IncidentReport_${this.props.count}`}
                                                        >
                                                            <ReactMarkdown
                                                                source={`${incidentReason &&
                                                                    incidentReason.length >
                                                                    1
                                                                    ? incidentReason
                                                                        .map(
                                                                            a =>
                                                                                '- **&middot; ' +
                                                                                a +
                                                                                '**.'
                                                                        )
                                                                        .join(
                                                                            '\n'
                                                                        )
                                                                    : ' ' +
                                                                    incidentReason.pop() +
                                                                    '.'
                                                                    }`}
                                                            />
                                                        </div>
                                                        {this.props.incident
                                                            .response &&
                                                            this.props
                                                                .incident
                                                                .reason &&
                                                            this.props.incident.reason.includes(
                                                                'Response `'
                                                            ) && (
                                                                <button
                                                                    id={`${monitorName}_ShowResponse_${this.props.count}`}
                                                                    title="showMore"
                                                                    className="bs-Button bs-DeprecatedButton db-Trends-editButton Flex-flex"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        this.props.openModal(
                                                                            {
                                                                                id: this
                                                                                    .state
                                                                                    .viewJsonModalId,
                                                                                content: DataPathHoC(
                                                                                    ViewJsonLogs,
                                                                                    {
                                                                                        viewJsonModalId: this
                                                                                            .state
                                                                                            .viewJsonModalId,
                                                                                        jsonLog: this
                                                                                            .props
                                                                                            .incident
                                                                                            .response,
                                                                                        title:
                                                                                            'API Response',
                                                                                        rootName:
                                                                                            'response',
                                                                                    }
                                                                                ),
                                                                            }
                                                                        )
                                                                    }
                                                                >
                                                                    <span>
                                                                        Show
                                                                        More
                                                                        </span>
                                                                </button>
                                                            )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16 bs-mob-flex">
                                <div
                                    className={
                                        this.props.incident.acknowledged &&
                                            this.props.incident.resolved
                                            ? 'bs-flex-display bs-remove-shadow'
                                            : 'bs-flex-display'
                                    }
                                >
                                    {this.props.incident.acknowledged &&
                                        this.props.incident.resolved &&
                                        this.props.route &&
                                        !(
                                            this.props.route === incidentRoute
                                        ) && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                style={{
                                                    margin: '2px 3px 0px 0px',
                                                }}
                                                className="bs-g"
                                                width="18"
                                                height="18"
                                            >
                                                <path
                                                    fill="none"
                                                    d="M0 0h24v24H0z"
                                                />
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z" />
                                            </svg>
                                        )}
                                    {(!this.props.incident.acknowledged ||
                                        !this.props.incident.resolved) && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                style={{
                                                    margin: '2px 3px 0px 0px',
                                                }}
                                                className="bs-red-icon"
                                                width="18"
                                                height="18"
                                            >
                                                <path
                                                    fill="none"
                                                    d="M0 0h24v24H0z"
                                                />
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                                            </svg>
                                        )}
                                    <div
                                        className={
                                            this.props.incident.acknowledged &&
                                                this.props.incident.resolved
                                                ? 'bs-resolved-green'
                                                : 'bs-exclaim'
                                        }
                                    >
                                        {!this.props.incident.acknowledged ? (
                                            <span className="bs-active-in">
                                                This is an Active Incident
                                            </span>
                                        ) : this.props.incident.acknowledged &&
                                            !this.props.incident.resolved ? (
                                                    <span className="bs-active-in">
                                                        This is an Active Incident
                                                    </span>
                                                ) : this.props.route &&
                                                    !(
                                                        this.props.route === incidentRoute
                                                    ) ? (
                                                        <span className="">
                                                            The Incident is Resolved
                                                        </span>
                                                    ) : null}
                                    </div>
                                </div>
                                <ShouldRender
                                    if={
                                        !this.props.route ||
                                        (this.props.route &&
                                            !(
                                                this.props.route ===
                                                homeRoute ||
                                                this.props.route ===
                                                monitorRoute
                                            ))
                                    }
                                >
                                    <button
                                        className="bs-Button bs-Button--icon bs-Button--settings bs-margin-right-1"
                                        id={`${monitorName}_EditIncidentDetails`}
                                        type="button"
                                        onClick={() => {
                                            this.props.openModal({
                                                id: this.state
                                                    .editIncidentModalId,
                                                content: DataPathHoC(
                                                    EditIncident,
                                                    {
                                                        incident: this.props
                                                            .incident,
                                                        incidentId: this.props
                                                            .incident._id,
                                                    }
                                                ),
                                            });
                                        }}
                                    >
                                        <span>Edit Incident</span>
                                    </button>
                                </ShouldRender>
                            </div>
                        </div>
                        <div className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-horizontal--8 Padding-vertical--2">
                            <div>
                                <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                    <fieldset className="bs-Fieldset">
                                        <div className="bs-Fieldset-rows bs-header bs-content-1">
                                            <div className="bs-left-side">
                                                <div className="bs-content">
                                                    <label>Incident ID</label>
                                                    <div className="bs-content-inside">
                                                        <span
                                                            className="value"
                                                            style={{
                                                                marginTop:
                                                                    '6px',
                                                                fontWeight:
                                                                    '600',
                                                                fontSize:
                                                                    '18px',
                                                            }}
                                                        >
                                                            {`#${this.props.incident.idNumber}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bs-content">
                                                    <label className="">
                                                        Monitor
                                                    </label>
                                                    <div className="bs-content-inside">
                                                        <span className="value">
                                                            <Link
                                                                style={{
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                to={
                                                                    '/dashboard/project/' +
                                                                    projectId +
                                                                    '/' +
                                                                    componentId +
                                                                    '/monitoring/' +
                                                                    this.props
                                                                        .incident
                                                                        .monitorId
                                                                        ._id
                                                                }
                                                                id="backToMonitorView"
                                                            >
                                                                {
                                                                    this.props
                                                                        .incident
                                                                        .monitorId
                                                                        .name
                                                                }
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bs-content">
                                                    <label className="">
                                                        Incident Status:
                                                    </label>
                                                    <div className="bs-content-inside bs-margin-off">
                                                        <span className="value">
                                                            {this.props
                                                                .incident &&
                                                                this.props.incident
                                                                    .incidentType &&
                                                                this.props.incident
                                                                    .incidentType ===
                                                                'offline' ? (
                                                                    <div className="Badge Badge--color--red Box-root Flex-inlineFlex Flex-alignItems--center bs-padding-x">
                                                                        <span className="Badge-text Text-color--red Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper bs-font-increase">
                                                                            <span>
                                                                                offline
                                                                        </span>
                                                                        </span>
                                                                    </div>
                                                                ) : this.props
                                                                    .incident &&
                                                                    this.props
                                                                        .incident
                                                                        .incidentType &&
                                                                    this.props
                                                                        .incident
                                                                        .incidentType ===
                                                                    'online' ? (
                                                                        <div className="Badge Badge--color--green Box-root Flex-inlineFlex Flex-alignItems--center bs-padding-x">
                                                                            <span className="Badge-text Text-color--green Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper bs-font-increase">
                                                                                <span>
                                                                                    online
                                                                        </span>
                                                                            </span>
                                                                        </div>
                                                                    ) : this.props
                                                                        .incident &&
                                                                        this.props
                                                                            .incident
                                                                            .incidentType &&
                                                                        this.props
                                                                            .incident
                                                                            .incidentType ===
                                                                        'degraded' ? (
                                                                            <div className="Badge Badge--color--yellow Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                                <span className="Badge-text Text-color--yellow Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper bs-font-increase">
                                                                                    <span>
                                                                                        degraded
                                                                        </span>
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="Badge Badge--color--red Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                                <span className="Badge-text Text-color--red Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper">
                                                                                    <span>
                                                                                        Unknown
                                                                                        Status
                                                                        </span>
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bs-content">
                                                    <label className="">
                                                        Incident Timeline
                                                    </label>
                                                    <div>
                                                        <div className="bs-flex-display bs-margin-top-1 bs-justify-cont">
                                                            <div className="bs-circle bs-circle-o"></div>
                                                            <div className="bs-date-ma">
                                                                <span className="bs-content-create bs-text-bold">
                                                                    Created At
                                                                </span>
                                                                <span className="bs-date-create bs-text-bold">
                                                                    {moment(
                                                                        this
                                                                            .props
                                                                            .incident
                                                                            .createdAt
                                                                    ).format(
                                                                        'h:mm:ss a'
                                                                    )}{' '}
                                                                    (
                                                                    {moment(
                                                                        this
                                                                            .props
                                                                            .incident
                                                                            .createdAt
                                                                    ).fromNow()}
                                                                    ).
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!this.props.incident
                                                        .acknowledged && (
                                                            <div className="bs-content bs-margin-top">
                                                                <div className="bs-content-inside">
                                                                    <div
                                                                        className="bs-font-increase"
                                                                        title="Let your team know you’re working on this incident."
                                                                    >
                                                                        <div>
                                                                            <ShouldRender
                                                                                if={
                                                                                    showResolveButton
                                                                                }
                                                                            >
                                                                                <label
                                                                                    id={`btnResolve_${this.props.count}`}
                                                                                    className="Bs-btn-no bs-flex-display bs-margin-left"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        viewBox="0 0 24 24"
                                                                                        className="bs-ack-red"
                                                                                        width="18"
                                                                                        height="18"
                                                                                    >
                                                                                        <path
                                                                                            fill="none"
                                                                                            d="M0 0h24v24H0z"
                                                                                        />
                                                                                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                                                                                    </svg>
                                                                                    <div className="bs-margin-right bs-font-transform">
                                                                                        This
                                                                                        is
                                                                                        an
                                                                                        Active
                                                                                        Incident
                                                                                </div>
                                                                                </label>
                                                                            </ShouldRender>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bs-ma-top">
                                                                        <div className="bs-action-label">
                                                                            ACTION
                                                                            REQUIRED
                                                                    </div>
                                                                        <button
                                                                            onClick={() =>
                                                                                this.handleIncident(
                                                                                    1,
                                                                                    true
                                                                                )
                                                                            }
                                                                            className="bs-Button bs-flex-display bs--ma"
                                                                        >
                                                                            <ShouldRender
                                                                                if={
                                                                                    ((this
                                                                                        .props
                                                                                        .incidentRequest &&
                                                                                        this
                                                                                            .props
                                                                                            .incidentRequest
                                                                                            .requesting) ||
                                                                                        (this
                                                                                            .props
                                                                                            .multipleIncidentRequest &&
                                                                                            this
                                                                                                .props
                                                                                                .multipleIncidentRequest
                                                                                                .requesting) ||
                                                                                        (this
                                                                                            .props
                                                                                            .incidentRequest &&
                                                                                            this
                                                                                                .props
                                                                                                .incidentRequest
                                                                                                .resolving) ||
                                                                                        (this
                                                                                            .props
                                                                                            .multipleIncidentRequest &&
                                                                                            this
                                                                                                .props
                                                                                                .multipleIncidentRequest
                                                                                                .resolving)) &&
                                                                                    this
                                                                                        .state
                                                                                        .value ===
                                                                                    1 &&
                                                                                    this
                                                                                        .state
                                                                                        .stats
                                                                                }
                                                                            >
                                                                                <Spinner
                                                                                    style={{
                                                                                        stroke:
                                                                                            '#000000',
                                                                                    }}
                                                                                />
                                                                            </ShouldRender>
                                                                            {this
                                                                                .state
                                                                                .resolveLoad ? null : !this
                                                                                    .props
                                                                                    .incident
                                                                                    .acknowledged &&
                                                                                    !this
                                                                                        .state
                                                                                        .resolveLoad &&
                                                                                    this
                                                                                        .state
                                                                                        .value !==
                                                                                    1 &&
                                                                                    !this
                                                                                        .state
                                                                                        .stats ? (
                                                                                        <div className="bs-circle"></div>
                                                                                    ) : null}
                                                                            <span>
                                                                                Acknowledge
                                                                                Incident
                                                                        </span>
                                                                        </button>
                                                                        <p className="bs-Fieldset-explanation">
                                                                            <span>
                                                                                Let
                                                                                your
                                                                                team
                                                                                know
                                                                                you&#39;re
                                                                                working
                                                                                on
                                                                                this
                                                                                incident.
                                                                        </span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    {this.props.incident
                                                        .acknowledged ? (
                                                            <>
                                                                <div>
                                                                    <div className="bs-content-inside bs-margin-top-1">
                                                                        <div>
                                                                            <div className="bs-flex-display bs-justify-cont">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    className="bs-ack-yellow"
                                                                                    width="18"
                                                                                    height="18"
                                                                                >
                                                                                    <path
                                                                                        fill="none"
                                                                                        d="M0 0h24v24H0z"
                                                                                    />
                                                                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                                                                                </svg>
                                                                                <div
                                                                                    id={`AcknowledgeText_${this.props.count}`}
                                                                                    className="bs-margin-right bs-text-bold"
                                                                                >
                                                                                    Acknowledged
                                                                                by{' '}
                                                                                    {this
                                                                                        .props
                                                                                        .incident
                                                                                        .acknowledgedBy ===
                                                                                        null ? (
                                                                                            <span>
                                                                                                {!this
                                                                                                    .props
                                                                                                    .incident
                                                                                                    .acknowledgedByZapier
                                                                                                    ? 'Fyipe'
                                                                                                    : 'Zapier'}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <Link
                                                                                                style={{
                                                                                                    textDecoration:
                                                                                                        'underline',
                                                                                                }}
                                                                                                to={
                                                                                                    '/dashboard/profile/' +
                                                                                                    this
                                                                                                        .props
                                                                                                        .incident
                                                                                                        .acknowledgedBy
                                                                                                        ._id
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    this
                                                                                                        .props
                                                                                                        .incident
                                                                                                        .acknowledgedBy
                                                                                                        .name
                                                                                                }{' '}
                                                                                            </Link>
                                                                                        )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="bs-date-time">
                                                                                <span>
                                                                                    This
                                                                                    incident
                                                                                    was
                                                                                    acknowledged
                                                                                on{' '}
                                                                                </span>
                                                                                {moment(
                                                                                    this
                                                                                        .props
                                                                                        .incident
                                                                                        .acknowledgedAt
                                                                                ).format(
                                                                                    'MMMM Do YYYY'
                                                                                )}{' '}
                                                                            at{' '}
                                                                                {moment(
                                                                                    this
                                                                                        .props
                                                                                        .incident
                                                                                        .acknowledgedAt
                                                                                ).format(
                                                                                    'h:mm:ss a'
                                                                                )}{' '}
                                                                            (
                                                                            {moment(
                                                                                    this
                                                                                        .props
                                                                                        .incident
                                                                                        .acknowledgedAt
                                                                                ).fromNow()}
                                                                            ){' '}
                                                                                {
                                                                                    '. '
                                                                                }
                                                                                <span>
                                                                                    It
                                                                                took{' '}
                                                                                    {
                                                                                        moment(
                                                                                            this
                                                                                                .props
                                                                                                .incident
                                                                                                .createdAt
                                                                                        )
                                                                                            .fromNow(
                                                                                                this
                                                                                                    .props
                                                                                                    .incident
                                                                                                    .ackowledgedAt
                                                                                            )
                                                                                            .split(
                                                                                                'ago'
                                                                                            )[0]
                                                                                    }{' '}
                                                                                to
                                                                                acknowledge
                                                                                this
                                                                                incident.
                                                                            </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : isUserInSubProject ? (
                                                            <div></div>
                                                        ) : (
                                                                <>
                                                                    <div className="bs-content-inside">
                                                                        <div className="Badge Badge--color--red Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                            <span className="Badge-text Text-color--red Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper">
                                                                                <span>
                                                                                    Not
                                                                                    Acknowledged
                                                                        </span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                    {this.props.incident
                                                        .resolved ? (
                                                            <>
                                                                <div
                                                                    className="bs-content bs-margin-top"
                                                                    style={{
                                                                        marginTop:
                                                                            '10px',
                                                                    }}
                                                                >
                                                                    <div className="bs-content-inside">
                                                                        <div>
                                                                            <div className="bs-flex-display bs-justify-cont bs-m-top">
                                                                                <div className="bs-circle-span-green"></div>
                                                                                <div
                                                                                    id={`ResolveText_${this.props.count}`}
                                                                                    className="bs-margin-right bs-text-bold"
                                                                                >
                                                                                    Resolved
                                                                                by{' '}
                                                                                    {this
                                                                                        .props
                                                                                        .incident
                                                                                        .resolvedBy ===
                                                                                        null ? (
                                                                                            <span>
                                                                                                {!this
                                                                                                    .props
                                                                                                    .incident
                                                                                                    .resolvedByZapier
                                                                                                    ? 'Fyipe'
                                                                                                    : 'Zapier'}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <Link
                                                                                                style={{
                                                                                                    textDecoration:
                                                                                                        'underline',
                                                                                                }}
                                                                                                to={
                                                                                                    '/dashboard/profile/' +
                                                                                                    this
                                                                                                        .props
                                                                                                        .incident
                                                                                                        .resolvedBy
                                                                                                        ._id
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    this
                                                                                                        .props
                                                                                                        .incident
                                                                                                        .resolvedBy
                                                                                                        .name
                                                                                                }{' '}
                                                                                            </Link>
                                                                                        )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bs-date-time">
                                                                            <span>
                                                                                This
                                                                                incident
                                                                                was
                                                                                resolved
                                                                            on{' '}
                                                                            </span>
                                                                            {moment(
                                                                                this
                                                                                    .props
                                                                                    .incident
                                                                                    .resolvedAt
                                                                            ).format(
                                                                                'MMMM Do YYYY'
                                                                            )}{' '}
                                                                        at{' '}
                                                                            {moment(
                                                                                this
                                                                                    .props
                                                                                    .incident
                                                                                    .resolvedAt
                                                                            ).format(
                                                                                'h:mm:ss a'
                                                                            )}{' '}
                                                                        (
                                                                        {moment(
                                                                                this
                                                                                    .props
                                                                                    .incident
                                                                                    .resolvedAt
                                                                            ).fromNow()}
                                                                        ){'. '}
                                                                            <span>
                                                                                It
                                                                            took{' '}
                                                                                {
                                                                                    moment(
                                                                                        this
                                                                                            .props
                                                                                            .incident
                                                                                            .createdAt
                                                                                    )
                                                                                        .fromNow(
                                                                                            this
                                                                                                .props
                                                                                                .incident
                                                                                                .resolvedAt
                                                                                        )
                                                                                        .split(
                                                                                            'ago'
                                                                                        )[0]
                                                                                }{' '}
                                                                            to
                                                                            resolve
                                                                            this
                                                                            incident.
                                                                        </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : isUserInSubProject ? (
                                                            <>
                                                                {this.props.incident
                                                                    .acknowledged && (
                                                                        <div className="bs-content bs-margin-top">
                                                                            <div className="bs-content-inside">
                                                                                <div
                                                                                    className="bs-font-increase"
                                                                                    title="Let your team know you've fixed this incident."
                                                                                >
                                                                                    <div>
                                                                                        <ShouldRender
                                                                                            if={
                                                                                                showResolveButton
                                                                                            }
                                                                                        >
                                                                                            <label
                                                                                                id={`btnResolve_${this.props.count}`}
                                                                                                className="Bs-btn-no bs-flex-display bs-margin-left"
                                                                                            >
                                                                                                <div className="bs-circle-span"></div>
                                                                                                <div className="bs-margin-right">
                                                                                                    Not
                                                                                                    Resolved
                                                                                        </div>
                                                                                            </label>
                                                                                        </ShouldRender>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="bs-ma-top">
                                                                                    <div className="bs-action-label">
                                                                                        ACTION
                                                                                        REQUIRED
                                                                            </div>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            this.handleIncident(
                                                                                                2
                                                                                            )
                                                                                        }
                                                                                        className="bs-Button bs-flex-display bs--ma"
                                                                                    >
                                                                                        <ShouldRender
                                                                                            if={
                                                                                                ((this
                                                                                                    .props
                                                                                                    .incidentRequest &&
                                                                                                    this
                                                                                                        .props
                                                                                                        .incidentRequest
                                                                                                        .requesting) ||
                                                                                                    (this
                                                                                                        .props
                                                                                                        .multipleIncidentRequest &&
                                                                                                        this
                                                                                                            .props
                                                                                                            .multipleIncidentRequest
                                                                                                            .requesting) ||
                                                                                                    (this
                                                                                                        .props
                                                                                                        .incidentRequest &&
                                                                                                        this
                                                                                                            .props
                                                                                                            .incidentRequest
                                                                                                            .resolving) ||
                                                                                                    (this
                                                                                                        .props
                                                                                                        .multipleIncidentRequest &&
                                                                                                        this
                                                                                                            .props
                                                                                                            .multipleIncidentRequest
                                                                                                            .resolving)) &&
                                                                                                this
                                                                                                    .state
                                                                                                    .value ===
                                                                                                2
                                                                                            }
                                                                                        >
                                                                                            <Spinner
                                                                                                style={{
                                                                                                    stroke:
                                                                                                        '#000000',
                                                                                                }}
                                                                                            />
                                                                                        </ShouldRender>
                                                                                        {this
                                                                                            .state
                                                                                            .resolveLoad ? null : this
                                                                                                .props
                                                                                                .incident
                                                                                                .acknowledged &&
                                                                                                !this
                                                                                                    .props
                                                                                                    .incident
                                                                                                    .resolved &&
                                                                                                !this
                                                                                                    .state
                                                                                                    .resolveLoad &&
                                                                                                this
                                                                                                    .state
                                                                                                    .value !==
                                                                                                2 ? (
                                                                                                    <div className="bs-ticks"></div>
                                                                                                ) : null}
                                                                                        <span>
                                                                                            Resolve
                                                                                            Incident
                                                                                </span>
                                                                                    </button>
                                                                                    <p className="bs-Fieldset-explanation">
                                                                                        <span>
                                                                                            Let
                                                                                            your
                                                                                            team
                                                                                            know
                                                                                            you&#39;ve
                                                                                            fixed
                                                                                            this
                                                                                            incident.
                                                                                </span>
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                            </>
                                                        ) : (
                                                                <div className="bs-content bs-margin-top">
                                                                    <div className="bs-content-inside">
                                                                        <div className="Badge Badge--color--red Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                            <span className="Badge-text Text-color--red Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper">
                                                                                <span>
                                                                                    Not
                                                                                    Resolved
                                                                        </span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                </div>
                                            </div>
                                            <div className="bs-right-side">
                                                {this.props.incident.title && (
                                                    <div className="bs-content bs-title">
                                                        <label className="">
                                                            Title
                                                        </label>
                                                        <div className="bs-content-inside">
                                                            <span className="value">
                                                                {
                                                                    this.props
                                                                        .incident
                                                                        .title
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {this.props.incident
                                                    .description && (
                                                        <div className="bs-content">
                                                            <label className="">
                                                                Description
                                                        </label>
                                                            <div className="bs-content-inside">
                                                                <ReactMarkdown
                                                                    source={
                                                                        this.props
                                                                            .incident
                                                                            .description
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                {this.props.incident
                                                    .manuallyCreated && (
                                                        <div className="bs-content">
                                                            <label className="">
                                                                Cause
                                                        </label>
                                                            <div className="bs-content-inside">
                                                                <div className="bs-flex-display bs-display-block">
                                                                    <span>
                                                                        This
                                                                        incident was
                                                                        created by
                                                                </span>
                                                                    <Link
                                                                        style={{
                                                                            textDecoration:
                                                                                'underline',
                                                                            marginLeft:
                                                                                '4px',
                                                                        }}
                                                                        to={
                                                                            '/dashboard/profile/' +
                                                                            this
                                                                                .props
                                                                                .incident
                                                                                .createdById
                                                                                ._id
                                                                        }
                                                                    >
                                                                        <div>
                                                                            {
                                                                                this
                                                                                    .props
                                                                                    .incident
                                                                                    .createdById
                                                                                    .name
                                                                            }
                                                                        </div>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                {this.props.incident
                                                    .incidentType &&
                                                    this.props.incident
                                                        .reason && (incidentReason && incidentReason.length > 1) && (
                                                        <div className="bs-content">
                                                            <label className="">
                                                                Cause
                                                            </label>
                                                            <div
                                                                className="bs-content-inside"
                                                                id={`${monitorName}_IncidentReport_${this.props.count}`}
                                                            >
                                                                <ReactMarkdown
                                                                    source={`${incidentReason &&
                                                                        incidentReason.length >
                                                                        1
                                                                        && incidentReason
                                                                            .map(
                                                                                a =>
                                                                                    '- **&middot; ' +
                                                                                    a +
                                                                                    '**.'
                                                                            )
                                                                            .join(
                                                                                '\n'
                                                                            )
                                                                        }`}
                                                                />
                                                            </div>
                                                            {this.props.incident
                                                                .response &&
                                                                this.props
                                                                    .incident
                                                                    .reason &&
                                                                this.props.incident.reason.includes(
                                                                    'Response `'
                                                                ) && (
                                                                    <button
                                                                        id={`${monitorName}_ShowResponse_${this.props.count}`}
                                                                        title="showMore"
                                                                        className="bs-Button bs-DeprecatedButton db-Trends-editButton Flex-flex"
                                                                        type="button"
                                                                        onClick={() =>
                                                                            this.props.openModal(
                                                                                {
                                                                                    id: this
                                                                                        .state
                                                                                        .viewJsonModalId,
                                                                                    content: DataPathHoC(
                                                                                        ViewJsonLogs,
                                                                                        {
                                                                                            viewJsonModalId: this
                                                                                                .state
                                                                                                .viewJsonModalId,
                                                                                            jsonLog: this
                                                                                                .props
                                                                                                .incident
                                                                                                .response,
                                                                                            title:
                                                                                                'API Response',
                                                                                            rootName:
                                                                                                'response',
                                                                                        }
                                                                                    ),
                                                                                }
                                                                            )
                                                                        }
                                                                    >
                                                                        <span>
                                                                            Show
                                                                            More
                                                                        </span>
                                                                    </button>
                                                                )}
                                                        </div>
                                                    )}
                                                {this.props.incident
                                                    .incidentPriority && (
                                                        <div className="bs-content">
                                                            <label className="">
                                                                Priority
                                                        </label>
                                                            <div className="bs-content-inside">
                                                                <div className="Flex-flex Flex-alignItems--center bs-justify-cont">
                                                                    <span
                                                                        className="Margin-right--4"
                                                                        style={{
                                                                            display:
                                                                                'inline-block',
                                                                            backgroundColor: `rgba(${this.props.incident.incidentPriority.color.r},${this.props.incident.incidentPriority.color.g},${this.props.incident.incidentPriority.color.b},${this.props.incident.incidentPriority.color.a})`,
                                                                            height:
                                                                                '15px',
                                                                            width:
                                                                                '15px',
                                                                            borderRadius:
                                                                                '30%',
                                                                        }}
                                                                    ></span>
                                                                    <span
                                                                        className="Text-fontWeight--medium"
                                                                        style={{
                                                                            color: `rgba(${this.props.incident.incidentPriority.color.r},${this.props.incident.incidentPriority.color.g},${this.props.incident.incidentPriority.color.b},${this.props.incident.incidentPriority.color.a})`,
                                                                        }}
                                                                    >
                                                                        {
                                                                            this
                                                                                .props
                                                                                .incident
                                                                                .incidentPriority
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>

                        <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--flexEnd Padding-horizontal--20 Padding-bottom--12">
                            <ShouldRender
                                if={
                                    this.props.route &&
                                    !(this.props.route === incidentRoute)
                                }
                            >
                                <button
                                    className="bs-Button bs-Button--more bs-btn-extra"
                                    id={`${monitorName}_EditIncidentDetails`}
                                    type="button"
                                    onClick={() => {
                                        setTimeout(() => {
                                            history.push(
                                                `/dashboard/project/${projectId}/${componentId}/incidents/${incidentId}`
                                            );
                                        }, 100);
                                        this.props.markAsRead(
                                            projectId,
                                            this.props.incident.notificationId
                                        );
                                    }}
                                >
                                    <span>View Incident</span>
                                </button>
                            </ShouldRender>
                            <button
                                className={
                                    this.props.incident.acknowledged &&
                                        this.props.incident.resolved
                                        ? 'bs-btn-extra bs-Button bs-flex-display bs-remove-shadow'
                                        : 'bs-btn-extra bs-Button bs-flex-display'
                                }
                                id={`${monitorName}_EditIncidentDetails_${this.props.count}`}
                                type="button"
                                onClick={() =>
                                    this.handleIncident(undefined, false)
                                }
                            >
                                {this.props.incident.acknowledged &&
                                    this.props.incident.resolved &&
                                    (!this.props.route ||
                                        (this.props.route &&
                                            !(
                                                this.props.route ===
                                                homeRoute ||
                                                this.props.route ===
                                                monitorRoute
                                            ))) && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="bs-g"
                                            width="18"
                                            height="18"
                                        >
                                            <path
                                                fill="none"
                                                d="M0 0h24v24H0z"
                                            />
                                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z" />
                                        </svg>
                                    )}
                                {this.state.resolveLoad ? null : !this.props
                                    .incident.acknowledged &&
                                    !this.state.resolveLoad ? (
                                        <div className="bs-circle"></div>
                                    ) : null}
                                {this.state.resolveLoad ? null : this.props
                                    .incident.acknowledged &&
                                    !this.props.incident.resolved &&
                                    !this.state.resolveLoad ? (
                                        <div className="bs-ticks"></div>
                                    ) : null}
                                <div
                                    className={
                                        this.props.incident.acknowledged &&
                                        this.props.incident.resolved &&
                                        'bs-resolved-green'
                                    }
                                >
                                    <ShouldRender
                                        if={
                                            ((this.props.incidentRequest &&
                                                this.props.incidentRequest
                                                    .requesting) ||
                                                (this.props
                                                    .multipleIncidentRequest &&
                                                    this.props
                                                        .multipleIncidentRequest
                                                        .requesting) ||
                                                (this.props.incidentRequest &&
                                                    this.props.incidentRequest
                                                        .resolving) ||
                                                (this.props
                                                    .multipleIncidentRequest &&
                                                    this.props
                                                        .multipleIncidentRequest
                                                        .resolving)) &&
                                            !this.state.value &&
                                            !this.state.stats
                                        }
                                    >
                                        <Spinner
                                            style={{
                                                stroke: '#000000',
                                            }}
                                        />
                                    </ShouldRender>
                                    {!this.props.incident.acknowledged
                                        ? 'Acknowledge Incident'
                                        : this.props.incident.acknowledged &&
                                            !this.props.incident.resolved
                                            ? 'Resolve Incident'
                                            : !this.props.route ||
                                                (this.props.route &&
                                                    !(
                                                        this.props.route ===
                                                        homeRoute ||
                                                        this.props.route ===
                                                        monitorRoute
                                                    ))
                                                ? 'The Incident is Resolved'
                                                : null}
                                </div>
                            </button>
                            <ShouldRender
                                if={
                                    this.props.multiple &&
                                    this.props.incident &&
                                    this.props.incident.acknowledged &&
                                    this.props.incident.resolved
                                }
                            >
                                <button
                                    onClick={() => {
                                        this.props.incident.resolved
                                            ? this.closeIncident()
                                            : this.props.openModal({
                                                id: this.state.messageModalId,
                                                onClose: () => '',
                                                content: DataPathHoC(
                                                    MessageBox,
                                                    {
                                                        messageBoxId: this
                                                            .state
                                                            .messageModalId,
                                                        title: 'Warning',
                                                        message:
                                                            'This incident cannot be closed because it is not acknowledged or resolved',
                                                    }
                                                ),
                                            });
                                    }}
                                    className={
                                        this.props.closeincident &&
                                            this.props.closeincident.requesting
                                            ? 'bs-Button bs-Button--blue bs-btn-extra'
                                            : 'bs-Button bs-DeprecatedButton db-Trends-editButton bs-btn-extra'
                                    }
                                    disabled={
                                        this.props.closeincident &&
                                        this.props.closeincident.requesting
                                    }
                                    type="button"
                                    id={`closeIncidentButton_${this.props.count}`}
                                    style={{ marginLeft: '-16px' }}
                                >
                                    <ShouldRender
                                        if={
                                            this.props.closeincident &&
                                            this.props.closeincident
                                                .requesting &&
                                            this.props.closeincident
                                                .requesting ===
                                            this.props.incident._id
                                        }
                                    >
                                        <FormLoader />
                                    </ShouldRender>
                                    <ShouldRender
                                        if={
                                            this.props.closeincident &&
                                            (!this.props.closeincident
                                                .requesting ||
                                                (this.props.closeincident
                                                    .requesting &&
                                                    this.props.closeincident
                                                        .requesting !==
                                                    this.props.incident
                                                        ._id))
                                        }
                                    >
                                        <span>Close</span>
                                    </ShouldRender>
                                </button>
                            </ShouldRender>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

IncidentStatus.displayName = 'IncidentStatus';

const mapStateToProps = state => {
    return {
        currentProject: state.project.currentProject,
        closeincident: state.incident.closeincident,
        subProjects: state.subProject.subProjects.subProjects,
        incidentRequest: state.incident.incident,
    };
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            resolveIncident,
            acknowledgeIncident,
            closeIncident,
            openModal,
            markAsRead,
            getIncidentTimeline,
        },
        dispatch
    );
};

IncidentStatus.propTypes = {
    resolveIncident: PropTypes.func.isRequired,
    acknowledgeIncident: PropTypes.func.isRequired,
    closeIncident: PropTypes.func,
    closeincident: PropTypes.object,
    requesting: PropTypes.bool,
    incident: PropTypes.object.isRequired,
    currentProject: PropTypes.object.isRequired,
    subProjects: PropTypes.array.isRequired,
    multiple: PropTypes.bool,
    count: PropTypes.number,
    openModal: PropTypes.func.isRequired,
    projectId: PropTypes.string,
    componentId: PropTypes.string,
    route: PropTypes.string,
    incidentRequest: PropTypes.object.isRequired,
    multipleIncidentRequest: PropTypes.object,
    markAsRead: PropTypes.func,
    getIncidentTimeline: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(IncidentStatus);
