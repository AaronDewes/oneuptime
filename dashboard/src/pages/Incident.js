import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Fade from 'react-reveal/Fade';
import {
    incidentRequest,
    incidentError,
    incidentSuccess,
    resetIncident,
    getIncident,
    getIncidentTimeline,
    fetchIncidentMessages,
} from '../actions/incident';
import { fetchIncidentAlert, fetchSubscriberAlert } from '../actions/alert';
import Dashboard from '../components/Dashboard';
import IncidentDescription from '../components/incident/IncidentDescription';
import IncidentStatus from '../components/incident/IncidentStatus';
import IncidentAlert from '../components/incident/IncidentAlert';
import SubscriberAlert from '../components/subscriber/subscriberAlert';
import IncidentInvestigation from '../components/incident/IncidentInvestigation';
import IncidentInternal from '../components/incident/IncidentInternal';
import PropTypes from 'prop-types';
import IncidentDeleteBox from '../components/incident/IncidentDeleteBox';
import RenderIfSubProjectAdmin from '../components/basic/RenderIfSubProjectAdmin';
import MonitorViewLogsBox from '../components/monitor/MonitorViewLogsBox';
import IncidentTimelineBox from '../components/incident/IncidentTimelineBox';
import { getMonitorLogs } from '../actions/monitor';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS } from '../config';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';

class Incident extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    componentDidMount() {
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('PAGE VIEW: DASHBOARD > PROJECT > INCIDENT');
        }
    }

    nextAlerts = () => {
        this.props.fetchIncidentAlert(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            parseInt(this.props.skip, 10) + parseInt(this.props.limit, 10),
            parseInt(this.props.limit, 10)
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > NEXT ALERT CLICKED',
                {
                    projectId: this.props.match.params.projectId,
                    incidentId: this.props.match.params.incidentId,
                }
            );
        }
    };

    previousAlerts = () => {
        this.props.fetchIncidentAlert(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            parseInt(this.props.skip, 10) - parseInt(this.props.limit, 10),
            parseInt(this.props.limit, 10)
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > PREVIOUS ALERT CLICKED',
                {
                    projectId: this.props.match.params.projectId,
                    incidentId: this.props.match.params.incidentId,
                }
            );
        }
    };

    nextTimeline = () => {
        this.props.getIncidentTimeline(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            parseInt(this.props.incidentTimeline.skip, 10) +
                parseInt(this.props.incidentTimeline.limit, 10),
            parseInt(this.props.incidentTimeline.limit, 10)
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > NEXT TIMELINE CLICKED',
                {
                    projectId: this.props.match.params.projectId,
                    incidentId: this.props.match.params.incidentId,
                }
            );
        }
    };

    previousTimeline = () => {
        this.props.getIncidentTimeline(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            parseInt(this.props.incidentTimeline.skip, 10) -
                parseInt(this.props.incidentTimeline.limit, 10),
            parseInt(this.props.incidentTimeline.limit, 10)
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > PREVIOUS TIMELINE CLICKED',
                {
                    projectId: this.props.match.params.projectId,
                    incidentId: this.props.match.params.incidentId,
                }
            );
        }
    };

    nextSubscribers = () => {
        this.props.fetchSubscriberAlert(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            parseInt(this.props.subscribersAlerts.skip, 10) +
                parseInt(this.props.subscribersAlerts.limit, 10),
            parseInt(this.props.subscribersAlerts.limit, 10)
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > NEXT SUBSCRIBER CLICKED',
                {
                    projectId: this.props.match.params.projectId,
                    incidentId: this.props.match.params.incidentId,
                }
            );
        }
    };

    previousSubscribers = () => {
        this.props.fetchSubscriberAlert(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            parseInt(this.props.subscribersAlerts.skip, 10) -
                parseInt(this.props.subscribersAlerts.limit, 10),
            parseInt(this.props.subscribersAlerts.limit, 10)
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > INCIDENT > PREVIOUS SUBSCRIBER CLICKED',
                {
                    projectId: this.props.match.params.projectId,
                    incidentId: this.props.match.params.incidentId,
                }
            );
        }
    };

    ready = () => {
        const monitorId =
            this.props.incident &&
            this.props.incident.monitorId &&
            this.props.incident.monitorId._id
                ? this.props.incident.monitorId._id
                : null;

        this.props
            .getIncident(
                this.props.match.params.projectId,
                this.props.match.params.incidentId
            )
            .then(() => {
                this.props.getIncidentTimeline(
                    this.props.match.params.projectId,
                    this.props.match.params.incidentId,
                    0,
                    10
                );
            });
        this.props.fetchIncidentAlert(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            0,
            10
        );
        this.props.fetchSubscriberAlert(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            0,
            10
        );
        this.props.getMonitorLogs(
            this.props.match.params.projectId,
            monitorId,
            0,
            10,
            null,
            null,
            null,
            this.props.match.params.incidentId
        );
        this.props.fetchIncidentMessages(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            0,
            10
        );
        this.props.fetchIncidentMessages(
            this.props.match.params.projectId,
            this.props.match.params.incidentId,
            0,
            10,
            'internal'
        );
    };

    render() {
        let variable = null;
        const monitorId =
            this.props.incident &&
            this.props.incident.monitorId &&
            this.props.incident.monitorId._id
                ? this.props.incident.monitorId._id
                : null;
        const monitorName =
            this.props.incident &&
            this.props.incident.monitorId &&
            this.props.incident.monitorId.name
                ? this.props.incident.monitorId.name
                : null;
        const componentId = this.props.component
            ? this.props.component._id
            : '';
        if (this.props.incident) {
            variable = (
                <div>
                    <IncidentDescription
                        incident={this.props.incident}
                        projectId={this.props.currentProject._id}
                        componentId={componentId}
                    />
                    <IncidentStatus incident={this.props.incident} />
                    <IncidentAlert
                        next={this.nextAlerts}
                        previous={this.previousAlerts}
                    />
                    <div className="Box-root Margin-bottom--12">
                        <MonitorViewLogsBox
                            incidentId={this.props.incident._id}
                            monitorId={monitorId}
                            monitorName={monitorName}
                        />
                    </div>
                    <div className="Box-root Margin-bottom--12">
                        <IncidentTimelineBox
                            next={this.nextTimeline}
                            previous={this.previousTimeline}
                            incident={this.props.incident}
                        />
                    </div>
                    <SubscriberAlert
                        next={this.nextSubscribers}
                        previous={this.previousSubscribers}
                        incident={this.props.incident}
                    />
                    <IncidentInvestigation incident={this.props.incident} />
                    <IncidentInternal incident={this.props.incident} />
                    <RenderIfSubProjectAdmin>
                        <IncidentDeleteBox
                            incident={this.props.incident}
                            deleting={this.props.deleting}
                            currentProject={this.props.currentProject}
                            component={this.props.component}
                        />
                    </RenderIfSubProjectAdmin>
                </div>
            );
        } else {
            variable = (
                <div
                    id="app-loading"
                    style={{
                        position: 'fixed',
                        top: '0',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        backgroundColor: '#fdfdfd',
                        zIndex: '999',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ transform: 'scale(2)' }}>
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="bs-Spinner-svg"
                        >
                            <ellipse
                                cx="12"
                                cy="12"
                                rx="10"
                                ry="10"
                                className="bs-Spinner-ellipse"
                            ></ellipse>
                        </svg>
                    </div>
                </div>
            );
        }
        const {
            component,
            location: { pathname },
        } = this.props;
        const componentName = component ? component.name : '';

        return (
            <Dashboard ready={this.ready}>
                <Fade>
                    <BreadCrumbItem
                        route={getParentRoute(pathname, null, 'incidents')}
                        name={componentName}
                    />
                    <BreadCrumbItem
                        route={getParentRoute(pathname, null, 'incident-log')}
                        name="Incident Log"
                    />
                    <BreadCrumbItem route={pathname} name="Incident" />
                    <div>
                        <div>
                            <div className="db-BackboneViewContainer">
                                <div className="react-settings-view react-view">
                                    <span>
                                        <div>
                                            <div>{variable}</div>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fade>
            </Dashboard>
        );
    }
}

