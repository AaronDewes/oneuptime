import React, { Component } from 'react';
import Fade from 'react-reveal/Fade';
import {
    subProjectTeamLoading,
    subProjectTeamLoadingRequest,
    subProjectTeamLoadingSuccess,
    subProjectTeamLoadingError,
    paginate,
} from '../actions/team';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v4 as uuidv4 } from 'uuid';
import { openModal, closeModal } from '../actions/modal';
import TeamMemberProjectBox from '../components/team/TeamMemberProjectBox';
import PropTypes from 'prop-types';
import RenderIfUserInSubProject from '../components/basic/RenderIfUserInSubProject';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS } from '../config';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';

const LoadingState = () => (
    <div className="Box-root Margin-bottom--12">
        <div className="bs-ContentSection Card-root Card-shadow--medium">
            <div className="Box-root">
                <div className="ContentState Box-root">
                    <div className="Box-root Padding-horizontal--20 Padding-vertical--48">
                        <div className="Box-root Flex-flex Flex-alignItems--center Flex-direction--column Flex-justifyContent--flexStart">
                            <div className="Box-root Margin-bottom--12">
                                <div className="Box-root">
                                    <div className="Spinner bs-SpinnerLegacy Spinner--size--large Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--center">
                                        <svg
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="Spinner-svg"
                                        >
                                            <ellipse
                                                cx={12}
                                                cy={12}
                                                rx={10}
                                                ry={10}
                                                className="Spinner-ellipse"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="Box-root">
                                <div className="Box-root">
                                    <span className="ContentState-title Text-align--center Text-color--secondary Text-display--block Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                        <span>Loading</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

LoadingState.displayName = 'LoadingState';

const LoadedTeam = props => {
    const {
        pages,
        inviteModalId,
        team,
        subProjects,
        currentProjectId,
        modalList,
    } = props;
    const membersPerPage = 10;

    // Add Project TeamMembers to All TeamMembers List
    let projectTeamMembers = team.subProjectTeamMembers.find(
        subProjectTeamMember => subProjectTeamMember._id === currentProjectId
    );
    const projectMembers = Object.assign({}, projectTeamMembers);
    const subProjectName =
        (props.subProjects &&
            props.subProjects.find(obj => obj._id === currentProjectId)
                ?.name) ||
        props.currentProject?.name;
    projectTeamMembers =
        projectTeamMembers && projectTeamMembers.teamMembers ? (
            <RenderIfUserInSubProject
                subProjectId={currentProjectId}
                key={() => uuidv4()}
            >
                <div className="bs-BIM">
                    <div className="Box-root Margin-bottom--12">
                        <div className="bs-ContentSection Card-root Card-shadow--medium">
                            <TeamMemberProjectBox
                                paginate={props.paginate}
                                canPaginateBackward={
                                    pages[currentProjectId] &&
                                    pages[currentProjectId] > 1
                                        ? true
                                        : false
                                }
                                canPaginateForward={
                                    projectMembers.count &&
                                    projectMembers.count >
                                        (pages[currentProjectId] || 1) *
                                            membersPerPage
                                        ? true
                                        : false
                                }
                                teamMembers={projectTeamMembers}
                                team={props.team}
                                subProjectName={subProjectName}
                                showProjectName={
                                    props.currentProject?.name !==
                                    subProjectName
                                }
                                currentProjectId={currentProjectId}
                                inviteModalId={inviteModalId}
                                openModal={props.openModal}
                                pages={pages}
                                membersPerPage={membersPerPage}
                                subProjects={subProjects}
                                allTeamLength={
                                    team.subProjectTeamMembers.length
                                }
                                modalList={modalList}
                            />
                        </div>
                    </div>
                </div>
            </RenderIfUserInSubProject>
        ) : (
            false
        );

    const allTeamMembers = projectTeamMembers && [projectTeamMembers];
    return allTeamMembers;
};

LoadedTeam.displayName = 'LoadedTeam';

LoadedTeam.propTypes = {
    team: PropTypes.object.isRequired,
    rowData: PropTypes.array.isRequired,
    pages: PropTypes.object.isRequired,
    openModal: PropTypes.func.isRequired,
    paginate: PropTypes.func.isRequired,
    inviteModalId: PropTypes.string.isRequired,
    subProjects: PropTypes.array.isRequired,
    modalList: PropTypes.array,
};

class TeamApp extends Component {
    constructor(props) {
        super(props);
        this.state = { inviteModalId: uuidv4() };
    }

    getTableHeaders() {
        return [
            {
                title: 'User',
            },
            {
                title: 'Role',
            },
            {
                title: 'Status',
            },
        ];
    }

    componentDidMount() {
        if (this.props.activeProjectId) {
            this.props.subProjectTeamLoading(this.props.activeProjectId);
        }
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('PAGE VIEW: DASHBOARD > PROJECT > TEAM MEMBERS');
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeProjectId !== this.props.activeProjectId) {
            this.props.subProjectTeamLoading(this.props.activeProjectId);
        }
    }

    componentWillUnmount() {
        this.props.paginate('reset');
    }

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                this.props.closeModal({ id: this.state.inviteModalId });
                return true;
            default:
                return false;
        }
    };

    render() {
        const {
            team: { teamLoading, teamMembers, pages },
            location: { pathname },
            currentProject,
            switchToProjectViewerNav,
        } = this.props;
        const { inviteModalId } = this.state;
        const projectName = currentProject ? currentProject.name : '';
        const projectId = currentProject ? currentProject._id : '';

        return (
            <Fade>
                <BreadCrumbItem
                    route="/"
                    name={projectName}
                    projectId={projectId}
                    slug={currentProject ? currentProject.slug : null}
                    switchToProjectViewerNav={switchToProjectViewerNav}
                />
                <BreadCrumbItem route={pathname} name="Team Members" />
                <div
                    onKeyDown={this.handleKeyBoard}
                    className="Margin-vertical--12"
                >
                    <div>
                        <div id="teamMemberPage">
                            <div className="db-BackboneViewContainer">
                                <div
                                    className="customers-list-view react-view popover-container"
                                    style={{
                                        position: 'relative',
                                        overflow: 'visible',
                                    }}
                                >
                                    {teamLoading.requesting ? (
                                        <LoadingState />
                                    ) : (
                                        <LoadedTeam
                                            inviteModalId={inviteModalId}
                                            rowData={teamMembers}
                                            header={this.getTableHeaders()}
                                            {...this.props}
                                            pages={pages}
                                            paginate={this.props.paginate}
                                            subProjects={this.props.subProjects}
                                            currentProjectId={
                                                this.props.activeProjectId
                                            }
                                            parent={pathname}
                                            modalList={this.props.modalList}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>
        );
    }
}

TeamApp.propTypes = {
    team: PropTypes.object.isRequired,
    subProjectTeamLoading: PropTypes.func.isRequired,
    currentProject: PropTypes.oneOfType([PropTypes.object]),
    closeModal: PropTypes.func.isRequired,
    paginate: PropTypes.func.isRequired,
    subProjects: PropTypes.array.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    modalList: PropTypes.array,
    switchToProjectViewerNav: PropTypes.bool,
    activeProjectId: PropTypes.string,
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
        team: state.team,
        currentProject: state.project.currentProject,
        subProjects,
        modalList: state.modal.modals,
        switchToProjectViewerNav: state.project.switchToProjectViewerNav,
        activeProjectId: state.subProject.activeSubProject,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            subProjectTeamLoading,
            subProjectTeamLoadingRequest,
            subProjectTeamLoadingSuccess,
            subProjectTeamLoadingError,
            openModal,
            closeModal,
            paginate,
        },
        dispatch
    );

TeamApp.displayName = 'TeamMembers';

export default connect(mapStateToProps, mapDispatchToProps)(TeamApp);
