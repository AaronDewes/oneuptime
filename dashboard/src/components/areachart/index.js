import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner } from '../basic/Loader';
import {
    ResponsiveContainer,
    AreaChart as Chart,
    Area,
    CartesianGrid,
    Tooltip,
    YAxis,
} from 'recharts';
import * as _ from 'lodash';
import { formatDecimal, formatBytes } from '../../config';
import toPascalCase from 'to-pascal-case';

const noDataStyle = {
    textAlign: 'center',
    flexBasis: 1,
};

const CustomTooltip = ({ active, payload }) => {
    if (active) {
        return (
            <div className="custom-tooltip">
                {payload[0].payload.name ? (
                    <>
                        <h3>{payload[0].payload.name}</h3>
                        <p className="label">{`${payload[0].name} : ${payload[0].payload.display}`}</p>
                    </>
                ) : (
                    <h3>No data available</h3>
                )}
            </div>
        );
    }

    return null;
};

CustomTooltip.displayName = 'CustomTooltip';

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
};

// interpolates status to numeric value so we can display it on chart
const interpolatedStatus = status => {
    switch (status) {
        case 'offline':
            return 0;
        case 'online':
            return 100;
        case 'degraded':
            return 50;
        default:
            return 0;
    }
};

// interpolates status in data objects array
// and appends interpolated status
const interpolateData = (data = []) =>
    data.map(val => {
        return { ...val, interpolatedStatus: interpolatedStatus(val.status) };
    });

class AreaChart extends Component {
    parseValue(data, name, display, symbol) {
        switch (name) {
            case 'load':
                return display
                    ? `${formatDecimal(
                          data.maxCpuLoad || data.cpuLoad || 0,
                          2
                      )} ${symbol || '%'}`
                    : data.maxCpuLoad || data.cpuLoad || 0;
            case 'memory':
                return display
                    ? `${formatBytes(
                          data.maxMemoryUsed || data.memoryUsed || 0
                      )} ${symbol || ''}`
                    : data.maxMemoryUsed || data.memoryUsed || 0;
            case 'disk':
                return display
                    ? `${formatBytes(
                          data.maxStorageUsed || data.storageUsed || 0
                      )} ${symbol || ''}`
                    : data.maxStorageUsed || data.storageUsed || 0;
            case 'temperature':
                return display
                    ? `${Math.round(
                          data.maxMainTemp || data.mainTemp || 0
                      )} ${symbol || '°C'}`
                    : data.maxMainTemp || data.mainTemp || 0;
            case 'response time':
                return display
                    ? `${Math.round(
                          data.maxResponseTime || data.responseTime || 0
                      )} ${symbol || 'ms'}`
                    : data.maxResponseTime || data.responseTime || 0;
            case 'pod':
                return data.kubernetesLog
                    ? display
                        ? `${Math.round(
                              this.calcPercent(
                                  data.kubernetesLog.podData.podStat.healthy,
                                  data.kubernetesLog.podData.podStat.totalPods
                              ) || 0
                          )} ${symbol || '%'}`
                        : this.calcPercent(
                              data.kubernetesLog.podData.podStat.healthy,
                              data.kubernetesLog.podData.podStat.totalPods
                          ) || 0
                    : 0;
            case 'job':
                return data.kubernetesLog
                    ? display
                        ? `${Math.round(
                              this.calcPercent(
                                  data.kubernetesLog.jobData.jobStat.healthy,
                                  data.kubernetesLog.jobData.jobStat.totalJobs
                              ) || 0
                          )} ${symbol || '%'}`
                        : this.calcPercent(
                              data.kubernetesLog.jobData.jobStat.healthy,
                              data.kubernetesLog.jobData.jobStat.totalJobs
                          ) || 0
                    : 0;
            case 'deployment':
                return data.kubernetesLog
                    ? display
                        ? `${Math.round(
                              this.calcPercent(
                                  data.kubernetesLog.deploymentData.healthy,
                                  data.kubernetesLog.deploymentData
                                      .allDeployments.length
                              ) || 0
                          )} ${symbol || '%'}`
                        : this.calcPercent(
                              data.kubernetesLog.deploymentData.healthy,
                              data.kubernetesLog.deploymentData.allDeployments
                                  .length
                          ) || 0
                    : 0;
            case 'statefulset':
                return data.kubernetesLog
                    ? display
                        ? `${Math.round(
                              this.calcPercent(
                                  data.kubernetesLog.statefulsetData.healthy,
                                  data.kubernetesLog.statefulsetData
                                      .allStatefulset.length
                              ) || 0
                          )} ${symbol || '%'}`
                        : this.calcPercent(
                              data.kubernetesLog.statefulsetData.healthy,
                              data.kubernetesLog.statefulsetData.allStatefulset
                                  .length
                          ) || 0
                    : 0;
            case 'monitorStatus':
                return data.interpolatedStatus
                    ? display
                        ? toPascalCase(data.status)
                        : data.interpolatedStatus
                    : 0;
            default:
                return display ? `${data || 0} ${symbol || ''}` : data || 0;
        }
    }

