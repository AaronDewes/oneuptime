import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SideNav from './nav/SideNav';
import TopNav from './nav/TopNav';
import { getProjects, switchProject } from '../actions/project';
import { getSubProjects } from '../actions/subProject';
import CreateProjectModal from './project/CreateProjectModal';
import UpgradePlanModal from './project/UpgradePlanModal';
import DeleteProjectModal from './project/DeleteProjectModal';
import { withRouter } from 'react-router-dom';
import ShouldRender from './basic/ShouldRender';
import ProfileMenu from './profile/ProfileMenu';
import { showForm } from '../actions/project';
import ClickOutside from 'react-click-outside';
import { hideProfileMenu } from '../actions/profile';
import NotificationMenu from './notification/NotificationMenu';
import { closeNotificationMenu } from '../actions/notification';
import UnVerifiedEmailBox from '../components/auth/UnVerifiedEmail';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS, User } from '../config';
import BreadCrumbItem from './breadCrumb/BreadCrumbItem';
import BreadCrumbs from './breadCrumb/BreadCrumbs';
import IncidentCreated from './incident/IncidentCreated';
import { closeModal } from '../actions/modal';

export class DashboardApp extends Component {
    // eslint-disable-next-line
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {
        const {
            project: { currentProject },
            ready,
        } = this.props;

        if (
            prevProps.project.currentProject &&
            prevProps.project.currentProject._id &&
            currentProject &&
            currentProject._id
        ) {
            if (prevProps.project.currentProject._id !== currentProject._id) {
                ready && ready();
            }
        }
    }

    componentDidMount() {
        const {
            project,
            ready,
            nextProject,
            projectId,
            dispatch,
            getProjects,
        } = this.props;

        // eslint-disable-next-line no-console
        console.log('******', nextProject, projectId);
        if (projectId === null && nextProject && nextProject._id) {
            // eslint-disable-next-line no-console
            console.log('******', 'cjeos');
            this.props.getSubProjects(nextProject._id).then(res => {
                const { data: subProjects } = res.data;
                this.props.switchProject(dispatch, nextProject, subProjects);
                this.props.switchToProjectViewerNav(
                    User.getUserId(),
                    subProjects,
                    nextProject
                );
            });
        }

        if (
            project.projects &&
            project.projects.projects &&
            project.projects.projects.length === 0 &&
            !project.projects.requesting
        ) {
            getProjects(this.props.projectId || null).then(() => {
                ready && ready();
            });
        } else {
            ready && ready();
        }
    }

