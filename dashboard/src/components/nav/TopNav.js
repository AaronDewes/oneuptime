import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FeedBackModal from '../FeedbackModal';
import { showProfileMenu } from '../../actions/profile';
import { openNotificationMenu } from '../../actions/notification';
import { openFeedbackModal, closeFeedbackModal } from '../../actions/feedback';
import ClickOutside from 'react-click-outside';
import { userSettings } from '../../actions/profile';
import { getVersion } from '../../actions/version';
import { openSideNav } from '../../actions/page';
import { API_URL, User } from '../../config';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS } from '../../config';
import { history } from '../../store';
import { fetchSubProjectOngoingScheduledEvents } from '../../actions/scheduledEvent';
import ShouldRender from '../basic/ShouldRender';

class TopContent extends Component {
    componentDidMount() {
        const {
            userSettings,
            getVersion,
            currentProject,
            fetchSubProjectOngoingScheduledEvents,
        } = this.props;
        userSettings();
        getVersion();
        if (currentProject && currentProject._id) {
            fetchSubProjectOngoingScheduledEvents(currentProject._id);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentProject !== this.props.currentProject) {
            this.props.fetchSubProjectOngoingScheduledEvents(
                this.props.currentProject._id
            );
        }
    }

    showFeedbackModal = () => {
        this.props.openFeedbackModal();
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > FEEDBACK MODAL OPENED', {});
        }
    };

    hideFeedbackModal = () => {
        this.props.closeFeedbackModal();
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > FEEDBACK MODAL CLOSED', {});
        }
    };

    showProfileMenu = e => {
        this.props.showProfileMenu(e.clientX);
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > PROFILE MENU OPENED', {});
        }
    };

    showNotificationsMenu = e => {
        this.props.openNotificationMenu(e.clientX);
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > NOTIFICATION MENU OPENED', {});
        }
    };

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                this.hideFeedbackModal();
                return true;
            default:
                return false;
        }
    };

    handleActiveIncidentClick = () => {
        const projectId = this.props.currentProject
            ? this.props.currentProject._id
            : '';
        history.push(`/dashboard/project/${projectId}`);
    };

    renderActiveIncidents = incidentCounter => (
        <div
            className={`Box-root Flex-flex Flex-direction--row Flex-alignItems--center Box-background--${
                incidentCounter > 0 ? 'red' : 'green'
            } Text-color--white Border-radius--4 Text-fontWeight--bold Padding-left--8 Padding-right--8 Padding-top--4 Padding-bottom--4 pointer`}
            onClick={this.handleActiveIncidentClick}
            id="activeIncidents"
        >
            <span
                className={`db-SideNav-icon db-SideNav-icon--${
                    incidentCounter > 0 ? 'info' : 'tick'
                } db-SideNav-icon--selected`}
                style={{
                    filter: 'brightness(0) invert(1)',
                    marginTop: '1px',
                    marginRight: '5px',
                }}
            />
            <span id="activeIncidentsText">
                <ShouldRender if={incidentCounter > 0}>
                    {`${incidentCounter +
                        (incidentCounter === 1
                            ? ' Incident Currently Active'
                            : ' Incidents Currently Active')}`}
                </ShouldRender>
                <ShouldRender if={incidentCounter === 0}>
                    No incidents currently active.
                </ShouldRender>
            </span>
        </div>
    );

    renderOngoingScheduledEvents = () => {
        const { subProjectOngoingScheduledEvents } = this.props;
        let count = 0;
        subProjectOngoingScheduledEvents.forEach(eventData => {
            count += eventData.count;
        });
        return count > 0 ? (
            <div
                className="Box-root box__yellow--dark Flex-flex Flex-direction--row Flex-alignItems--center Text-color--white Border-radius--4 Text-fontWeight--bold Padding-left--8 Padding-right--8 Padding-top--4 Padding-bottom--4 pointer Margin-left--20"
                onClick={this.handleActiveIncidentClick}
                id="ongoingEvents"
            >
                <span
                    className="db-SideNav-icon db-SideNav-icon--connect db-SideNav-icon--selected"
                    style={{
                        filter: 'brightness(0) invert(1)',
                        marginTop: '-1px',
                        marginRight: '5px',
                    }}
                />
                <span id="ongoingEventsText">{`${count} Scheduled Event${
                    count === 1 ? '' : 's'
                } Currently Active`}</span>
            </div>
        ) : null;
    };

    render() {
        const IMG_URL =
            this.props.profilePic &&
            this.props.profilePic !== '' &&
            this.props.profilePic !== 'null'
                ? `url(${API_URL}/file/${this.props.profilePic})`
                : 'url(https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y)';
        const userId = User.getUserId();
        let count = 0;
        if (
            this.props.notifications &&
            this.props.notifications.notifications &&
            this.props.notifications.notifications.length
        ) {
            this.props.notifications.notifications.map(notification => {
                if (notification.read.indexOf(userId) > -1) {
                    return notification;
                } else {
                    count++;
                    return notification;
                }
            });
        }
        let incidentCounter = 0;
        if (
            this.props.incidents &&
            this.props.incidents.incidents &&
            this.props.incidents.incidents.length > 0
        ) {
            incidentCounter = this.props.incidents.incidents.filter(
                incident => !incident.resolved
            ).length;
        }
        const monitorCount = this.props.monitors
            ? this.props.monitors.count
            : 0;

        return (
            <div
                tabIndex="0"
                onKeyDown={this.handleKeyBoard}
                style={{ zIndex: '2' }}
                className="db-World-topContent Box-root Box-background--transparent Padding-vertical--20"
            >
                <div className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween">
                    <div className="Box-root" onClick={this.props.openSideNav}>
                        <div className="db-MenuContainer">
                            <div
                                className={
                                    'db-MenuIcon Box-root Box-background--white'
                                }
                            >
                                <div className="db-MenuIcon--content db-MenuIcon--menu" />
                            </div>
                        </div>
                    </div>

                    <ClickOutside onClickOutside={this.hideFeedbackModal}>
                        <FeedBackModal />
                    </ClickOutside>

                    <div className="Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                        {monitorCount > 0
                            ? this.renderActiveIncidents(incidentCounter)
                            : null}
                        {this.renderOngoingScheduledEvents()}
                        <div className="Box-root Margin-right--16">
                            <div
                                id="feedback-div"
                                className="db-FeedbackInput-container Card-root Card-shadow--small"
                                onClick={this.showFeedbackModal}
                            >
                                <div className="db-FeedbackInput-box Box-root Box-background--offset Flex-flex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--4">
                                    <div className="Box-root Flex-flex Margin-right--8">
                                        <span className="db-FeedbackInput-defaultIcon" />
                                    </div>

                                    <div
                                        style={{
                                            overflow: 'hidden',
                                            textOveerflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <span className="Text-color--disabled Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                            {}
                                            {this.props.feedback.feedback
                                                .success ||
                                            this.props.feedback.feedback
                                                .requesting ? (
                                                <span>
                                                    Thank you for your feedback.
                                                </span>
                                            ) : null}
                                            {!this.props.feedback.feedback
                                                .success &&
                                            !this.props.feedback.feedback
                                                .requesting &&
                                            !this.props.feedback.feedback
                                                .error ? (
                                                <span>
                                                    Feedback about this page?
                                                </span>
                                            ) : null}
                                            {this.props.feedback.feedback
                                                .error ? (
                                                <span>
                                                    Sorry, Please try again.
                                                </span>
                                            ) : null}
                                        </span>
                                    </div>
                                    <span />
                                </div>
                                <span />
                            </div>
                        </div>

                        <div className="Box-root Flex-flex">
                            <div
                                tabIndex="-1"
                                style={{ outline: 'none', marginRight: '15px' }}
                            >
                                <button
                                    className={
                                        count
                                            ? 'db-Notifications-button active-notification'
                                            : 'db-Notifications-button'
                                    }
                                    onClick={this.showNotificationsMenu}
                                >
                                    <span className="db-Notifications-icon db-Notifications-icon--empty" />
                                </button>
                            </div>
                        </div>
                        <div className="Box-root">
                            <div>
                                <div className="Box-root Flex-flex">
                                    <div className="Box-root Flex-flex">
                                        <button
                                            className="bs-Button bs-DeprecatedButton db-UserMenuX"
                                            id="profile-menu"
                                            type="button"
                                            tabIndex="-1"
                                            onClick={this.showProfileMenu}
                                        >
                                            <div
                                                className="db-GravatarImage db-UserMenuX-image"
                                                style={{
                                                    backgroundImage: IMG_URL,
                                                }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

TopContent.displayName = 'TopContent';

const mapStateToProps = (state, props) => {
    const settings = state.profileSettings.profileSetting.data;
    const profilePic = settings ? settings.profilePic : '';
    const { projectId } = props;
    const monitors = projectId
        ? state.monitor.monitorsList.monitors.find(project => {
              return project._id === projectId;
          })
        : [];

    return {
        profilePic,
        feedback: state.feedback,
        notifications: state.notifications.notifications,
        incidents: state.incident.unresolvedincidents,
        currentProject: state.project.currentProject,
        monitors,
        subProjectOngoingScheduledEvents:
            state.scheduledEvent.subProjectOngoingScheduledEvent.events,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            showProfileMenu,
            openFeedbackModal,
            closeFeedbackModal,
            userSettings,
            openNotificationMenu,
            getVersion,
            openSideNav,
            fetchSubProjectOngoingScheduledEvents,
        },
        dispatch
    );

TopContent.propTypes = {
    getVersion: PropTypes.func,
    openSideNav: PropTypes.func,
    userSettings: PropTypes.func.isRequired,
    openFeedbackModal: PropTypes.func.isRequired,
    closeFeedbackModal: PropTypes.func.isRequired,
    showProfileMenu: PropTypes.func.isRequired,
    openNotificationMenu: PropTypes.func.isRequired,
    feedback: PropTypes.object.isRequired,
    profilePic: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    notifications: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    incidents: PropTypes.shape({ incidents: PropTypes.array }),
    length: PropTypes.number,
    map: PropTypes.func,
    currentProject: PropTypes.shape({ _id: PropTypes.string }),
    fetchSubProjectOngoingScheduledEvents: PropTypes.func,
    monitors: PropTypes.shape({ count: PropTypes.number }),
    subProjectOngoingScheduledEvents: PropTypes.array,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopContent);