    calcPercent = (val, total) => {
        val = parseFloat(val);
        total = parseFloat(total);

        if (isNaN(val) || isNaN(total)) {
            return 0;
        }
        if (!total || total === 0) {
            return 0;
        }
        if (!val || val === 0) {
            return 0;
        }

        return (val / total) * 100;
    };

    parseDate(a) {
        return new Date(a).toLocaleString();
    }

    render() {
        const {
            type,
            data,
            name,
            symbol,
            requesting,
            initMonitorScanning,
        } = this.props;
        let processedData = [{ display: '', name: '', v: '' }];
        if (requesting || initMonitorScanning) {
            return (
                <div style={noDataStyle}>
                    <div
                        className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--center"
                        style={{
                            textAlign: 'center',
                            width: '100%',
                            fontSize: 14,
                            fontWeight: '500',
                            margin: 0,
                            color: '#4c4c4c',
                            lineHeight: 1.6,
                        }}
                    >
                        <Spinner style={{ stroke: '#8898aa' }} />{' '}
                        <span style={{ width: 10 }} />
                        We&apos;re currently in the process of collecting data
                        for this monitor. <br />
                        More info will be available in few minutes
                    </div>
                </div>
            );
        }

        // interpolate status first for script monitor
        let preprocessedData;
        if (type === 'script') {
            preprocessedData = interpolateData(data);
        }

        if (data && data.length > 0) {
            processedData = (type === 'manual' || type === 'incomingHttpRequest'
                ? data.map(a => {
                      return {
                          name: this.parseDate(a.date),
                          v: this.parseValue(a.downTime),
                          display: this.parseValue(
                              a.downTime,
                              null,
                              true,
                              symbol
                          ),
                      };
                  })
                : type === 'script'
                ? preprocessedData.map(a => {
                      return {
                          name: a.intervalDate || this.parseDate(a.createdAt),
                          v: this.parseValue(a, name),
                          display: this.parseValue(a, name, true, symbol),
                      };
                  })
                : data.map(a => {
                      return {
                          name: a.intervalDate || this.parseDate(a.createdAt),
                          v: this.parseValue(a, name),
                          display: this.parseValue(a, name, true, symbol),
                      };
                  })
            ).reverse();
        }
        return (
            <ResponsiveContainer width="100%" height={75}>
                <Chart data={processedData}>
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    {type === 'manual' || type === 'incomingHttpRequest' ? (
                        <YAxis reversed hide />
                    ) : (
                        ''
                    )}
                    <Area
                        type="linear"
                        isAnimationActive={false}
                        name={_.startCase(
                            _.toLower(
                                `${
                                    type === 'manual' ||
                                    type === 'incomingHttpRequest'
                                        ? 'average'
                                        : 'max'
                                } ${name}`
                            )
                        )}
                        dataKey="v"
                        stroke="#000000"
                        strokeWidth={1.5}
                        fill="#e2e1f2"
                    />
                </Chart>
            </ResponsiveContainer>
        );
    }
}

AreaChart.displayName = 'AreaChart';

AreaChart.propTypes = {
    data: PropTypes.array,
    type: PropTypes.string.isRequired,
    name: PropTypes.string,
    symbol: PropTypes.string,
    requesting: PropTypes.bool,
    initMonitorScanning: PropTypes.oneOf([
        PropTypes.bool,
        PropTypes.oneOfType([null, undefined]),
    ]),
};

function mapStateToProps(state) {
    return {
        requesting: state.monitor.fetchMonitorLogsRequest,
    };
}

export default connect(mapStateToProps)(AreaChart);
