import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import ShouldRender from './ShouldRender';
import {
    fetchEventNote,
    getStatusPage,
    fetchEvent,
    moreEventNote,
} from '../actions/status';
import { ACCOUNTS_URL } from '../config';
import { ListLoader } from './basic/Loader';

class ScheduledEvent extends Component {
    componentDidMount() {
        const {
            match: { params },
            fetchEventNote,
            statusData,
            fetchEvent,
        } = this.props;
        const { eventId } = params;

        if (
            window.location.search.substring(1) &&
            window.location.search.substring(1) === 'embedded=true'
        ) {
            document.getElementsByTagName('html')[0].style.background =
                'none transparent';
        }

        let url, statusPageId;

        if (
            window.location.pathname.includes('/status-page/') &&
            window.location.pathname.split('/').length >= 3
        ) {
            statusPageId = window.location.pathname.split('/')[2];
            url = 'null';
        } else if (
            window.location.href.indexOf('localhost') > -1 ||
            window.location.href.indexOf('fyipeapp.com') > 0
        ) {
            statusPageId = window.location.host.split('.')[0];
            url = 'null';
        } else {
            statusPageId = 'null';
            url = window.location.host;
        }

        this.props.getStatusPage(statusPageId, url).catch(err => {
            if (err.message === 'Request failed with status code 401') {
                const { loginRequired } = this.props.login;
                if (loginRequired) {
                    window.location = `${ACCOUNTS_URL}/login?statusPage=true&statusPageURL=${window.location.href}`;
                }
            }
        });

        if (statusData && statusData._id) {
            // fetch a particular scheduled event
            fetchEvent(statusData.projectId._id, eventId);
            // fetch scheduled event note
            fetchEventNote(statusData.projectId._id, eventId, 'investigation');
        }
    }

    componentDidUpdate(prevProps) {
        const {
            match: { params },
            fetchEventNote,
            statusData,
            fetchEvent,
        } = this.props;
        const { eventId } = params;

        if (prevProps.statusData._id !== statusData._id) {
            // fetch a particular scheduled event
            fetchEvent(statusData.projectId._id, eventId);
            // fetch scheduled event note
            fetchEventNote(statusData.projectId._id, eventId, 'investigation');
        }
    }

    more() {
        const {
            moreEventNote,
            statusData,
            match: { params },
            skip,
        } = this.props;
        const { eventId } = params;

        moreEventNote(
            statusData.projectId._id,
            eventId,
            'investigation',
            skip + 1
        );
    }

