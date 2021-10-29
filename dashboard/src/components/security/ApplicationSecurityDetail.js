import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import ShouldRender from '../basic/ShouldRender';
import { LargeSpinner } from '../basic/Loader';
import ApplicationSecurityView from './ApplicationSecurityView';
import {
    getApplicationSecurityBySlug,
    scanApplicationSecuritySuccess,
    getApplicationSecuritySuccess,
    getApplicationSecurityLog,
} from '../../actions/security';
import { fetchComponent } from '../../actions/component';
import ApplicationSecurityDeleteBox from './ApplicationSecurityDeleteBox';
import SecurityLog from './SecurityLog';
import { getGitCredentials } from '../../actions/credential';
import BreadCrumbItem from '../breadCrumb/BreadCrumbItem';
import getParentRoute from '../../utils/getParentRoute';
import { REALTIME_URL } from '../../config';
import io from 'socket.io-client';
import { Tab, Tabs, TabList, TabPanel, resetIdCounter } from 'react-tabs';
import Fade from 'react-reveal/Fade';

// Important: Below `/realtime` is also needed because `io` constructor strips out the path from the url.
// '/realtime' is set as socket io namespace, so remove
const socket = io.connect(REALTIME_URL.replace('/realtime', ''), {
    path: '/realtime/socket.io',
    transports: ['websocket', 'polling'],
});

