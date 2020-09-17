import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import moment from 'moment';
import ShouldRender from '../basic/ShouldRender';
import { openModal, closeModal } from '../../actions/modal';
import CreateSchedule from '../modals/CreateSchedule';
import EditSchedule from '../modals/EditSchedule';
import DataPathHoC from '../DataPathHoC';
import DeleteSchedule from '../modals/DeleteSchedule';
import { history } from '../../store';
import { capitalize } from '../../config';
import { ListLoader } from '../basic/Loader';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';

class EventBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            createScheduledEventModalId: uuid.v4(),
        };
        this.limit = 10;
    }

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return this.props.closeModal({
                    id: this.state.createScheduledEventModalId,
                });
            default:
                return false;
        }
    };

    handleMonitorList = monitors => {
        if (monitors.length === 0) {
            return 'No monitor in this event';
        }
        if (monitors.length === 1) {
            return monitors[0].monitorId.name;
        }
        if (monitors.length === 2) {
            return `${monitors[0].monitorId.name} and ${monitors[1].monitorId.name}`;
        }
        if (monitors.length === 3) {
            return `${monitors[0].monitorId.name}, ${monitors[1].monitorId.name} and ${monitors[2].monitorId.name}`;
        }

        return `${monitors[0].monitorId.name}, ${
            monitors[1].monitorId.name
        } and ${monitors.length - 2} others`;
    };

    handleScheduledEventDetail = scheduledEventId => {
        const { projectId, parentProjectId } = this.props;
        history.push(
            `/dashboard/project/${parentProjectId ||
                projectId}/scheduledEvents/${scheduledEventId}`
        );
    };

    render() {
        const { createScheduledEventModalId } = this.state;
        const {
            scheduledEvents,
            limit,
            count,
            skip,
            profileSettings,
            error,
            requesting,
            projectId,
            openModal,
            fetchingMonitors,
            monitors,
            currentProject,
            currentSubProject,
            subProjects,
            prevClicked,
            nextClicked,
            parentProjectId,
        } = this.props;
        const footerBorderTopStyle = { margin: 0, padding: 0 };

        const canNext = count > Number(skip) + Number(limit) ? true : false;
        const canPrev = Number(skip) <= 0 ? false : true;
        const projectName = currentProject
            ? currentProject.name
            : currentSubProject
            ? currentSubProject.name
            : '';

        return (
            <div
                onKeyDown={this.handleKeyBoard}
                className="bs-ContentSection Card-root Card-shadow--medium Margin-bottom--12"
            >
                <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                    <ShouldRender if={subProjects.length > 0 && currentProject}>
                        <div className="Box-root Padding-bottom--20">
                            <Badge color={'red'}>Project</Badge>
                        </div>
                    </ShouldRender>
                    {subProjects.length > 0 && currentSubProject && (
                        <div className="Box-root Padding-bottom--20">
                            <Badge color={'blue'}>
                                {currentSubProject.name}
                            </Badge>
                        </div>
                    )}
                    <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                            <span className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                <span>Scheduled Events</span>
                            </span>
                            <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                <span>
                                    Scheduled events show up on status pages and
                                    dashboard to let your team or customers know
                                    of any planned maintenance activity you have
                                    for {projectName}
                                </span>
                            </span>
                        </div>
                        <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                            <div className="Box-root">
                                <ShouldRender
                                    if={
                                        !fetchingMonitors && monitors.length > 0
                                    }
                                >
                                    <button
                                        id="addScheduledEventButton"
                                        onClick={() => {
                                            this.props.openModal({
                                                id: createScheduledEventModalId,
                                                content: DataPathHoC(
                                                    CreateSchedule,
                                                    {
                                                        projectId,
                                                    }
                                                ),
                                            });
                                        }}
                                        className="Button bs-ButtonLegacy ActionIconParent"
                                        type="button"
                                    >
                                        <div className="bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                            <div className="Box-root Margin-right--8">
                                                <div className="SVGInline SVGInline--cleaned Button-icon ActionIcon ActionIcon--color--inherit Box-root Flex-flex"></div>
                                            </div>
                                            <span className="bs-Button bs-FileUploadButton bs-Button--icon bs-Button--new">
                                                <span>
                                                    Create New Scheduled Event
                                                </span>
                                            </span>
                                        </div>
                                    </button>
                                </ShouldRender>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bs-ContentSection-content Box-root">
                    <div className="bs-ObjectList db-UserList">
                        <div style={{ overflow: 'hidden', overflowX: 'auto' }}>
                            <div
                                id="scheduledEventsList"
                                className="bs-ObjectList-rows"
                            >
                                <header className="bs-ObjectList-row bs-ObjectList-row--header">
                                    <div className="bs-ObjectList-cell">
                                        Event
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Created by
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Monitor(s)
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Start Date
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        End Date
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Action
                                    </div>
                                </header>
                                {scheduledEvents.length > 0 &&
                                    scheduledEvents.map(
                                        (scheduledEvent, index) => (
                                            <div
                                                key={scheduledEvent._id}
                                                className="scheduled-event-list-item bs-ObjectList-row db-UserListRow db-UserListRow--withName"
                                                style={{
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    this.handleScheduledEventDetail(
                                                        scheduledEvent._id
                                                    );
                                                }}
                                            >
                                                <div className="bs-ObjectList-cell bs-u-v-middle bs-ActionsParent">
                                                    <div className="bs-ObjectList-cell-row bs-ObjectList-copy bs-is-highlighted">
                                                        {this.props.name}
                                                    </div>
                                                    <div className="scheduled-event-name Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                        {capitalize(
                                                            scheduledEvent.name
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {
                                                            scheduledEvent
                                                                .createdById
                                                                .name
                                                        }
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {scheduledEvent.monitors &&
                                                            this.handleMonitorList(
                                                                scheduledEvent.monitors
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {moment(
                                                            scheduledEvent.startDate
                                                        ).format(
                                                            'MMMM Do YYYY, h:mm a'
                                                        )}
                                                        <br />
                                                        <strong>
                                                            {
                                                                profileSettings.timezone
                                                            }
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {moment(
                                                            scheduledEvent.endDate
                                                        ).format(
                                                            'MMMM Do YYYY, h:mm a'
                                                        )}
                                                        <br />
                                                        <strong>
                                                            {
                                                                profileSettings.timezone
                                                            }
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="Box-root">
                                                        <button
                                                            id={`viewScheduledEvent_${index}`}
                                                            title="view"
                                                            className="bs-Button bs-DeprecatedButton"
                                                            type="button"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                this.handleScheduledEventDetail(
                                                                    scheduledEvent._id
                                                                );
                                                            }}
                                                        >
                                                            <span>View</span>
                                                        </button>
                                                        <button
                                                            id={`editCredentialBtn_${index}`}
                                                            title="edit"
                                                            className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--edit"
                                                            style={{
                                                                marginLeft: 20,
                                                            }}
                                                            type="button"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                openModal({
                                                                    id: createScheduledEventModalId,
                                                                    content: EditSchedule,
                                                                    event: scheduledEvent,
                                                                    projectId,
                                                                });
                                                            }}
                                                        >
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            id={`deleteCredentialBtn_${index}`}
                                                            title="delete"
                                                            className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--delete"
                                                            style={{
                                                                marginLeft: 20,
                                                            }}
                                                            type="button"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                openModal({
                                                                    id:
                                                                        scheduledEvent._id,
                                                                    content: DataPathHoC(
                                                                        DeleteSchedule,
                                                                        {
                                                                            projectId,
                                                                            eventId:
                                                                                scheduledEvent._id,
                                                                        }
                                                                    ),
                                                                });
                                                            }}
                                                        >
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                <ShouldRender
                                    if={
                                        !(
                                            (!scheduledEvents ||
                                                scheduledEvents.length === 0) &&
                                            !requesting &&
                                            !error
                                        )
                                    }
                                >
                                    <div style={footerBorderTopStyle}></div>
                                </ShouldRender>
                            </div>
                        </div>
                        <ShouldRender if={fetchingMonitors && requesting}>
                            <ListLoader />
                        </ShouldRender>
                        <ShouldRender
                            if={!fetchingMonitors && monitors.length === 0}
                        >
                            <div
                                className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--center"
                                style={{
                                    textAlign: 'center',
                                    backgroundColor: 'white',
                                    padding: '20px 10px 0',
                                }}
                            >
                                <span>
                                    No monitors was added to this project.{' '}
                                    {parentProjectId ? (
                                        <Link
                                            to={`/dashboard/project/${parentProjectId}/components`}
                                            style={{
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            Please create one.
                                        </Link>
                                    ) : (
                                        <Link
                                            to={`/dashboard/project/${projectId}/components`}
                                            style={{
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            Please create one.
                                        </Link>
                                    )}
                                </span>
                            </div>
                        </ShouldRender>
                        <ShouldRender
                            if={
                                (!scheduledEvents ||
                                    scheduledEvents.length === 0) &&
                                !requesting &&
                                !error &&
                                !fetchingMonitors &&
                                monitors.length > 0
                            }
                        >
                            <div
                                className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--center"
                                style={{
                                    textAlign: 'center',
                                    backgroundColor: 'white',
                                    padding: '20px 10px 0',
                                }}
                            >
                                <span>
                                    {(!scheduledEvents ||
                                        scheduledEvents.length === 0) &&
                                    !requesting &&
                                    !error
                                        ? 'You have no scheduled event at this time'
                                        : null}
                                    {error ? error : null}
                                </span>
                            </div>
                        </ShouldRender>
                        <div
                            className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween"
                            style={{ backgroundColor: 'white' }}
                        >
                            <div className="Box-root Flex-flex Flex-alignItems--center Padding-all--20">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                    <span>
                                        <span
                                            id="scheduledEventCount"
                                            className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap"
                                        >
                                            {this.props.count
                                                ? this.props.count +
                                                  (this.props.count > 1
                                                      ? '  Events'
                                                      : ' Event')
                                                : '0 Scheduled Event'}
                                        </span>
                                    </span>
                                </span>
                            </div>
                            <div className="Box-root Padding-horizontal--20 Padding-vertical--16">
                                <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                    <div className="Box-root Margin-right--8">
                                        <button
                                            id="btnPrevSchedule"
                                            onClick={() =>
                                                prevClicked(projectId, skip)
                                            }
                                            className={
                                                'Button bs-ButtonLegacy' +
                                                (canPrev ? '' : 'Is--disabled')
                                            }
                                            disabled={!canPrev}
                                            data-db-analytics-name="list_view.pagination.previous"
                                            type="button"
                                        >
                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                    <span>Previous</span>
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="Box-root">
                                        <button
                                            id="btnNextSchedule"
                                            onClick={() =>
                                                nextClicked(projectId, skip)
                                            }
                                            className={
                                                'Button bs-ButtonLegacy' +
                                                (canNext ? '' : 'Is--disabled')
                                            }
                                            disabled={!canNext}
                                            data-db-analytics-name="list_view.pagination.next"
                                            type="button"
                                        >
                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                    <span>Next</span>
                                                </span>
                                            </div>
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

EventBox.displayName = 'EventBox';

EventBox.propTypes = {
    openModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    skip: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    limit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    count: PropTypes.number,
    name: PropTypes.string,
    scheduledEvents: PropTypes.array,
    profileSettings: PropTypes.object,
    error: PropTypes.object,
    requesting: PropTypes.bool,
    projectId: PropTypes.string,
    fetchingMonitors: PropTypes.bool,
    monitors: PropTypes.array,
    currentProject: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    currentSubProject: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    subProjects: PropTypes.array,
    prevClicked: PropTypes.func,
    nextClicked: PropTypes.func,
    parentProjectId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            openModal,
            closeModal,
        },
        dispatch
    );

const mapStateToProps = (state, ownProps) => {
    const monitorData = state.monitor.monitorsList.monitors.find(
        data => String(data._id) === String(ownProps.projectId)
    );
    const monitors = monitorData.monitors;

    return {
        monitors,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventBox);
