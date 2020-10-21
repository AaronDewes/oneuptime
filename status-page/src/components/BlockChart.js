import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    getStatusPageIndividualNote,
    getIndividualEvent,
    notmonitoredDays,
    showIncidentCard,
} from '../actions/status';

class BlockChart extends Component {
    constructor(props) {
        super(props);

        this.requestday = this.requestday.bind(this);
    }

    requestday = (need, date) => {
        this.props.showIncidentCard(false);
        if (need) {
            this.props.getStatusPageIndividualNote(
                this.props.statusData.projectId._id,
                this.props.monitorId,
                date,
                this.props.monitorName,
                need
            );
        } else {
            if (this.props.time && this.props.time.emptytime) {
                this.props.notmonitoredDays(
                    this.props.monitorId,
                    this.props.time.emptytime,
                    this.props.monitorName,
                    'No data available for this date'
                );
            } else {
                this.props.notmonitoredDays(
                    this.props.monitorId,
                    date,
                    this.props.monitorName,
                    'No incidents yet'
                );
            }
        }
        this.props.getIndividualEvent(
            this.props.statusData.projectId._id,
            this.props.monitorId,
            date,
            this.props.monitorName
        );
    };

    render() {
        let bar = null;
        let title = null;
        let title1 = null;
        let need = false;
        let backgroundColor;

        const { colors } = this.props.statusData;
        if (this.props.time && this.props.time.status) {
            if (this.props.time.status === 'offline') {
                let downTimeInMinutes;
                let downtime;
                if (this.props.time.downTime < 60) {
                    downTimeInMinutes = this.props.time.downTime;
                    downtime = `${downTimeInMinutes} second${downTimeInMinutes === 1 ? '' : 's'
                        }`;
                } else {
                    downTimeInMinutes = Math.floor(
                        this.props.time.downTime / 60
                    );
                    downtime = `${downTimeInMinutes} minute${downTimeInMinutes === 1 ? '' : 's'
                        }`;
                }

                if (downTimeInMinutes > 60) {
                    downtime = `${Math.floor(
                        downTimeInMinutes / 60
                    )} hrs ${downTimeInMinutes % 60} minutes`;
                }

                bar = 'bar down';
                title = moment(this.props.time.date).format('LL');
                title1 = `Down for ${downtime}`;
                need = true;
                if (colors)
                    backgroundColor = `rgba(${colors.downtime.r}, ${colors.downtime.g}, ${colors.downtime.b})`;
            } else if (this.props.time.status === 'degraded') {
                let degradedTimeInMinutes;
                let degradedtime;
                if (this.props.time.degradedTime < 60) {
                    degradedTimeInMinutes = this.props.time.degradedTime;
                    degradedtime = `${degradedTimeInMinutes} second${degradedTimeInMinutes === 1 ? '' : 's'
                        }`;
                } else {
                    degradedTimeInMinutes = Math.floor(
                        this.props.time.degradedTime / 60
                    );
                    degradedtime = `${degradedTimeInMinutes} minute${degradedTimeInMinutes === 1 ? '' : 's'
                        }`;
                }

                if (degradedTimeInMinutes > 60) {
                    degradedtime = `${Math.floor(
                        degradedTimeInMinutes / 60
                    )} hrs ${degradedTimeInMinutes % 60} minutes`;
                }

                bar = 'bar mid';
                title = moment(this.props.time.date).format('LL');
                title1 = `Degraded for ${degradedtime}`;
                need = true;
                if (colors)
                    backgroundColor = `rgba(${colors.degraded.r}, ${colors.degraded.g}, ${colors.degraded.b})`;
            } else {
                bar = 'bar';
                title = moment(this.props.time.date).format('LL');
                title1 = 'No downtime';
                need = true;
                if (colors)
                    backgroundColor = `rgba(${colors.uptime.r}, ${colors.uptime.g}, ${colors.uptime.b})`;
            }
        } else {
            bar = 'bar empty';
            title = moment(this.props.time.date).format('LL');
            title1 = '100% uptime';
            if (colors)
                backgroundColor = `rgba(${colors.uptime.r}, ${colors.uptime.g}, ${colors.uptime.b})`;
        }

        const dateId = title.replace(/, | /g, '');

        return (
            <div
                id={`block${this.props.monitorId}${dateId}`}
                className={bar}
                style={{ outline: 'none', backgroundColor: backgroundColor }}
                title={`${title}
                ${title1}`}
                onClick={() => this.requestday(need, this.props.time.date)}
            ></div>
        );
    }
}

BlockChart.displayName = 'BlockChart';

const mapStateToProps = state => ({ statusData: state.status.statusPage });

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getStatusPageIndividualNote,
            getIndividualEvent,
            notmonitoredDays,
            showIncidentCard,
        },
        dispatch
    );

BlockChart.propTypes = {
    time: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    statusData: PropTypes.object,
    getStatusPageIndividualNote: PropTypes.func,
    getIndividualEvent: PropTypes.func,
    notmonitoredDays: PropTypes.func,
    monitorName: PropTypes.any,
    monitorId: PropTypes.any,
    showIncidentCard: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(BlockChart);