// override socket for test
// const socket = { on: () => {} };
class ApplicationSecurityDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0,
        };
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.projectId !== this.props.projectId ||
            prevProps.componentSlug !== this.props.componentSlug
        ) {
            const {
                getGitCredentials,
                projectId,
                fetchComponent,
                componentSlug,
            } = this.props;
            if (projectId) {
                getGitCredentials({ projectId });
                fetchComponent(projectId, componentSlug);
            }
        }
        if (
            prevProps.projectId !== this.props.projectId ||
            prevProps.componentId !== this.props.componentId
        ) {
            const {
                projectId,
                componentId,
                applicationSecuritySlug,
                getApplicationSecurityBySlug,
            } = this.props;
            if (projectId && componentId) {
                // get a particular container security
                getApplicationSecurityBySlug({
                    projectId,
                    componentId,
                    applicationSecuritySlug,
                });
            }
        }
        if (
            prevProps.applicationSecurityId !== this.props.applicationSecurityId
        ) {
            const {
                projectId,
                componentId,
                applicationSecurityId,
                getApplicationSecurityLog,
            } = this.props;
            if (applicationSecurityId) {
                // get a container security log
                getApplicationSecurityLog({
                    projectId,
                    componentId,
                    applicationSecurityId,
                });
            }
        }
    }
    componentWillMount() {
        resetIdCounter();
    }
    componentDidMount() {
        const {
            projectId,
            componentId,
            applicationSecuritySlug,
            getApplicationSecurityBySlug,
            getGitCredentials,
            fetchComponent,
            componentSlug,
            applicationSecurityId,
            getApplicationSecurityLog,
        } = this.props;
        if (projectId) {
            getGitCredentials({ projectId });
            fetchComponent(projectId, componentSlug);
        }
        if (projectId && componentId) {
            // get a particular container security
            getApplicationSecurityBySlug({
                projectId,
                componentId,
                applicationSecuritySlug,
            });
        }
        if (applicationSecurityId) {
            // get a container security log
            getApplicationSecurityLog({
                projectId,
                componentId,
                applicationSecurityId,
            });
        }
    }

    tabSelected = index => {
        const tabSlider = document.getElementById('tab-slider');
        tabSlider.style.transform = `translate(calc(${tabSlider.offsetWidth}px*${index}), 0px)`;
        this.setState({
            tabIndex: index,
        });
    };

    render() {
        const {
            applicationSecurity,
            projectId,
            componentId,
            componentSlug,
            applicationSecurityId,
            applicationSecuritySlug,
            isRequesting,
            getApplicationError,
            gettingSecurityLog,
            applicationSecurityLog,
            gettingCredentials,
            fetchCredentialError,
            fetchLogError,
            location: { pathname },
            components,
            scanApplicationSecuritySuccess,
            getApplicationSecuritySuccess,
            currentProject,
            switchToProjectViewerNav,
        } = this.props;

        socket.on(`security_${applicationSecurityId}`, data => {
            getApplicationSecuritySuccess(data);
        });

        socket.on(`securityLog_${applicationSecurityId}`, data => {
            scanApplicationSecuritySuccess(data);
        });

        const componentName =
            components.length > 0 ? components[0].name : 'loading...';
        const projectName = currentProject ? currentProject.name : '';

        return (
            <div className="Box-root Margin-bottom--12">
                <BreadCrumbItem
                    route="/"
                    name={projectName}
                    projectId={projectId || ''}
                    slug={currentProject ? currentProject.slug : null}
                    switchToProjectViewerNav={switchToProjectViewerNav}
                />
                <BreadCrumbItem
                    route={getParentRoute(pathname, null, 'component')}
                    name={componentName}
                />
                <BreadCrumbItem
                    route={getParentRoute(
                        pathname,
                        null,
                        'applicationSecurityId'
                    )}
                    name="Application Security"
                />
                <BreadCrumbItem
                    route={pathname}
                    name={applicationSecurity.name || 'loading...'}
                    pageTitle="Application Detail"
                    containerType="Application Security"
                />
                <Tabs
                    selectedTabClassName={'custom-tab-selected'}
                    onSelect={tabIndex => this.tabSelected(tabIndex)}
                    selectedIndex={this.state.tabIndex}
                >
                    <div className="Flex-flex Flex-direction--columnReverse">
                        <TabList
                            id="customTabList"
                            className={'custom-tab-list'}
                        >
                            <Tab
                                className={'custom-tab custom-tab-2 basic-tab'}
                            >
                                Basic
                            </Tab>
                            <Tab
                                className={
                                    'custom-tab custom-tab-2 advanced-options-tab'
                                }
                            >
                                Advanced Options
                            </Tab>
                            <div id="tab-slider" className="custom-tab-2"></div>
                        </TabList>
                    </div>
                    <TabPanel>
                        <Fade>
                            <ShouldRender
                                if={
                                    isRequesting &&
                                    gettingSecurityLog &&
                                    gettingCredentials
                                }
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <LargeSpinner />
                                </div>
                            </ShouldRender>
                            <ShouldRender
                                if={
                                    applicationSecurity.name &&
                                    !gettingSecurityLog &&
                                    !gettingCredentials
                                }
                            >
                                <ApplicationSecurityView
                                    projectId={projectId}
                                    componentId={componentId}
                                    applicationSecurityId={
                                        applicationSecurityId
                                    }
                                    applicationSecuritySlug={
                                        applicationSecuritySlug
                                    }
                                    isRequesting={isRequesting}
                                    applicationSecurity={applicationSecurity}
                                    componentSlug={componentSlug}
                                />
                            </ShouldRender>
                            <ShouldRender
                                if={
                                    applicationSecurity.name &&
                                    !gettingSecurityLog &&
                                    !gettingCredentials
                                }
                            >
                                <SecurityLog
                                    type="Application"
                                    applicationSecurityLog={
                                        applicationSecurityLog
                                    }
                                />
                            </ShouldRender>
                            <ShouldRender
                                if={
                                    !isRequesting &&
                                    !gettingSecurityLog &&
                                    !gettingCredentials &&
                                    (getApplicationError ||
                                        fetchCredentialError ||
                                        fetchLogError)
                                }
                            >
                                {getApplicationError ||
                                    fetchCredentialError ||
                                    fetchLogError}
                            </ShouldRender>
                        </Fade>
                    </TabPanel>
                    <TabPanel>
                        <Fade>
                            <ShouldRender
                                if={
                                    applicationSecurity.name &&
                                    !gettingSecurityLog &&
                                    !gettingCredentials
                                }
                            >
                                <ApplicationSecurityDeleteBox
                                    projectId={projectId}
                                    componentId={componentId}
                                    applicationSecurityId={
                                        applicationSecurityId
                                    }
                                    applicationSecuritySlug={
                                        applicationSecuritySlug
                                    }
                                    componentSlug={componentSlug}
                                />
                            </ShouldRender>
                        </Fade>
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}

ApplicationSecurityDetail.displayName = 'Application Security Detail';

ApplicationSecurityDetail.propTypes = {
    projectId: PropTypes.string,
    componentId: PropTypes.string,
    componentSlug: PropTypes.string,
    applicationSecurityId: PropTypes.string,
    fetchComponent: PropTypes.func,
    getApplicationSecurityLog: PropTypes.func,
    applicationSecuritySlug: PropTypes.string,
    getApplicationSecurityBySlug: PropTypes.func,
    applicationSecurity: PropTypes.object,
    isRequesting: PropTypes.bool,
    getApplicationError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    gettingSecurityLog: PropTypes.bool,
    applicationSecurityLog: PropTypes.object,
    getGitCredentials: PropTypes.func,
    gettingCredentials: PropTypes.bool,
    fetchLogError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    fetchCredentialError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    components: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        })
    ),
    scanApplicationSecuritySuccess: PropTypes.func,
    getApplicationSecuritySuccess: PropTypes.func,
    switchToProjectViewerNav: PropTypes.bool,
    currentProject: PropTypes.object,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getGitCredentials,
            scanApplicationSecuritySuccess,
            getApplicationSecuritySuccess,
            getApplicationSecurityLog,
            fetchComponent,
            getApplicationSecurityBySlug,
        },
        dispatch
    );

const mapStateToProps = (state, ownProps) => {
    const { componentSlug, applicationSecuritySlug } = ownProps.match.params;
    const components = [];
    // filter to get the actual component
    state.component.componentList.components.map(item =>
        item.components.map(component => {
            if (String(component.slug) === String(componentSlug)) {
                components.push(component);
            }
            return component;
        })
    );
    const projectId =
        state.project.currentProject && state.project.currentProject._id;
    return {
        projectId,
        componentId:
            state.component.currentComponent.component &&
            state.component.currentComponent.component._id,

        componentSlug,
        applicationSecuritySlug,
        applicationSecurityId: state.security.applicationSecurity._id,
        applicationSecurity: state.security.applicationSecurity,
        isRequesting: state.security.getApplication.requesting,
        getApplicationError: state.security.getApplication.error,
        gettingSecurityLog: state.security.getApplicationSecurityLog.requesting,
        applicationSecurityLog: state.security.applicationSecurityLog || {},
        gettingCredentials: state.credential.getCredential.requesting,
        fetchLogError: state.security.getApplicationSecurityLog.error,
        fetchCredentialError: state.credential.getCredential.error,
        components,
        switchToProjectViewerNav: state.project.switchToProjectViewerNav,
        currentProject: state.project.currentProject,
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ApplicationSecurityDetail)
);
