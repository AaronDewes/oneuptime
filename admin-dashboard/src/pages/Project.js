import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';
import PropTypes from 'prop-types';
import ShouldRender from '../components/basic/ShouldRender';
import ProjectDetails from '../components/project/ProjectDetails';
import ProjectDeleteBox from '../components/project/ProjectDeleteBox';
import ProjectRestoreBox from '../components/project/ProjectRestoreBox';
import ProjectBlockBox from '../components/project/ProjectBlockBox';
import ProjectAlertLimitBox from '../components/project/ProjectAlertLimitBox';
import ProjectUnblockBox from '../components/project/ProjectUnblockBox';
import ProjectUsers from '../components/project/ProjectUsers';
import ProjectUpgrade from '../components/project/ProjectUpgrade';
import AdminNotes from '../components/adminNote/AdminNotes';
import { addProjectNote, fetchProject, paginate } from '../actions/project';
import { IS_SAAS_SERVICE } from '../config';
import { fetchProjectTeam } from '../actions/project';
import ProjectBalance from '../components/project/ProjectBalance';
import ProjectDomain from '../components/project/ProjectDomain';

class Project extends Component {
    componentDidMount() {
        if (window.location.href.indexOf('localhost') <= -1) {
            this.context.mixpanel.track('Project page Loaded');
        }
        this.props.fetchProject(this.props.slug);
        if (this.props.project._id) {
            this.props.fetchProjectTeam(this.props.project._id);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.project._id !== this.props.project._id) {
            if (this.props.project._id) {
                this.props.fetchProjectTeam(this.props.project._id);
            }
        }
    }

    ready = async () => {
        const { fetchProject, slug, fetchProjectTeam, project } = this.props;
        fetchProject(slug);
        if (project._id) {
            fetchProjectTeam(project._id);
        }
    };

    render() {        
        return (
            <Dashboard ready={this.ready}>
                <div className="Box-root Margin-vertical--12">
                    <div>
                        <div>
                            <div className="db-BackboneViewContainer">
                                <div className="react-settings-view react-view">
                                    <span data-reactroot="">
                                        <div>
                                            <div className="Box-root Margin-bottom--12">
                                                <ProjectDetails />
                                            </div>
                                            <div className="Box-root Margin-bottom--12">
                                                <AdminNotes
                                                    id={
                                                        this.props.project &&
                                                        this.props.project._id
                                                    }
                                                    addNote={
                                                        this.props
                                                            .addProjectNote
                                                    }
                                                    initialValues={
                                                        this.props.initialValues
                                                    }
                                                />
                                            </div>
                                            <div className="Box-root Margin-bottom--12">
                                                <ProjectUsers
                                                    paginate={
                                                        this.props.paginate
                                                    }
                                                    projectName={
                                                        this.props.project &&
                                                        this.props.project.name
                                                    }
                                                    users={
                                                        this.props
                                                            .projectUsers &&
                                                        this.props.projectUsers
                                                            .team
                                                    }
                                                    projectId={
                                                        this.props.project &&
                                                        this.props.project._id
                                                    }
                                                    pages={
                                                        this.props
                                                            .projectUsers &&
                                                        this.props.projectUsers
                                                            .page
                                                    }
                                                    membersPerPage={10}
                                                    count={
                                                        this.props
                                                            .projectUsers &&
                                                        this.props.projectUsers
                                                            .team &&
                                                        this.props.projectUsers
                                                            .team.count
                                                    }
                                                    page={
                                                        this.props
                                                            .projectUsers &&
                                                        this.props.projectUsers
                                                            .page
                                                    }
                                                    canPaginateBackward={
                                                        this.props
                                                            .projectUsers &&
                                                        this.props.projectUsers
                                                            .page > 1
                                                            ? true
                                                            : false
                                                    }
                                                    canPaginateForward={
                                                        this.props
                                                            .projectUsers &&
                                                        this.props.projectUsers
                                                            .team &&
                                                        this.props.projectUsers
                                                            .team.count >
                                                            this.props
                                                                .projectUsers
                                                                .page *
                                                                10
                                                            ? true
                                                            : false
                                                    }
                                                />
                                            </div>
                                            <div className="Box-root Margin-bottom--12">
                                                <ProjectDomain
                                                    projectId={
                                                        this.props.project &&
                                                        this.props.project._id
                                                    }
                                                />
                                            </div>
                                            <div className="Box-root Margin-bottom--12">
                                                <ProjectBalance
                                                    balance={
                                                        this.props.project &&
                                                        this.props.project
                                                            .balance
                                                    }
                                                    projectId={
                                                        this.props.project &&
                                                        this.props.project._id
                                                    }
                                                />
                                            </div>
                                            <ShouldRender
                                                if={
                                                    this.props.project &&
                                                    !this.props.project
                                                        .deleted &&
                                                    !this.props.project
                                                        .isBlocked &&
                                                    IS_SAAS_SERVICE
                                                }
                                            >
                                                <div className="Box-root Margin-bottom--12">
                                                    <ProjectUpgrade />
                                                </div>
                                            </ShouldRender>
                                            <ShouldRender
                                                if={
                                                    this.props.project &&
                                                    !this.props.project
                                                        .deleted &&
                                                    !this.props.project
                                                        .isBlocked
                                                }
                                            >
                                                <div className="Box-root Margin-bottom--12">
                                                    <ProjectBlockBox />
                                                </div>
                                            </ShouldRender>
                                            <ShouldRender
                                                if={
                                                    this.props.project &&
                                                    this.props.project
                                                        .alertLimitReached
                                                }
                                            >
                                                <div className="Box-root Margin-bottom--12">
                                                    <ProjectAlertLimitBox />
                                                </div>
                                            </ShouldRender>
                                            <ShouldRender
                                                if={
                                                    this.props.project &&
                                                    !this.props.project
                                                        .deleted &&
                                                    this.props.project.isBlocked
                                                }
                                            >
                                                <div className="Box-root Margin-bottom--12">
                                                    <ProjectUnblockBox />
                                                </div>
                                            </ShouldRender>
                                            <ShouldRender
                                                if={
                                                    this.props.project &&
                                                    !this.props.project.deleted
                                                }
                                            >
                                                <div className="Box-root Margin-bottom--12">
                                                    <ProjectDeleteBox />
                                                </div>
                                            </ShouldRender>
                                            <ShouldRender
                                                if={
                                                    this.props.project &&
                                                    this.props.project.deleted
                                                }
                                            >
                                                <div className="Box-root Margin-bottom--12">
                                                    <ProjectRestoreBox />
                                                </div>
                                            </ShouldRender>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dashboard>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            addProjectNote,
            fetchProject,
            fetchProjectTeam,
            paginate,
        },
        dispatch
    );
};

const mapStateToProps = (state, props) => {
    const project = state.project.project.project || {};
    const projectUsers = state.project.projectTeam;
    const { slug } = props.match.params;
    return {
        project,
        slug,
        projectUsers,
        adminNote: state.adminNote,
        initialValues: { adminNotes: project.adminNotes || [] },
    };
};

Project.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
};

Project.propTypes = {
    addProjectNote: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    fetchProject: PropTypes.func.isRequired,
    project: PropTypes.object.isRequired,
    fetchProjectTeam: PropTypes.func.isRequired,
    projectUsers: PropTypes.object.isRequired,
    paginate: PropTypes.func.isRequired,
    slug: PropTypes.string,
};

Project.displayName = 'Project';

export default connect(mapStateToProps, mapDispatchToProps)(Project);
