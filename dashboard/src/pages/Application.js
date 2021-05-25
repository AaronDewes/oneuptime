import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Fade from 'react-reveal/Fade';
import Dashboard from '../components/Dashboard';
import ApplicationSecurityForm from '../components/security/ApplicationSecurityForm';
import ApplicationSecurity from '../components/security/ApplicationSecurity';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS, API_URL } from '../config';
import {
    getApplicationSecurities,
    getApplicationSecurityLogs,
    scanApplicationSecuritySuccess,
    getApplicationSecuritySuccess,
} from '../actions/security';
import { LargeSpinner } from '../components/basic/Loader';
import { fetchComponent } from '../actions/component';
import ShouldRender from '../components/basic/ShouldRender';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';
import io from 'socket.io-client';
import sortByName from '../utils/sortByName';
import { history } from '../store';

// Important: Below `/api` is also needed because `io` constructor strips out the path from the url.
const socket = io.connect(API_URL.replace('/api', ''), {
    path: '/api/socket.io',
    transports: ['websocket', 'polling'],
});

class Application extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    componentDidMount() {
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('Application Security page Loaded');
        }
        const {
            projectId,
            componentId,
            getApplicationSecurities,
            getApplicationSecurityLogs,
            componentSlug,
            fetchComponent,
        } = this.props;
        if (projectId && componentSlug) {
            fetchComponent(projectId, componentSlug);
        }
        if (projectId && componentId) {
            // load container security logs
            getApplicationSecurityLogs({ projectId, componentId });

            // load container security
            getApplicationSecurities({ projectId, componentId });
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.projectId !== this.props.projectId ||
            prevProps.componentId !== this.props.componentId ||
            prevProps.componentSlug !== this.props.componentSlug
        ) {
            const {
                projectId,
                componentId,
                componentSlug,
                fetchComponent,
                getApplicationSecurities,
                getApplicationSecurityLogs,
            } = this.props;
            if (projectId) {
                fetchComponent(projectId, componentSlug);
            }
            if (projectId && componentId) {
                // load container security logs
                getApplicationSecurityLogs({ projectId, componentId });

                // load container security
                getApplicationSecurities({ projectId, componentId });
            }
        }
    }

    ready = () => {
        const {
            componentId,
            projectId,
            getApplicationSecurities,
            getApplicationSecurityLogs,
            componentSlug,
            fetchComponent,
        } = this.props;
        if (projectId && componentId) {
            // load all the available logs
            getApplicationSecurityLogs({ projectId, componentId });

            // load all the application securities
            getApplicationSecurities({ projectId, componentId });
        }
        if (componentSlug && projectId) {
            fetchComponent(projectId, componentSlug);
        }
    };

    render() {
        const {
            projectId,
            componentId,
            applicationSecurities: appSecurities,
            gettingApplicationSecurities,
            gettingSecurityLogs,
            location: { pathname },
            component,
            componentSlug,
            scanApplicationSecuritySuccess,
            getApplicationSecuritySuccess,
        } = this.props;

        socket.on(`createApplicationSecurity-${componentId}`, data => {
            history.push(
                `/dashboard/project/${this.props.slug}/component/${componentSlug}/security/application/${data.slug}`
            );
        });
        const applicationSecurities = appSecurities
            ? sortByName(appSecurities)
            : [];

        applicationSecurities.length > 0 &&
            applicationSecurities.forEach(applicationSecurity => {
                socket.on(`security_${applicationSecurity._id}`, data => {
                    getApplicationSecuritySuccess(data);
                });

                socket.on(`securityLog_${applicationSecurity._id}`, data => {
                    scanApplicationSecuritySuccess(data);
                });
            });

        const componentName = component ? component.name : '';

        return (
            <Dashboard ready={this.ready}>
                <Fade>
                    <BreadCrumbItem
                        route={getParentRoute(pathname, null, 'component')}
                        name={componentName}
                    />
                    <BreadCrumbItem
                        route={pathname}
                        name="Application Security"
                        pageTitle="Application"
                    />
                    <div className="Margin-vertical--12">
                        <div>
                            <div className="db-BackboneViewContainer">
                                <div className="react-settings-view react-view">
                                    <ShouldRender
                                        if={
                                            gettingApplicationSecurities &&
                                            gettingSecurityLogs
                                        }
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <LargeSpinner />
                                        </div>
                                    </ShouldRender>
                                    <ShouldRender
                                        if={
                                            !gettingApplicationSecurities &&
                                            !gettingSecurityLogs
                                        }
                                    >
                                        {applicationSecurities.length > 0 &&
                                            applicationSecurities.map(
                                                applicationSecurity => {
                                                    return (
                                                        <span
                                                            key={
                                                                applicationSecurity._id
                                                            }
                                                        >
                                                            <div>
                                                                <div>
                                                                    <ApplicationSecurity
                                                                        name={
                                                                            applicationSecurity.name
                                                                        }
                                                                        applicationSecurityId={
                                                                            applicationSecurity._id
                                                                        }
                                                                        applicationSecuritySlug={
                                                                            applicationSecurity.slug
                                                                        }
                                                                        projectId={
                                                                            projectId
                                                                        }
                                                                        componentId={
                                                                            componentId
                                                                        }
                                                                        componentSlug={
                                                                            componentSlug
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </span>
                                                    );
                                                }
                                            )}
                                    </ShouldRender>
                                    <span>
                                        <div>
                                            <div>
                                                <ApplicationSecurityForm
                                                    projectId={projectId}
                                                    componentId={componentId}
                                                />
                                            </div>
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

Application.displayName = 'Application Security Page';

Application.propTypes = {
    componentId: PropTypes.string,
    componentSlug: PropTypes.string,
    slug: PropTypes.string,
    projectId: PropTypes.string,
    fetchComponent: PropTypes.func,
    getApplicationSecurities: PropTypes.func,
    applicationSecurities: PropTypes.array,
    getApplicationSecurityLogs: PropTypes.func,
    gettingSecurityLogs: PropTypes.bool,
    gettingApplicationSecurities: PropTypes.bool,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    component: PropTypes.object,
    scanApplicationSecuritySuccess: PropTypes.func,
    getApplicationSecuritySuccess: PropTypes.func,
};

const mapStateToProps = (state, props) => {
    const { componentSlug } = props.match.params;
    return {
        componentId:
            state.component.currentComponent.component &&
            state.component.currentComponent.component._id,
        projectId:
            state.project.currentProject && state.project.currentProject._id,
        slug: state.project.currentProject && state.project.currentProject.slug,
        applicationSecurities: state.security.applicationSecurities,
        gettingSecurityLogs:
            state.security.getApplicationSecurityLog.requesting,
        gettingApplicationSecurities: state.security.getApplication.requesting,
        component:
            state.component && state.component.currentComponent.component,
        componentSlug,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getApplicationSecurities,
            getApplicationSecurityLogs,
            scanApplicationSecuritySuccess,
            getApplicationSecuritySuccess,
            fetchComponent,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(Application);
