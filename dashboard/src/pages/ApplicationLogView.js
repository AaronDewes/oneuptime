import React, { Component } from 'react';
import Fade from 'react-reveal/Fade';
import { SHOULD_LOG_ANALYTICS } from '../config';
import { logEvent } from '../analytics';
import Dashboard from '../components/Dashboard';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import {
    fetchApplicationLogs,
    editApplicationLog,
} from '../actions/applicationLog';
import { fetchComponent } from '../actions/component';
import ApplicationLogDetail from '../components/application/ApplicationLogDetail';
import ApplicationLogViewDeleteBox from '../components/application/ApplicationLogViewDeleteBox';
import ShouldRender from '../components/basic/ShouldRender';
import { LoadingState } from '../components/basic/Loader';
import LibraryList from '../components/application/LibraryList';

class ApplicationLogView extends Component {
    componentDidMount() {
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'PAGE VIEW: DASHBOARD > PROJECT > COMPONENT > LOG CONTAINERS > LOG CONTAINER DETAIL PAGE'
            );
        }
    }
    ready = () => {
        const {
            componentSlug,
            fetchComponent,
            componentId,
            fetchApplicationLogs,
        } = this.props;
        const projectId =
            this.props.currentProject && this.props.currentProject._id;
        if (projectId && componentId) {
            componentSlug && fetchComponent(projectId, componentSlug);
            componentId && fetchApplicationLogs(projectId, componentId);
        }
    };

    componentDidUpdate(prevProps) {
        if (
            String(prevProps.componentSlug) !==
                String(this.props.componentSlug) ||
            prevProps.currentProject !== this.props.currentProject
        ) {
            if (
                this.props.currentProject &&
                this.props.currentProject._id &&
                this.props.componentSlug
            ) {
                this.props.fetchComponent(
                    this.props.currentProject._id,
                    this.props.componentSlug
                );
            }
        }

        if (prevProps.componentId !== this.props.componentId) {
            if (
                this.props.currentProject &&
                this.props.currentProject._id &&
                this.props.componentId
            ) {
                this.props.fetchApplicationLogs(
                    this.props.currentProject._id,
                    this.props.componentId
                );
            }
        }
    }

    handleCloseQuickStart = () => {
        const postObj = { showQuickStart: false };
        const projectId = this.props.currentProject
            ? this.props.currentProject._id
            : null;
        const { applicationLog } = this.props;
        this.props.editApplicationLog(
            projectId,
            applicationLog[0].componentId._id,
            applicationLog[0]._id,
            postObj
        );
    };
    render() {
        const {
            location: { pathname },
            component,
            componentId,
            applicationLog,
        } = this.props;

        const componentName = component ? component.name : '';
        const applicationLogName =
            applicationLog.length > 0 ? applicationLog[0].name : null;
        return (
            <Dashboard ready={this.ready}>
                <Fade>
                    <BreadCrumbItem
                        route={getParentRoute(
                            pathname,
                            null,
                            'application-log'
                        )}
                        name={componentName}
                    />
                    <BreadCrumbItem
                        route={getParentRoute(
                            pathname,
                            null,
                            'application-logs'
                        )}
                        name="Logs"
                    />
                    <BreadCrumbItem
                        route={pathname}
                        name={applicationLogName}
                        pageTitle="Logs"
                        containerType="Log Container"
                    />
                    <ShouldRender if={!this.props.applicationLog[0]}>
                        <LoadingState />
                    </ShouldRender>
                    <ShouldRender if={this.props.applicationLog[0]}>
                        {applicationLog[0] &&
                        applicationLog[0].showQuickStart ? (
                            <LibraryList
                                title="Log Container"
                                type="logs"
                                applicationLog={this.props.applicationLog[0]}
                                close={this.handleCloseQuickStart}
                            />
                        ) : null}
                        <div>
                            <ApplicationLogDetail
                                componentId={componentId}
                                index={this.props.applicationLog[0]?._id}
                                isDetails={true}
                                componentSlug={this.props.componentSlug}
                            />
                        </div>

                        <div className="Box-root Margin-bottom--12">
                            <ApplicationLogViewDeleteBox
                                componentId={this.props.componentId}
                                applicationLog={this.props.applicationLog[0]}
                                componentSlug={this.props.componentSlug}
                            />
                        </div>
                    </ShouldRender>
                </Fade>
            </Dashboard>
        );
    }
}

ApplicationLogView.displayName = 'ApplicationLogView';

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { fetchApplicationLogs, editApplicationLog, fetchComponent },
        dispatch
    );
};
const mapStateToProps = (state, props) => {
    const { componentSlug, applicationLogSlug } = props.match.params;
    const applicationLog = state.applicationLog.applicationLogsList.applicationLogs.filter(
        applicationLog => applicationLog.slug === applicationLogSlug
    );
    return {
        componentId:
            state.component.currentComponent.component &&
            state.component.currentComponent.component._id,
        applicationLog,
        componentSlug,
        component:
            state.component && state.component.currentComponent.component,
        currentProject: state.project.currentProject,
    };
};

ApplicationLogView.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    component: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        })
    ),
    componentId: PropTypes.string,
    fetchComponent: PropTypes.func,
    componentSlug: PropTypes.string,
    fetchApplicationLogs: PropTypes.func,
    currentProject: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    applicationLog: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            showQuickStart: PropTypes.bool,
            componentId: PropTypes.object,
        })
    ),
    editApplicationLog: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationLogView);