    render() {
        const {
            fetchingNotes,
            fetchingEvent,
            scheduledEvent,
            eventNotes,
            count,
            history,
        } = this.props;

        return (
            <div
                className="page-main-wrapper"
                style={{ background: 'rgb(247, 247, 247)' }}
            >
                <div className="innernew" style={{ width: 609 }}>
                    <div
                        id="scheduledEvents"
                        className="twitter-feed white box"
                        style={{ overflow: 'visible' }}
                    >
                        <div
                            className="messages"
                            style={{
                                position: 'relative',
                            }}
                        >
                            <div
                                className="box-inner"
                                style={{ paddingTop: 20, paddingBottom: 20 }}
                            >
                                <span
                                    style={{
                                        color: 'rgba(76, 76, 76, 0.52)',
                                        textTransform: 'uppercase',
                                        fontWeight: '700',
                                        display: 'inline-block',
                                        marginBottom: 20,
                                        fontSize: 14,
                                    }}
                                >
                                    Scheduled Event
                                </span>
                                {!fetchingEvent && scheduledEvent.name && (
                                    <div
                                        className="feed-header clearfix"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flexWrap: 'nowrap',
                                        }}
                                    >
                                        <span
                                            className="feed-title"
                                            style={{
                                                color: 'rgb(76, 76, 76)',
                                                fontWeight: 'bold',
                                                marginBottom: 10,
                                            }}
                                        >
                                            {scheduledEvent.name}
                                        </span>
                                        <span
                                            style={{
                                                color: 'rgba(0, 0, 0, 0.5)',
                                            }}
                                        >
                                            {scheduledEvent.description}
                                        </span>
                                    </div>
                                )}
                                <ShouldRender if={fetchingEvent}>
                                    <ListLoader />
                                </ShouldRender>
                                {!fetchingEvent &&
                                    scheduledEvent.startDate &&
                                    scheduledEvent.endDate && (
                                        <span
                                            className="time"
                                            style={{
                                                color: 'rgba(0, 0, 0, 0.5)',
                                                fontSize: 12,
                                            }}
                                        >
                                            {moment(
                                                scheduledEvent.startDate
                                            ).format('MMMM Do YYYY, h:mm a')}
                                            &nbsp;&nbsp;-&nbsp;&nbsp;
                                            {moment(
                                                scheduledEvent.endDate
                                            ).format('MMMM Do YYYY, h:mm a')}
                                        </span>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div
                        id="scheduledEventNotes"
                        className="twitter-feed white box"
                        style={{ overflow: 'visible' }}
                    >
                        <div
                            className="messages"
                            style={{ position: 'relative' }}
                        >
                            <div className="box-inner">
                                <ShouldRender if={!fetchingNotes}>
                                    <div
                                        className="feed-header clearfix"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flexWrap: 'nowrap',
                                        }}
                                    >
                                        <span
                                            className="feed-title"
                                            style={{
                                                color: 'rgb(76, 76, 76)',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Scheduled Event Updates
                                        </span>
                                    </div>
                                </ShouldRender>
                                <ShouldRender if={fetchingNotes}>
                                    <ListLoader />
                                </ShouldRender>
                                <ul className="feed-contents plain">
                                    {!fetchingNotes &&
                                        eventNotes &&
                                        eventNotes.length > 0 &&
                                        eventNotes.map(note => (
                                            <li
                                                key={note._id}
                                                className="feed-item clearfix"
                                            >
                                                <div
                                                    className="message"
                                                    style={{
                                                        width: '100%',
                                                        marginLeft: 0,
                                                        background:
                                                            'rgb(247, 247, 247)',
                                                    }}
                                                >
                                                    <div className="note__wrapper">
                                                        <span>
                                                            <span className="note-badge badge badge__color--green">
                                                                {
                                                                    note.incident_state
                                                                }
                                                            </span>
                                                        </span>
                                                        <span>
                                                            <span
                                                                style={{
                                                                    color:
                                                                        'rgba(0, 0, 0, 0.5)',
                                                                    fontSize: 14,
                                                                    display:
                                                                        'block',
                                                                    textAlign:
                                                                        'justify',
                                                                }}
                                                            >
                                                                {note.content}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    color:
                                                                        'rgba(0, 0, 0, 0.5)',
                                                                    fontSize: 12,
                                                                    display:
                                                                        'block',
                                                                    marginTop: 15,
                                                                }}
                                                            >
                                                                {moment(
                                                                    note.createdAt
                                                                ).format(
                                                                    'MMMM Do YYYY, h:mm a'
                                                                )}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}

                                    {!fetchingNotes &&
                                        eventNotes &&
                                        eventNotes.length === 0 && (
                                            <li
                                                className="feed-item clearfix"
                                                style={{
                                                    minHeight: '5px',
                                                    marginBottom: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    flexWrap: 'nowrap',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <span
                                                    className="time"
                                                    style={{
                                                        fontSize: '0.8em',
                                                        marginLeft: '0px',
                                                        color:
                                                            'rgb(76, 76, 76)',
                                                    }}
                                                >
                                                    No schedule event updates
                                                    yet.
                                                </span>
                                            </li>
                                        )}
                                </ul>
                            </div>
                            <ShouldRender
                                if={
                                    eventNotes.length &&
                                    count > eventNotes.length &&
                                    !fetchingNotes
                                }
                            >
                                <button
                                    className="more button-as-anchor anchor-centered"
                                    onClick={() => this.more()}
                                >
                                    More
                                </button>
                            </ShouldRender>
                        </div>
                    </div>

                    <ShouldRender if={fetchingEvent}>
                        <div
                            id="app-loading"
                            style={{
                                position: 'fixed',
                                top: '0',
                                bottom: '0',
                                left: '0',
                                right: '0',
                                backgroundColor: '#fdfdfd',
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
                    <div id="footer">
                        <span
                            onClick={() => history.goBack()}
                            className="sp__icon sp__icon--back"
                            style={{
                                color: 'rgb(76, 76, 76)',
                                cursor: 'pointer',
                            }}
                        >
                            Back to status page
                        </span>
                        <p>
                            <a
                                href="https://fyipe.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'rgb(76, 76, 76)' }}
                            >
                                Powered by Fyipe
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

ScheduledEvent.displayName = 'ScheduledEvent';

ScheduledEvent.propTypes = {
    fetchEventNote: PropTypes.func,
    match: PropTypes.object,
    fetchingNotes: PropTypes.bool,
    statusData: PropTypes.object,
    getStatusPage: PropTypes.func,
    login: PropTypes.object.isRequired,
    fetchEvent: PropTypes.func,
    fetchingEvent: PropTypes.bool,
    scheduledEvent: PropTypes.object,
    eventNotes: PropTypes.array,
    moreEventNote: PropTypes.func,
    count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    skip: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    history: PropTypes.object,
};

const mapStateToProps = state => {
    return {
        fetchingNotes: state.status.eventNoteList.requesting,
        statusData: state.status.statusPage,
        login: state.login,
        fetchingEvent: state.status.scheduledEvent.requesting,
        scheduledEvent: state.status.scheduledEvent.event,
        eventNotes: state.status.eventNoteList.eventNotes,
        count: state.status.eventNoteList.count,
        skip: state.status.eventNoteList.skip,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        { fetchEventNote, getStatusPage, fetchEvent, moreEventNote },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(ScheduledEvent);