    showProjectForm = () => {
        this.props.showForm();
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > SHOW PROJECT FORM');
        }
    };

    hideProfileMenu = () => {
        this.props.hideProfileMenu();
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > PROFILE MENU CLOSED');
        }
    };
    closeNotificationMenu = () => {
        this.props.closeNotificationMenu();
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > NOTIFICATIONS MENU CLOSED');
        }
    };

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                this.props.closeNotificationMenu();
                this.props.hideProfileMenu();
                this.closeModal();
                return true;
            default:
                return false;
        }
    };

    closeModal = () =>
        this.props.closeModal({
            id: this.props.currentModal ? this.props.currentModal.id : '',
        });

    render() {
        const {
            location,
            project,
            children,
            project: { currentProject },
            notification: {
                notifications: { notifications },
            },
            switchToProjectViewerNav,
        } = this.props;
        const projectName = currentProject ? currentProject.name : '';
        const projectId = currentProject ? currentProject._id : '';
        const incidentNotifications = notifications.filter(
            notification =>
                notification.read.length === 0 &&
                notification.meta &&
                notification.meta.type === 'Incident' &&
                !notification.closed.includes(User.getUserId())
        );

        const userProfile =
            location.pathname === '/dashboard/profile/billing' ||
            location.pathname === '/dashboard/profile/settings' ||
            location.pathname === '/dashboard/profile/changePassword' ||
            location.pathname === '/dashboard/profile/advanced';

        return (
            <Fragment>
                {userProfile ? (
                    <BreadCrumbItem route="#" name="Account" />
                ) : (
                    <BreadCrumbItem
                        route="/"
                        name={projectName}
                        projectId={projectId}
                        slug={currentProject ? currentProject.slug : null}
                        switchToProjectViewerNav={switchToProjectViewerNav}
                    />
                )}
                <CreateProjectModal />

                <UpgradePlanModal />

                <DeleteProjectModal />

                <ClickOutside onClickOutside={this.hideProfileMenu}>
                    <ProfileMenu visible={this.props.profile.menuVisible} />
                </ClickOutside>
                <ClickOutside onClickOutside={this.closeNotificationMenu}>
                    <NotificationMenu
                        visible={this.props.notification.notificationsVisible}
                    />
                </ClickOutside>

                <div onKeyDown={this.handleKeyBoard} className="db-World-root">
                    <div className="db-World-wrapper Box-root Flex-flex Flex-direction--column">
                        <ShouldRender if={userProfile}>
                            <div className="db-World-scrollWrapper">
                                <SideNav
                                    location={this.props.location}
                                    match={this.props.match}
                                />

                                <div className="db-World-mainPane Box-root Margin-top--60 Padding-right--20">
                                    <div className="db-World-contentPane Box-root Padding-bottom--48">
                                        {children}
                                    </div>
                                </div>

                                <TopNav projectId={projectId} />
                            </div>
                        </ShouldRender>

                        <ShouldRender
                            if={
                                !project.projects.requesting &&
                                project.projects.success &&
                                !userProfile
                            }
                        >
                            <div className="db-World-scrollWrapper">
                                <ShouldRender
                                    if={
                                        project.projects.projects !==
                                            undefined &&
                                        project.projects.projects[0]
                                    }
                                >
                                    <SideNav
                                        location={this.props.location}
                                        match={this.props.match}
                                    />

                                    <div className="db-World-mainPane Box-root Margin-top--60">
                                        <div className="db-World-contentPane Box-root Padding-bottom--48">
                                            <BreadCrumbs
                                                styles="breadCrumbContainer Card-shadow--medium db-mb"
                                                showDeleteBtn={
                                                    this.props.showDeleteBtn
                                                }
                                                close={this.props.close}
                                                name={this.props.name}
                                            />
                                            <ShouldRender
                                                if={
                                                    this.props.profile
                                                        .profileSetting.data &&
                                                    this.props.profile
                                                        .profileSetting.data
                                                        .email &&
                                                    !this.props.profile
                                                        .profileSetting.data
                                                        .isVerified
                                                }
                                            >
                                                <UnVerifiedEmailBox />
                                            </ShouldRender>
                                            {children}
                                        </div>
                                    </div>
                                </ShouldRender>

                                <TopNav projectId={projectId} />
                            </div>
                        </ShouldRender>

                        <ShouldRender if={project.projects.requesting}>
                            <div
                                id="app-loading"
                                style={{
                                    position: 'fixed',
                                    top: '0',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
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
                        </ShouldRender>

                        <ShouldRender if={project.projects.error}>
                            <div
                                id="app-loading"
                                style={{
                                    backgroundColor: '#E6EBF1',
                                    position: 'fixed',
                                    top: '0',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    zIndex: '999',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    padding: '0 10px',
                                }}
                            >
                                <div>Cannot connect to server.</div>
                            </div>
                        </ShouldRender>

                        <ShouldRender
                            if={
                                project.projects.success &&
                                project.projects.projects.length === 0 &&
                                !userProfile
                            }
                        >
                            <div>
                                <div
                                    id="app-loading"
                                    style={{
                                        position: 'fixed',
                                        top: '0',
                                        bottom: '0',
                                        left: '0',
                                        right: '0',
                                        zIndex: '1',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '20px',
                                        flexDirection: 'column',
                                        textAlign: 'center',
                                        padding: '0 10px',
                                    }}
                                >
                                    <div>
                                        You don&#39;t have any projects. Would
                                        you like to create one?
                                    </div>
                                    <div>
                                        <button
                                            id="createButton"
                                            className={
                                                'bs-Button bs-DeprecatedButton bs-Button--blue'
                                            }
                                            style={{
                                                alignSelf: 'flex-end',
                                                marginTop: '20px',
                                            }}
                                            onClick={this.showProjectForm}
                                        >
                                            <span>Create Project</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ShouldRender>
                    </div>
                </div>
                <ShouldRender
                    if={
                        incidentNotifications &&
                        incidentNotifications.length > 0
                    }
                >
                    <IncidentCreated
                        notifications={incidentNotifications}
                        slug={currentProject ? currentProject.slug : null}
                    />
                </ShouldRender>
            </Fragment>
        );
    }
}

DashboardApp.displayName = 'DashboardApp';

DashboardApp.propTypes = {
    project: PropTypes.object.isRequired,
    nextProject: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    notification: PropTypes.object.isRequired,
    match: PropTypes.object,
    getProjects: PropTypes.func,
    hideProfileMenu: PropTypes.func,
    closeNotificationMenu: PropTypes.func,
    showForm: PropTypes.func,
    location: PropTypes.object.isRequired,
    children: PropTypes.any,
    ready: PropTypes.func,
    projectId: PropTypes.string,
    currentModal: PropTypes.object,
    closeModal: PropTypes.func,
    showDeleteBtn: PropTypes.bool,
    close: PropTypes.func,
    name: PropTypes.string,
    switchToProjectViewerNav: PropTypes.bool,
    switchProject: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getSubProjects: PropTypes.func,
};

const mapStateToProps = state => ({
    project: state.project,
    profile: state.profileSettings,
    projectId: state.project.currentProject && state.project.currentProject._id,
    nextProject: state.project.projects && state.project.projects.projects[0],
    notification: state.notifications,
    currentModal:
        state.modal.modals && state.modal.modals.length > 0
            ? state.modal.modals[state.modal.modals.length - 1]
            : '',
    switchToProjectViewerNav: state.project.switchToProjectViewerNav,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getProjects,
            showForm,
            hideProfileMenu,
            closeNotificationMenu,
            closeModal,
            getSubProjects,
            switchProject,
            dispatch,
        },
        dispatch
    );

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(DashboardApp)
);
