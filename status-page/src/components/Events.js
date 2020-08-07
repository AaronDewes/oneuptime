import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ShouldRender from './ShouldRender';

class Events extends Component {
    render() {
        return (
            <ShouldRender if={this.props.events}>
                {this.props.events.map((event, i) => {
                    if (!event) return <div>No event</div>;
                    return (
                        <li
                            className="scheduledEvent feed-item clearfix"
                            key={i}
                        >
                            <div
                                className="message"
                                style={{
                                    width: '100%',
                                    marginLeft: 0,
                                    ...this.props.noteBackgroundColor,
                                }}
                            >
                                <div className="text">
                                    <span
                                        style={{
                                            ...this.props.secondaryTextColor,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Monitor
                                    </span>
                                    :{' '}
                                    <span
                                        style={{
                                            fontWeight: 'Bold',
                                            ...this.props.primaryTextColor,
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }}
                                    >
                                        {event.monitors[0].monitorId.name
                                            .charAt(0)
                                            .toUpperCase() +
                                            event.monitors[0].monitorId.name.substr(
                                                1
                                            )}
                                    </span>
                                </div>
                                <div className="text">
                                    <span
                                        style={{
                                            ...this.props.secondaryTextColor,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Event
                                    </span>
                                    :{' '}
                                    <span
                                        style={{
                                            fontWeight: 'Bold',
                                            ...this.props.primaryTextColor,
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }}
                                    >
                                        {event.name}
                                    </span>
                                </div>
                            </div>
                            <span
                                className="time"
                                style={{
                                    marginLeft: 12,
                                    ...this.props.secondaryTextColor,
                                }}
                            >
                                {moment(event.startDate).format(
                                    'MMMM Do YYYY, h:mm a'
                                )}
                                &nbsp;&nbsp;-&nbsp;&nbsp;
                                {moment(event.endDate).format(
                                    'MMMM Do YYYY, h:mm a'
                                )}
                            </span>
                        </li>
                    );
                })}
            </ShouldRender>
        );
    }
}

Events.displayName = 'Events';

Events.propTypes = {
    events: PropTypes.array,
    secondaryTextColor: PropTypes.object,
    primaryTextColor: PropTypes.object,
    noteBackgroundColor: PropTypes.object,
};

export default Events;
