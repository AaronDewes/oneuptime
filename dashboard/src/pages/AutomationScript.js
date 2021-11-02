import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Fade from 'react-reveal/Fade';
import ShouldRender from '../components/basic/ShouldRender';
import { LoadingState } from '../components/basic/Loader';
import PropTypes from 'prop-types';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import { fetchAutomatedScript } from '../actions/automatedScript';
import NewScript from '../components/automationScript/NewScript';
import AutomatedTabularList from '../components/automationScript/AutomatedTabularList';

class AutomationScript extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toggleNewScript: false,
        };
    }
    componentDidMount() {
        const projectId = this.props.activeProject;
        if (projectId) {
            this.props.fetchAutomatedScript(projectId, 0, 10);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeProject !== this.props.activeProject) {
            const projectId = this.props.activeProject;
            this.props.fetchAutomatedScript(projectId, 0, 10);
        }
    }

    render() {
        const {
            location: { pathname },
            currentProject,
            switchToProjectViewerNav,
            subProjects,
            activeProject,
        } = this.props;

        const projectName = currentProject ? currentProject.name : '';
        const projectId = currentProject ? currentProject._id : '';

        const subProjectName =
            subProjects.find(obj => obj._id === activeProject)?.name ||
            currentProject.name;

        return (
            <Fade>
                <BreadCrumbItem
                    route="/"
                    name={projectName}
                    projectId={projectId}
                    slug={currentProject ? currentProject.slug : null}
                    switchToProjectViewerNav={switchToProjectViewerNav}
                />
                <BreadCrumbItem route={pathname} name="Automation Scripts" />
                <div id="automationScriptsPage">
                    <ShouldRender if={!this.state.toggleNewScript}>
                        <AutomatedTabularList
                            {...this.props}
                            toggleNewScript={() =>
                                this.setState({
                                    toggleNewScript: !this.state
                                        .toggleNewScript,
                                })
                            }
                            subProjectName={subProjectName}
                            showProjectName={
                                currentProject?.name !== subProjectName
                            }
                        />
                    </ShouldRender>
                </div>
                <ShouldRender if={this.state.toggleNewScript}>
                    <div className="Box-root">
                        <div>
                            <div>
                                <div className="db-BackboneViewContainer">
                                    <div className="dashboard-home-view react-view">
                                        <div>
                                            <div>
                                                <span>
                                                    <ShouldRender if={true}>
                                                        <NewScript
                                                            toggleNewScript={() =>
                                                                this.setState({
                                                                    toggleNewScript: !this
                                                                        .state
                                                                        .toggleNewScript,
                                                                })
                                                            }
                                                        />
                                                    </ShouldRender>

                                                    <ShouldRender if={false}>
                                                        <LoadingState />
                                                    </ShouldRender>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ShouldRender>
            </Fade>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            fetchAutomatedScript,
        },
        dispatch
    );
};

const mapStateToProps = state => {
    let subProjects = state.subProject.subProjects.subProjects;
    // sort subprojects names for display in alphabetical order
    const subProjectNames =
        subProjects && subProjects.map(subProject => subProject.name);
    subProjectNames && subProjectNames.sort();
    subProjects =
        subProjectNames &&
        subProjectNames.map(name =>
            subProjects.find(subProject => subProject.name === name)
        );
    return {
        currentProject: state.project.currentProject,
        activeProject: state.subProject.activeSubProject,
        switchToProjectViewerNav: state.project.switchToProjectViewerNav,
        subProjects,
    };
};

AutomationScript.propTypes = {
    projectId: PropTypes.string,
    fetchAutomatedScript: PropTypes.func.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    currentProject: PropTypes.object,
    switchToProjectViewerNav: PropTypes.bool,
    activeProject: PropTypes.string,
    subProjects: PropTypes.array,
};

AutomationScript.displayName = 'AutomationScript';

export default connect(mapStateToProps, mapDispatchToProps)(AutomationScript);
