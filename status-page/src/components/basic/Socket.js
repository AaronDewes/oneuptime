import { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { API_URL } from '../../config';

import {
    updatestatuspagebysocket,
    updatemonitorbysocket,
    deletemonitorbysocket,
    updatemonitorstatusbysocket,
    updateincidentnotebysocket,
    addscheduledeventbysocket,
    updatescheduledeventbysocket,
    updateprobebysocket,
    incidentcreatedbysocket,
    updateincidentbysocket,
    addincidenttimelinebysocket,
} from '../../actions/socket';

// Important: Below `/api` is also needed because `io` constructor strips out the path from the url.
// '/api' is set as socket io namespace, so remove
const socket = io(API_URL.replace('/api', ''), { path: '/api/socket.io' });

class SocketApp extends Component {
    shouldComponentUpdate(nextProps) {
        if (this.props.project !== nextProps.project) {
            if (this.props.project) {
                socket.removeListener(
                    `updateStatusPage-${this.props.project._id}`
                );
                socket.removeListener(
                    `updateMonitor-${this.props.project._id}`
                );
                socket.removeListener(
                    `deleteMonitor-${this.props.project._id}`
                );
                socket.removeListener(
                    `updateMonitorStatus-${this.props.project._id}`
                );
                socket.removeListener(
                    `updateIncidentNote-${this.props.project._id}`
                );
                socket.removeListener(
                    `addScheduledEvent-${this.props.project._id}`
                );
                socket.removeListener(
                    `updateScheduledEvent-${this.props.project._id}`
                );
                socket.removeListener(`updateProbe-${this.props.project._id}`);
                socket.removeListener(
                    `incidentCreated-${this.props.project._id}`
                );
                socket.removeListener(
                    `updateIncident-${this.props.project._id}`
                );
                socket.removeListener(
                    `addIncidentTimeline-${this.props.project._id}`
                );
            }
            return true;
        } else {
            return false;
        }
    }

    render() {
        const thisObj = this;

        if (this.props.project) {
            socket.on(`updateStatusPage-${this.props.project._id}`, function(
                data
            ) {
                if (thisObj.props.statusPage._id === data._id) {
                    thisObj.props.updatestatuspagebysocket(data);
                }
            });
            socket.on(`updateMonitor-${this.props.project._id}`, function(
                data
            ) {
                thisObj.props.updatemonitorbysocket(data);
            });
            socket.on(`deleteMonitor-${this.props.project._id}`, function(
                data
            ) {
                thisObj.props.deletemonitorbysocket(data);
            });
            socket.on(`updateMonitorStatus-${this.props.project._id}`, function(
                data
            ) {
                thisObj.props.updatemonitorstatusbysocket(
                    data,
                    thisObj.props.probes
                );
            });
            socket.on(`updateIncidentNote-${this.props.project._id}`, function(
                data
            ) {
                thisObj.props.updateincidentnotebysocket(data);
            });
            socket.on(`addScheduledEvent-${this.props.project._id}`, function(
                data
            ) {
                if (data.showEventOnStatusPage) {
                    thisObj.props.addscheduledeventbysocket(data);
                }
            });
            socket.on(
                `updateScheduledEvent-${this.props.project._id}`,
                function(data) {
                    thisObj.props.updatescheduledeventbysocket(data);
                }
            );
            socket.on(`updateProbe-${this.props.project._id}`, function(data) {
                thisObj.props.updateprobebysocket(data);
            });
            socket.on(`incidentCreated-${this.props.project._id}`, function(
                data
            ) {
                thisObj.props.incidentcreatedbysocket(data);
            });
            socket.on(`updateIncident-${this.props.project._id}`, function(
                data
            ) {
                thisObj.props.updateincidentbysocket(data);
            });
            socket.on(`addIncidentTimeline-${this.props.project._id}`, function(
                data
            ) {
                thisObj.props.addincidenttimelinebysocket(data);
            });
        }
        return null;
    }
}

SocketApp.displayName = 'SocketApp';

SocketApp.propTypes = {
    project: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
};

const mapStateToProps = state => ({
    project: state.status.statusPage.projectId,
    probes: state.probe.probes,
    statusPage: state.status.statusPage,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            updatestatuspagebysocket,
            updatemonitorbysocket,
            deletemonitorbysocket,
            updatemonitorstatusbysocket,
            updateincidentnotebysocket,
            addscheduledeventbysocket,
            updatescheduledeventbysocket,
            updateprobebysocket,
            incidentcreatedbysocket,
            updateincidentbysocket,
            addincidenttimelinebysocket,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(SocketApp);
