import React, { Component } from 'react';
import Fade from 'react-reveal/Fade';
import Dashboard from '../components/Dashboard';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import ShouldRender from '../components/basic/ShouldRender';
import TutorialBox from '../components/tutorial/TutorialBox';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import NewApplicationLog from '../components/application/NewApplicationLog';
import getParentRoute from '../utils/getParentRoute';
import { SHOULD_LOG_ANALYTICS } from '../config';
import { fetchApplicationLogs } from '../actions/applicationLog';
import { bindActionCreators } from 'redux';
import { logEvent } from '../analytics';
import { loadPage } from '../actions/page';
import { ApplicationLogList } from '../components/application/ApplicationLogList';
import { LoadingState } from '../components/basic/Loader';
import LibraryList from '../components/application/LibraryList';

class ApplicationLog extends Component {
    componentDidMount() {
        this.props.loadPage('Logs');
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'PAGE VIEW: DASHBOARD > PROJECT > COMPONENT > APPLICATION LOG LIST'
            );
        }
    }
    ready = () => {
        const componentId = this.props.match.params.componentId
            ? this.props.match.params.componentId
            : null;
        const projectId = this.props.currentProject
            ? this.props.currentProject._id
            : null;

        this.props.fetchApplicationLogs(projectId, componentId);
    };
    render() {
        if (this.props.currentProject) {
            document.title = this.props.currentProject.name + ' Dashboard';
        }

        const {
            location: { pathname },
            component,
            componentId,
        } = this.props;

        const applicationLogsList =
            this.props.applicationLog.applicationLogs &&
            this.props.applicationLog.applicationLogs.length > 0 ? (
                <div
                    id={`box_${componentId}`}
                    className="Box-root Margin-vertical--12"
                >
                    <div
                        className="db-Trends Card-root"
                        style={{ overflow: 'visible' }}
                    >
                        <ApplicationLogList
                            componentId={componentId}
                            applicationLogs={
                                this.props.applicationLog.applicationLogs
                            }
                        />
                    </div>
                </div>
            ) : (
                false
            );

        const componentName =
            component.length > 0 && component[0] && component[0].name
                ? component[0].name
                : null;
        return (
            <Dashboard ready={this.ready}>
                <Fade>
                    <BreadCrumbItem
                        route={getParentRoute(pathname)}
                        name={componentName}
                    />
                    <BreadCrumbItem route={pathname} name="Logs" />
                    <div>
                        <div>
                            <ShouldRender
                                if={this.props.applicationLog.requesting}
                            >
                                <LoadingState />
                            </ShouldRender>
                            <ShouldRender
                                if={!this.props.applicationLog.requesting}
                            >
                                <div className="db-RadarRulesLists-page">
                                    <ShouldRender
                                        if={
                                            this.props.applicationLogTutorial
                                                .show
                                        }
                                    >
                                        <TutorialBox type="applicationLog" />
                                    </ShouldRender>
                                    <LibraryList />
                                    {applicationLogsList}
                                    <NewApplicationLog
                                        index={2000}
                                        formKey="NewApplicationLogForm"
                                        componentId={this.props.componentId}
                                    />
                                </div>
                            </ShouldRender>
                        </div>
                    </div>
                </Fade>
            </Dashboard>
        );
    }
}

ApplicationLog.displayName = 'ApplicationLog';

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            fetchApplicationLogs,
            loadPage,
        },
        dispatch
    );
};
const mapStateToProps = (state, props) => {
    const { componentId } = props.match.params;

    const applicationLog = state.applicationLog.applicationLogsList;

    const currentProject = state.project.currentProject;

    const component = state.component.componentList.components.map(item => {
        return item.components.find(component => component._id === componentId);
    });
    return {
        applicationLogTutorial: state.tutorial.applicationLog,
        componentId,
        component,
        applicationLog,
        currentProject,
    };
};
ApplicationLog.propTypes = {
    applicationLogTutorial: PropTypes.object,
    applicationLog: PropTypes.object,
    match: PropTypes.object,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    component: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        })
    ),
    componentId: PropTypes.string,
    loadPage: PropTypes.func,
    fetchApplicationLogs: PropTypes.func,
    currentProject: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
};
export default connect(mapStateToProps, mapDispatchToProps)(ApplicationLog);