const mapStateToProps = (state, props) => {
    const { componentId } = props.match.params;
    let component;
    state.component.componentList.components.forEach(item => {
        item.components.forEach(c => {
            if (String(c._id) === String(componentId)) {
                component = c;
            }
        });
    });

    return {
        currentProject: state.project.currentProject,
        incident: state.incident.incident.incident,
        incidentTimeline: state.incident.incident,
        count: state.alert.incidentalerts.count,
        skip: state.alert.incidentalerts.skip,
        limit: state.alert.incidentalerts.limit,
        subscribersAlerts: state.alert.subscribersAlert,
        deleting: state.incident.incident.deleteIncident
            ? state.incident.incident.deleteIncident.requesting
            : false,
        component,
    };
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            getMonitorLogs,
            fetchIncidentAlert,
            fetchSubscriberAlert,
            incidentRequest,
            incidentError,
            incidentSuccess,
            resetIncident,
            getIncident,
            getIncidentTimeline,
            fetchIncidentMessages,
        },
        dispatch
    );
};

Incident.propTypes = {
    currentProject: PropTypes.object,
    deleting: PropTypes.bool.isRequired,
    fetchIncidentAlert: PropTypes.func,
    fetchSubscriberAlert: PropTypes.func,
    getIncident: PropTypes.func,
    getIncidentTimeline: PropTypes.func,
    getMonitorLogs: PropTypes.func,
    incident: PropTypes.object,
    incidentTimeline: PropTypes.object,
    limit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    match: PropTypes.object,
    skip: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subscribersAlerts: PropTypes.object.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    component: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            _id: PropTypes.string,
        })
    ),
    fetchIncidentMessages: PropTypes.func,
};

Incident.displayName = 'Incident';

export default connect(mapStateToProps, mapDispatchToProps)(Incident);
