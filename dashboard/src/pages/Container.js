import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import Fade from 'react-reveal/Fade';
import ContainerSecurityForm from '../components/security/ContainerSecurityForm';
import ContainerSecurity from '../components/security/ContainerSecurity';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS, REALTIME_URL } from '../config';
import {
    getContainerSecurities,
    getContainerSecurityLogs,
    scanContainerSecuritySuccess,
    getContainerSecuritySuccess,
} from '../actions/security';
import { fetchComponent } from '../actions/component';
import { LargeSpinner } from '../components/basic/Loader';
import ShouldRender from '../components/basic/ShouldRender';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';
import io from 'socket.io-client';
import sortByName from '../utils/sortByName';
import { history } from '../store';

// Important: Below `/api` is also needed because `io` constructor strips out the path from the url.
const socket = io.connect(REALTIME_URL.replace('/api', ''), {
    path: '/api/socket.io',
    transports: ['websocket', 'polling'],
});
class Container extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    componentDidMount() {
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('Container Security page Loaded');
        }
        const {
            projectId,
            componentId,
            getContainerSecurities,
            getContainerSecurityLogs,
            componentSlug,
            fetchComponent,
        } = this.props;
        if (projectId && componentSlug) {
            fetchComponent(projectId, componentSlug);
        }
        if (projectId && componentId) {
            // load container security logs
            getContainerSecurityLogs({ projectId, componentId });

            // load container security
            getContainerSecurities({ projectId, componentId });
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.projectId !== this.props.projectId ||
            prevProps.componentId !== this.props.componentId
        ) {
            const {
                projectId,
                componentId,
                getContainerSecurities,
                getContainerSecurityLogs,
            } = this.props;
            if (projectId && componentId) {
                // load container security logs
                getContainerSecurityLogs({ projectId, componentId });

                // load container security
                getContainerSecurities({ projectId, componentId });
            }
        }
        if (
            prevProps.projectId !== this.props.projectId ||
            prevProps.componentSlug !== this.props.componentSlug
        ) {
            const { projectId, fetchComponent, componentSlug } = this.props;
            if (projectId) {
                fetchComponent(projectId, componentSlug);
            }
        }
    }

    render() {
        const {
            componentId,
            componentSlug,
            projectId,
            containerSecurities: securities,
            gettingContainerSecurities,
            gettingSecurityLogs,
            location: { pathname },
            component,
            scanContainerSecuritySuccess,
            getContainerSecuritySuccess,
        } = this.props;

        socket.on(`createContainerSecurity-${componentId}`, data => {
            history.push(
                `/dashboard/project/${this.props.slug}/component/${componentSlug}/security/container/${data.slug}`
            );
        });

        const containerSecurities = securities ? sortByName(securities) : [];
        containerSecurities.length > 0 &&
            containerSecurities.map(containerSecurity => {
                socket.on(`security_${containerSecurity._id}`, data => {
                    getContainerSecuritySuccess(data);
                });

                socket.on(`securityLog_${containerSecurity._id}`, data => {
                    scanContainerSecuritySuccess(data);
                });

                return containerSecurity;
            });

        const componentName = component ? component.name : '';

        return (
            <Fade>
                <BreadCrumbItem
                    route={getParentRoute(pathname, null, 'component')}
                    name={componentName}
                />
                <BreadCrumbItem
                    route={pathname}
                    name="Container Security"
                    pageTitle="Container"
                />
                <div className="Margin-vertical--12">
                    <div>
                        <div className="db-BackboneViewContainer">
                            <div className="react-settings-view react-view">
                                <ShouldRender
                                    if={
                                        gettingContainerSecurities &&
                                        gettingSecurityLogs
                                    }
                                >
                                    <div
                                        id="largeSpinner"
                                        style={{ textAlign: 'center' }}
                                    >
                                        <LargeSpinner />
                                    </div>
                                </ShouldRender>
                                <ShouldRender
                                    if={
                                        !gettingContainerSecurities &&
                                        !gettingSecurityLogs
                                    }
                                >
                                    {containerSecurities.length > 0 &&
                                        containerSecurities.map(
                                            containerSecurity => {
                                                return (
                                                    <span
                                                        key={
                                                            containerSecurity._id
                                                        }
                                                    >
                                                        <div>
                                                            <div>
                                                                <ContainerSecurity
                                                                    name={
                                                                        containerSecurity.name
                                                                    }
                                                                    dockerRegistryUrl={
                                                                        containerSecurity.dockerRegistryUrl
                                                                    }
                                                                    imagePath={
                                                                        containerSecurity.imagePath
                                                                    }
                                                                    containerSecurityId={
                                                                        containerSecurity._id
                                                                    }
                                                                    containerSecuritySlug={
                                                                        containerSecurity.slug
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
                                            <ContainerSecurityForm
                                                componentId={componentId}
                                                projectId={projectId}
                                            />
                                        </div>
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>
        );
    }
}

Container.displayName = 'Container Security Page';

Container.propTypes = {
    projectId: PropTypes.string,
    componentId: PropTypes.string,
    componentSlug: PropTypes.string,
    fetchComponent: PropTypes.func,
    slug: PropTypes.string,
    containerSecurities: PropTypes.array,
    getContainerSecurities: PropTypes.func,
    getContainerSecurityLogs: PropTypes.func,
    gettingSecurityLogs: PropTypes.bool,
    gettingContainerSecurities: PropTypes.bool,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    component: PropTypes.object,
    scanContainerSecuritySuccess: PropTypes.func,
    getContainerSecuritySuccess: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
    // ids from url
    const { componentSlug } = ownProps.match.params;

    return {
        projectId:
            state.project.currentProject && state.project.currentProject._id,
        componentId:
            state.component.currentComponent.component &&
            state.component.currentComponent.component._id,
        slug: state.project.currentProject && state.project.currentProject.slug,
        containerSecurities: state.security.containerSecurities,
        gettingSecurityLogs: state.security.getContainerSecurityLog.requesting,
        gettingContainerSecurities: state.security.getContainer.requesting,
        component:
            state.component && state.component.currentComponent.component,
        componentSlug,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getContainerSecurities,
            getContainerSecurityLogs,
            scanContainerSecuritySuccess,
            getContainerSecuritySuccess,
            fetchComponent,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(Container);
