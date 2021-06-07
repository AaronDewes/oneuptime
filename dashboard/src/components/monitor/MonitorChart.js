import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BlockChart from '../blockchart/BlockChart';
import AreaChart from '../areachart';
import toPascalCase from 'to-pascal-case';
import moment from 'moment';
import ShouldRender from '../basic/ShouldRender';
import { formatDecimal, formatBytes } from '../../config';
import { formatMonitorResponseTime } from '../../utils/formatMonitorResponseTime';
import { Spinner } from '../basic/Loader';
import { openModal } from '../../actions/modal';
import { bindActionCreators } from 'redux';
import KubePods from '../modals/KubePods';
import KubeJobs from '../modals/KubeJobs';
import KubeStatefulset from '../modals/KubeStatefulset';
import KubeDeployment from '../modals/KubeDeployment';
import DataPathHoC from '../DataPathHoC';

const calculateTime = (statuses, start, range) => {
    const timeBlock = [];
    let totalUptime = 0;
    let totalTime = 0;

    let dayStart = moment(start).startOf('day');

    const reversedStatuses = statuses.slice().reverse();

    for (let i = 0; i < range; i++) {
        const dayStartIn = dayStart;
        const dayEnd =
            i && i > 0 ? dayStart.clone().endOf('day') : moment(Date.now());

        const timeObj = {
            date: dayStart.toISOString(),
            downTime: 0,
            upTime: 0,
            degradedTime: 0,
        };
        /**
         * If two incidents of the same time overlap, we merge them
         * If two incidents of different type overlap, The priority will be:
         * offline, degraded and online.
         *      if the less important incident starts after and finish before the other incident, we remove it.
         *      if the less important incident overlaps with the other incident, we update its start/end time.
         *      if the less important incident start before and finish after the other incident, we divide it into two parts
         *          the first part ends before the important incident,
         *          the second part start after the important incident.
         * The time report will be generate after the following steps:
         * 1- selecting the incident that happendend during the selected day.
         *   In other words: The incidents that overlap with `dayStartIn` and `dayEnd`.
         * 2- Sorting them, to reduce the complexity of the next step (https://www.geeksforgeeks.org/merging-intervals/).
         * 3- Checking for overlaps between incidents. Merge incidents of the same type, reduce the time of the less important incidents.
         * 4- Fill the timeObj
         */
        //First step
        let incidentsHappenedDuringTheDay = [];
        reversedStatuses.forEach(monitorStatus => {
            if (monitorStatus.endTime === null) {
                monitorStatus.endTime = new Date().toISOString();
            }

            if (
                moment(monitorStatus.startTime).isBefore(dayEnd) &&
                moment(monitorStatus.endTime).isAfter(dayStartIn)
            ) {
                const start = moment(monitorStatus.startTime).isBefore(
                    dayStartIn
                )
                    ? dayStartIn
                    : moment(monitorStatus.startTime);
                const end = moment(monitorStatus.endTime).isAfter(dayEnd)
                    ? dayEnd
                    : moment(monitorStatus.endTime);
                incidentsHappenedDuringTheDay.push({
                    start,
                    end,
                    status: monitorStatus.status,
                });
            }
        });
        //Second step
        incidentsHappenedDuringTheDay.sort((a, b) =>
            moment(a.start).isSame(b.start)
                ? 0
                : moment(a.start).isAfter(b.start)
                ? 1
                : -1
        );
        //Third step
        for (let i = 0; i < incidentsHappenedDuringTheDay.length - 1; i++) {
            const firstIncidentIndex = i;
            const nextIncidentIndex = i + 1;
            const firstIncident =
                incidentsHappenedDuringTheDay[firstIncidentIndex];
            const nextIncident =
                incidentsHappenedDuringTheDay[nextIncidentIndex];
            if (moment(firstIncident.end).isSameOrBefore(nextIncident.start))
                continue;

            if (firstIncident.status === nextIncident.status) {
                const end = moment(firstIncident.end).isAfter(nextIncident.end)
                    ? firstIncident.end
                    : nextIncident.end;
                firstIncident.end = end;
                incidentsHappenedDuringTheDay.splice(nextIncidentIndex, 1);
            } else {
                //if the firstIncident has a higher priority
                if (
                    firstIncident.status === 'offline' ||
                    (firstIncident.status === 'degraded' &&
                        nextIncident.status === 'online')
                ) {
                    if (moment(firstIncident.end).isAfter(nextIncident.end)) {
                        incidentsHappenedDuringTheDay.splice(
                            nextIncidentIndex,
                            1
                        );
                    } else {
                        nextIncident.start = firstIncident.end;
                        //we will need to shift the next incident to keep the array sorted.
                        incidentsHappenedDuringTheDay.splice(
                            nextIncidentIndex,
                            1
                        );
                        let j = nextIncidentIndex;
                        while (j < incidentsHappenedDuringTheDay.length) {
                            if (
                                moment(nextIncident.start).isBefore(
                                    incidentsHappenedDuringTheDay[j].start
                                )
                            )
                                break;
                            j += 1;
                        }
                        incidentsHappenedDuringTheDay.splice(
                            j,
                            0,
                            nextIncident
                        );
                    }
                } else {
                    if (moment(firstIncident.end).isBefore(nextIncident.end)) {
                        firstIncident.end = nextIncident.start;
                    } else {
                        /**
                         * The firstIncident is less important than the next incident,
                         * it also starts before and ends after the nextIncident.
                         * In the case The first incident needs to be devided into to two parts.
                         * The first part comes before the nextIncident,
                         * the second one comes after the nextIncident.
                         */
                        const newIncident = {
                            start: nextIncident.end,
                            end: firstIncident.end,
                            status: firstIncident.status,
                        };
                        firstIncident.end = nextIncident.start;
                        let j = nextIncidentIndex + 1;
                        while (j < incidentsHappenedDuringTheDay.length) {
                            if (
                                moment(newIncident.start).isBefore(
                                    incidentsHappenedDuringTheDay[j].start
                                )
                            )
                                break;
                            j += 1;
                        }
                        incidentsHappenedDuringTheDay.splice(j, 0, newIncident);
                    }
                }
            }
            i--;
        }
        //Remove events having start and end time equal.
        incidentsHappenedDuringTheDay = incidentsHappenedDuringTheDay.filter(
            event => !moment(event.start).isSame(event.end)
        );
        //Last step
        for (const incident of incidentsHappenedDuringTheDay) {
            const { start, end, status } = incident;
            if (status === 'offline') {
                timeObj.downTime =
                    timeObj.downTime + end.diff(start, 'seconds');
                timeObj.date = end.toISOString();
            }
            if (status === 'degraded') {
                timeObj.degradedTime =
                    timeObj.degradedTime + end.diff(start, 'seconds');
            }
            if (status === 'online') {
                timeObj.upTime = timeObj.upTime + end.diff(start, 'seconds');
            }
        }

        totalUptime = totalUptime + timeObj.upTime;
        totalTime =
            totalTime +
            timeObj.upTime +
            timeObj.degradedTime +
            timeObj.downTime;

        timeBlock.push(Object.assign({}, timeObj));

        dayStart = dayStart.subtract(1, 'days');
    }

    return { timeBlock, uptimePercent: (totalUptime / totalTime) * 100 };
};

export function MonitorChart({
    start,
    end,
    monitor,
    data,
    statuses,
    status,
    showAll,
    activeProbe,
    probes,
    requesting,
    openModal,
}) {
    const [now, setNow] = useState(Date.now());
    const [kubeMonitoring] = useState(true);

    const activeProbeObj =
        probes && probes.length > 0 && probes[activeProbe || 0]
            ? probes[activeProbe || 0]
            : null;
    const lastAlive =
        activeProbeObj && activeProbeObj.lastAlive
            ? activeProbeObj.lastAlive
            : null;

    const range = moment(end).diff(moment(start), 'days');
    const { timeBlock, uptimePercent } =
        statuses && statuses.length > 0
            ? calculateTime(statuses, end, range)
            : calculateTime([], end, range);

    const type = monitor.type;
    const checkLogs = data && data.length > 0;

    const lighthouseLog = monitor.currentLighthouseLog;

    const sslCertificate = checkLogs ? data[0].sslCertificate : null;
    const sslCertExpiringIn = moment(
        new Date(
            sslCertificate && sslCertificate.expires
                ? sslCertificate.expires
                : now
        ).getTime()
    ).diff(now, 'days');
    const responseTime = checkLogs ? data[0].responseTime : '0';
    const monitorStatus = toPascalCase(checkLogs ? data[0].status : status);
    const uptime =
        uptimePercent !== 100 && !isNaN(uptimePercent)
            ? uptimePercent.toFixed(3)
            : '100';

    useEffect(() => {
        setNow(Date.now());

        const nowHandler = setTimeout(() => {
            setNow(Date.now());
        }, 300000);

        return () => {
            clearTimeout(nowHandler);
        };
    }, [lastAlive]);

    const block = [];
    for (let i = 0; i < range; i++) {
        block.unshift(<BlockChart time={timeBlock[i]} key={i} id={i} />);
    }

    let statusColor;
    switch (monitorStatus.toLowerCase()) {
        case 'degraded':
            statusColor = 'yellow';
            break;
        case 'offline':
            statusColor = 'red';
            break;
        case 'online':
            statusColor = 'green';
            break;
        default:
            statusColor = 'blue';
    }

    function handlePodDisplay(dataLog, type) {
        let data = [],
            title;
        if (dataLog) {
            if (type === 'all') {
                data = [...dataLog.podData.allPods];
                title = 'List of All Pods';
            } else if (type === 'healthy') {
                data = [...dataLog.podData.healthyPods];
                title = 'List of Healthy Pods';
            } else {
                data = [...dataLog.podData.unhealthyPods];
                title = 'List of Unhealthy Pods';
            }
        }

        openModal({
            id: 'kube_pod_log',
            content: DataPathHoC(KubePods, { data, title }),
        });
    }

    function handleJobDisplay(dataLog, type) {
        let data = [],
            title;
        if (dataLog) {
            if (type === 'all') {
                data = [...dataLog.jobData.allJobs];
                title = 'List of All Jobs';
            } else if (type === 'healthy') {
                data = [...dataLog.jobData.healthyJobs];
                title = 'List of Healthy Jobs';
            } else {
                data = [...dataLog.jobData.unhealthyJobs];
                title = 'List of Unhealthy Jobs';
            }
        }

        openModal({
            id: 'kube_job_log',
            content: DataPathHoC(KubeJobs, { data, title }),
        });
    }

    function handleStatefulsetDisplay(dataLog, type) {
        let data = [],
            title;
        if (dataLog) {
            if (type === 'all') {
                data = [...dataLog.statefulsetData.allStatefulset];
                title = 'List of All Statefulsets';
            } else if (type === 'healthy') {
                data = [...dataLog.statefulsetData.healthyStatefulsets];
                title = 'List of Healthy Statefulsets';
            } else {
                data = [...dataLog.statefulsetData.unhealthyStatefulsets];
                title = 'List of Unhealthy Statefulsets';
            }
        }

        openModal({
            id: 'kube_statefulset_log',
            content: DataPathHoC(KubeStatefulset, { data, title }),
        });
    }

    function handleDeploymentDisplay(dataLog, type) {
        let data = [],
            title;
        if (dataLog) {
            if (type === 'all') {
                data = [...dataLog.deploymentData.allDeployments];
                title = 'List of All Deployments';
            } else if (type === 'healthy') {
                data = [...dataLog.deploymentData.healthyDeployments];
                title = 'List of Healthy Deployments';
            } else {
                data = [...dataLog.deploymentData.unhealthyDeployments];
                title = 'List of Unhealthy Deployments';
            }
        }

        openModal({
            id: 'kube_deployment_log',
            content: DataPathHoC(KubeDeployment, { data, title }),
        });
    }

    const isCurrentlyNotMonitoring =
        (lastAlive && moment(now).diff(moment(lastAlive), 'seconds') >= 300) ||
        !lastAlive;
    const isDisabled = monitor && monitor.disabled;
    let monitorInfo;
    if (isDisabled) {
        monitorInfo = (
            <div className="db-Trend">
                <div className="block-chart-side line-chart">
                    <div className="db-TrendRow">
                        <div className="db-Trend-colInformation probe-offline">
                            <div
                                className="db-Trend-rowTitle"
                                title="Currently not monitoring"
                            >
                                <div className="db-Trend-title">
                                    <strong>
                                        <span className="chart-font">
                                            Currently Disabled
                                        </span>
                                    </strong>
                                </div>
                            </div>
                            <div className="db-Trend-rowTitle">
                                <div className="db-Trend-title description">
                                    <small>
                                        <span className="chart-font">
                                            We&apos;re currently not monitoring
                                            this monitor. Please re-enable it to
                                            resume monitoring.
                                        </span>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (type === 'server-monitor') {
        monitorInfo =
            monitor && monitor.agentlessConfig && isCurrentlyNotMonitoring ? (
                <div className="db-Trend">
                    <div className="block-chart-side line-chart">
                        <div className="db-TrendRow">
                            <div className="db-Trend-colInformation probe-offline">
                                <div
                                    className="db-Trend-rowTitle"
                                    title="Currently not monitoring"
                                >
                                    <div className="db-Trend-title">
                                        <strong>
                                            <span className="chart-font">
                                                Currently not monitoring
                                            </span>
                                        </strong>
                                    </div>
                                </div>
                                <div className="db-Trend-rowTitle">
                                    <div className="db-Trend-title description">
                                        <small>
                                            <span className="chart-font">
                                                We&apos;re currently not
                                                monitoring this monitor from
                                                this probe because the probe is
                                                offline.
                                            </span>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="db-Trend">
                        <div className="block-chart-side line-chart">
                            <div className="db-TrendRow">
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Current CPU Load"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Current CPU Load
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].cpuLoad
                                                        ? formatDecimal(
                                                              data[0].cpuLoad,
                                                              2
                                                          )
                                                        : 0}{' '}
                                                    %
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Average CPU Load"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Average CPU Load
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].avgCpuLoad
                                                        ? formatDecimal(
                                                              data[0]
                                                                  .avgCpuLoad,
                                                              2
                                                          )
                                                        : 0}{' '}
                                                    %
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Cores"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                CPU Cores
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].cpuCores
                                                        ? data[0].cpuCores
                                                        : 0}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-chart-main line-chart">
                            <AreaChart type={type} data={data} name={'load'} />
                        </div>
                    </div>
                    <div className="db-Trend">
                        <div className="block-chart-side line-chart">
                            <div className="db-TrendRow">
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Memory Used"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Memory Used
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].memoryUsed
                                                        ? formatBytes(
                                                              data[0].memoryUsed
                                                          )
                                                        : '0 Bytes'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Memory Available"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Memory Available
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].totalMemory
                                                        ? formatBytes({
                                                              value:
                                                                  data[0]
                                                                      .totalMemory,
                                                              decimalPlaces: 0,
                                                              roundType: 'down',
                                                          })
                                                        : '0 Bytes'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Swap Used"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Swap Used
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].swapUsed
                                                        ? formatBytes(
                                                              data[0].swapUsed
                                                          )
                                                        : '0 Bytes'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-chart-main line-chart">
                            <AreaChart
                                type={type}
                                data={data}
                                name={'memory'}
                            />
                        </div>
                    </div>
                    <div className="db-Trend">
                        <div className="block-chart-side line-chart">
                            <div className="db-TrendRow">
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Storage Used"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Storage Used
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].storageUsed
                                                        ? formatBytes(
                                                              data[0]
                                                                  .storageUsed
                                                          )
                                                        : '0 Bytes'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Storage Available"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Storage Available
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].totalStorage
                                                        ? formatBytes(
                                                              data[0]
                                                                  .totalStorage
                                                          )
                                                        : '0 Bytes'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Storage Usage"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Storage Usage
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {checkLogs &&
                                                    data[0].storageUsage
                                                        ? formatDecimal(
                                                              data[0]
                                                                  .storageUsage,
                                                              2
                                                          )
                                                        : 0}{' '}
                                                    %
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-chart-main line-chart">
                            <AreaChart type={type} data={data} name={'disk'} />
                        </div>
                    </div>
                    <ShouldRender if={showAll}>
                        <div className="db-Trend">
                            <div className="block-chart-side line-chart">
                                <div className="db-TrendRow">
                                    <div className="db-Trend-colInformation">
                                        <div
                                            className="db-Trend-rowTitle"
                                            title="Main Temperature"
                                        >
                                            <div className="db-Trend-title">
                                                <span className="chart-font">
                                                    Main Temperature
                                                </span>
                                            </div>
                                        </div>
                                        <div className="db-Trend-row">
                                            <div className="db-Trend-col db-Trend-colValue">
                                                <span>
                                                    {' '}
                                                    <span className="chart-font">
                                                        {checkLogs &&
                                                        data[0].mainTemp
                                                            ? data[0].mainTemp
                                                            : 0}{' '}
                                                        &deg;C
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="db-Trend-colInformation">
                                        <div
                                            className="db-Trend-rowTitle"
                                            title="Max. Temperature"
                                        >
                                            <div className="db-Trend-title">
                                                <span className="chart-font">
                                                    Max. Temperature
                                                </span>
                                            </div>
                                        </div>
                                        <div className="db-Trend-row">
                                            <div className="db-Trend-col db-Trend-colValue">
                                                <span>
                                                    {' '}
                                                    <span className="chart-font">
                                                        {checkLogs &&
                                                        data[0].maxTemp
                                                            ? data[0].maxTemp
                                                            : 0}{' '}
                                                        &deg;C
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="db-Trend-colInformation"></div>
                                </div>
                            </div>
                            <div className="block-chart-main line-chart">
                                <AreaChart
                                    type={type}
                                    data={data}
                                    name={'temperature'}
                                />
                            </div>
                        </div>
                    </ShouldRender>
                </>
            );
    } else if (type === 'kubernetes') {
        monitorInfo = (
            <>
                {isCurrentlyNotMonitoring ? (
                    <div className="db-Trend">
                        <div className="block-chart-side line-chart">
                            <div className="db-TrendRow">
                                <div className="db-Trend-colInformation probe-offline">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Currently not monitoring"
                                    >
                                        <div className="db-Trend-title">
                                            <strong>
                                                <span className="chart-font">
                                                    Currently not monitoring
                                                </span>
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="db-Trend-rowTitle">
                                        <div className="db-Trend-title description">
                                            <small>
                                                <span className="chart-font">
                                                    We&apos;re currently not
                                                    monitoring this monitor from
                                                    this probe because the probe
                                                    is offline.
                                                </span>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : requesting || (kubeMonitoring && data.length === 0) ? (
                    <div style={{ textAlign: 'center', flexBasis: 1 }}>
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
                                padding: '10px 0',
                            }}
                        >
                            <Spinner style={{ stroke: '#8898aa' }} />{' '}
                            <span style={{ width: 10 }} />
                            We&apos;re currently in the process of collecting
                            data for this monitor. More info will be available
                            in few minutes
                        </div>
                    </div>
                ) : (
                    <>
                        {checkLogs &&
                            data[0].kubernetesLog &&
                            data[0].kubernetesLog.podData.podStat.totalPods >
                                0 && (
                                <div className="db-Trend">
                                    <div className="block-chart-side line-chart">
                                        <div className="db-TrendRow">
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="All Pods"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            All Pods
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handlePodDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'all'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .podData
                                                                          .podStat
                                                                          .totalPods
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Healthy Pods"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Healthy Pods
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handlePodDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'healthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .podData
                                                                          .podStat
                                                                          .healthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Unhealthy Pods"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Unhealthy Pods
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handlePodDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'unhealthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .podData
                                                                          .podStat
                                                                          .unhealthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-chart-main line-chart">
                                        <AreaChart
                                            type={type}
                                            data={data}
                                            name={'pod'}
                                            symbol={'%'}
                                            initMonitorScanning={
                                                kubeMonitoring &&
                                                data.length === 0
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                        {checkLogs &&
                            data[0].kubernetesLog &&
                            data[0].kubernetesLog.jobData.jobStat.totalJobs >
                                0 && (
                                <div className="db-Trend">
                                    <div className="block-chart-side line-chart">
                                        <div className="db-TrendRow">
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Succeeded Jobs"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            All Jobs
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleJobDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'all'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .jobData
                                                                          .jobStat
                                                                          .totalJobs
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Running Jobs"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Healthy Jobs
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleJobDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'healthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .jobData
                                                                          .jobStat
                                                                          .healthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Failed Jobs"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Unhealthy Jobs
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleJobDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'unhealthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .jobData
                                                                          .jobStat
                                                                          .unhealthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-chart-main line-chart">
                                        <AreaChart
                                            type={type}
                                            data={data}
                                            name={'job'}
                                            symbol={'%'}
                                            initMonitorScanning={
                                                kubeMonitoring &&
                                                data.length === 0
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                        {checkLogs &&
                            data[0].kubernetesLog &&
                            data[0].kubernetesLog.deploymentData.allDeployments
                                .length > 0 && (
                                <div className="db-Trend">
                                    <div className="block-chart-side line-chart">
                                        <div className="db-TrendRow">
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="All Deployments"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            All Deployments
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleDeploymentDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'all'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .deploymentData
                                                                          .allDeployments
                                                                          .length
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Ready Deployments"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Healthy Deployments
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleDeploymentDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'healthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .deploymentData
                                                                          .healthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Desired Deployment"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Unhealthy
                                                            Deployments
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleDeploymentDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'unhealthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .deploymentData
                                                                          .unhealthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-chart-main line-chart">
                                        <AreaChart
                                            type={type}
                                            data={data}
                                            name={'deployment'}
                                            symbol={'%'}
                                            initMonitorScanning={
                                                kubeMonitoring &&
                                                data.length === 0
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                        {checkLogs &&
                            data[0].kubernetesLog &&
                            data[0].kubernetesLog.statefulsetData.allStatefulset
                                .length > 0 && (
                                <div className="db-Trend">
                                    <div className="block-chart-side line-chart">
                                        <div className="db-TrendRow">
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="All Statefulset"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            All Statefulsets
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleStatefulsetDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'all'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .statefulsetData
                                                                          .allStatefulset
                                                                          .length
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Ready Statefulset"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Healthy Statefulsets
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleStatefulsetDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'healthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .statefulsetData
                                                                          .healthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-Trend-colInformation">
                                                <div
                                                    className="db-Trend-rowTitle"
                                                    title="Desired Statefulset"
                                                >
                                                    <div className="db-Trend-title">
                                                        <span className="chart-font">
                                                            Unhealthy
                                                            Statefulsets
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="db-Trend-row">
                                                    <div className="db-Trend-col db-Trend-colValue">
                                                        <span>
                                                            {' '}
                                                            <span
                                                                className="chart-font"
                                                                style={{
                                                                    cursor:
                                                                        'pointer',
                                                                    textDecoration:
                                                                        'underline',
                                                                }}
                                                                onClick={() =>
                                                                    handleStatefulsetDisplay(
                                                                        data[0]
                                                                            .kubernetesLog,
                                                                        'unhealthy'
                                                                    )
                                                                }
                                                            >
                                                                {checkLogs &&
                                                                data[0]
                                                                    .kubernetesLog
                                                                    ? data[0]
                                                                          .kubernetesLog
                                                                          .statefulsetData
                                                                          .unhealthy
                                                                    : 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-chart-main line-chart">
                                        <AreaChart
                                            type={type}
                                            data={data}
                                            name={'statefulset'}
                                            symbol={'%'}
                                            initMonitorScanning={
                                                kubeMonitoring &&
                                                data.length === 0
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </>
        );
    } else if (type === 'url' || type === 'api' || type === 'ip') {
        monitorInfo = (
            <>
                <div className="db-Trend">
                    <div className="block-chart-side line-chart">
                        <div className="db-TrendRow">
                            {isCurrentlyNotMonitoring ? (
                                <div className="db-Trend-colInformation probe-offline">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Currently not monitoring"
                                    >
                                        <div className="db-Trend-title">
                                            <strong>
                                                <span className="chart-font">
                                                    Currently not monitoring
                                                </span>
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="db-Trend-rowTitle">
                                        <div className="db-Trend-title description">
                                            <small>
                                                <span className="chart-font">
                                                    We&apos;re currently not
                                                    monitoring this monitor from
                                                    this probe because the probe
                                                    is offline.
                                                </span>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="db-Trend-colInformation">
                                        <div
                                            className="db-Trend-rowTitle"
                                            title="Monitor Status"
                                        >
                                            <div className="db-Trend-title">
                                                <span className="chart-font">
                                                    Monitor Status
                                                </span>
                                            </div>
                                        </div>
                                        <div className="db-Trend-row">
                                            <div className="db-Trend-col db-Trend-colValue">
                                                <span>
                                                    {' '}
                                                    <span
                                                        id={`monitor-status-${monitor.name}`}
                                                        className={`chart-font Text-color--${statusColor}`}
                                                    >
                                                        {monitorStatus}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="db-Trend-colInformation">
                                        <div
                                            className="db-Trend-rowTitle"
                                            title="Uptime Stats"
                                        >
                                            <div className="db-Trend-title">
                                                <span className="chart-font">
                                                    Uptime Stats
                                                </span>
                                            </div>
                                        </div>
                                        <div className="db-Trend-row">
                                            <div className="db-Trend-col db-Trend-colValue">
                                                <span>
                                                    {' '}
                                                    <span className="chart-font">
                                                        {uptime} %
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ShouldRender if={data && data.length > 0}>
                                        <div className="db-Trend-colInformation">
                                            <div
                                                className="db-Trend-rowTitle"
                                                title="Response Time"
                                            >
                                                <div className="db-Trend-title">
                                                    <span className="chart-font">
                                                        Response Time
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="db-Trend-row">
                                                <div className="db-Trend-col db-Trend-colValue">
                                                    <span>
                                                        {' '}
                                                        <span className="chart-font">
                                                            {formatMonitorResponseTime(
                                                                responseTime
                                                            )}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </ShouldRender>
                                </>
                            )}
                        </div>
                    </div>
                    <ShouldRender if={!isCurrentlyNotMonitoring}>
                        <div className="block-chart-main line-chart">
                            <AreaChart
                                type={type}
                                data={data}
                                name={'response time'}
                                symbol="ms"
                            />
                        </div>
                    </ShouldRender>
                </div>
                <ShouldRender
                    if={
                        !isCurrentlyNotMonitoring &&
                        checkLogs &&
                        (type === 'url' || type === 'api')
                    }
                >
                    <div
                        className="db-Trend"
                        style={{ height: 'auto', fontSize: '120%' }}
                    >
                        <div className="block-chart-side line-chart">
                            <div
                                className="db-TrendRow"
                                style={{
                                    flexFlow: 'row wrap',
                                }}
                            >
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '10%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="SSL Status"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                SSL Status
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span
                                                    className={`chart-font Text-color--${
                                                        sslCertificate
                                                            ? sslCertificate.selfSigned
                                                                ? 'yellow'
                                                                : sslCertExpiringIn <
                                                                  30
                                                                ? sslCertExpiringIn <
                                                                  10
                                                                    ? 'red'
                                                                    : 'yellow'
                                                                : 'green'
                                                            : 'red'
                                                    }`}
                                                >
                                                    <small
                                                        id={`ssl-status-${monitor.name}`}
                                                    >
                                                        {sslCertificate
                                                            ? sslCertificate.selfSigned
                                                                ? 'Self Signed'
                                                                : sslCertExpiringIn <
                                                                  30
                                                                ? 'Expiring Soon'
                                                                : 'Enabled'
                                                            : 'No SSL Found'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '25%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Issuer"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Issuer
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small>
                                                        {sslCertificate &&
                                                        sslCertificate.issuer
                                                            ? sslCertificate
                                                                  .issuer.CN
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '20%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Expires"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Expires
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small>
                                                        {sslCertificate &&
                                                        sslCertificate.expires
                                                            ? sslCertificate.expires
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '35%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Fingerprint"
                                    >
                                        <div className="db-Trend-title Margin-top--8">
                                            <span className="chart-font">
                                                Fingerprint
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small>
                                                        {sslCertificate &&
                                                        sslCertificate.fingerprint
                                                            ? sslCertificate.fingerprint
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ShouldRender>
                <ShouldRender
                    if={
                        !isCurrentlyNotMonitoring &&
                        checkLogs &&
                        monitor &&
                        monitor.data &&
                        monitor.data.url &&
                        monitor.siteUrls &&
                        monitor.siteUrls.includes(monitor.data.url) &&
                        type === 'url'
                    }
                >
                    <div
                        className="db-Trend"
                        style={{ height: 'auto', fontSize: '120%' }}
                    >
                        <div className="block-chart-side line-chart">
                            <div
                                className="db-TrendRow"
                                style={{
                                    flexFlow: 'row wrap',
                                }}
                            >
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '18%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Performance"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Performance
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small
                                                        id={`lighthouse-performance-${monitor.name}`}
                                                    >
                                                        {lighthouseLog &&
                                                        lighthouseLog.performance
                                                            ? `${lighthouseLog.performance}%`
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '18%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Accessibility"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Accessibility
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small
                                                        id={`lighthouse-accessibility-${monitor.name}`}
                                                    >
                                                        {lighthouseLog &&
                                                        lighthouseLog.accessibility
                                                            ? `${lighthouseLog.accessibility}%`
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '18%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Best Practices"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Best Practices
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small
                                                        id={`lighthouse-bestPractices-${monitor.name}`}
                                                    >
                                                        {lighthouseLog &&
                                                        lighthouseLog.bestPractices
                                                            ? `${lighthouseLog.bestPractices}%`
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '18%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="SEO"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                SEO
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small
                                                        id={`lighthouse-seo-${monitor.name}`}
                                                    >
                                                        {lighthouseLog &&
                                                        lighthouseLog.seo
                                                            ? `${lighthouseLog.seo}%`
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="db-Trend-colInformation"
                                    style={{
                                        flexBasis: '18%',
                                    }}
                                >
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="PWA"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                PWA
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    <small
                                                        id={`lighthouse-pwa-${monitor.name}`}
                                                    >
                                                        {lighthouseLog &&
                                                        lighthouseLog.pwa
                                                            ? `${lighthouseLog.pwa}%`
                                                            : '-'}
                                                    </small>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ShouldRender>
            </>
        );
    } else if (type === 'manual' || type === 'incomingHttpRequest') {
        monitorInfo = (
            <div className="db-Trend">
                <div className="block-chart-side line-chart">
                    <div className="db-TrendRow">
                        <div className="db-Trend-colInformation">
                            <div
                                className="db-Trend-rowTitle"
                                title="Monitor Status"
                            >
                                <div className="db-Trend-title">
                                    <span className="chart-font">
                                        Monitor Status
                                    </span>
                                </div>
                            </div>
                            <div className="db-Trend-row">
                                <div className="db-Trend-col db-Trend-colValue">
                                    <span>
                                        {' '}
                                        <span
                                            className={`chart-font Text-color--${statusColor}`}
                                        >
                                            {monitorStatus}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="db-Trend-colInformation">
                            <div
                                className="db-Trend-rowTitle"
                                title="Uptime Stats"
                            >
                                <div className="db-Trend-title">
                                    <span className="chart-font">
                                        Uptime Stats
                                    </span>
                                </div>
                            </div>
                            <div className="db-Trend-row">
                                <div className="db-Trend-col db-Trend-colValue">
                                    <span>
                                        {' '}
                                        <span className="chart-font">
                                            {uptime} %
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="block-chart-main line-chart">
                    <AreaChart
                        type={type}
                        data={timeBlock}
                        name={'downtime'}
                        symbol="secs"
                    />
                </div>
            </div>
        );
    } else if (type === 'script') {
        monitorInfo = (
            <div className="db-Trend">
                <div className="block-chart-side line-chart">
                    <div className="db-TrendRow">
                        {isCurrentlyNotMonitoring ? (
                            <div className="db-Trend-colInformation probe-offline">
                                <div
                                    className="db-Trend-rowTitle"
                                    title="Currently not monitoring"
                                >
                                    <div className="db-Trend-title">
                                        <strong>
                                            <span className="chart-font">
                                                Currently not monitoring
                                            </span>
                                        </strong>
                                    </div>
                                </div>
                                <div className="db-Trend-rowTitle">
                                    <div className="db-Trend-title description">
                                        <small>
                                            <span className="chart-font">
                                                We&apos;re currently not
                                                monitoring this monitor from
                                                this probe because the probe is
                                                offline.
                                            </span>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Monitor Status"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Monitor Status
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span
                                                    className={`chart-font Text-color--${statusColor}`}
                                                >
                                                    {monitorStatus}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="db-Trend-colInformation">
                                    <div
                                        className="db-Trend-rowTitle"
                                        title="Uptime Stats"
                                    >
                                        <div className="db-Trend-title">
                                            <span className="chart-font">
                                                Uptime Stats
                                            </span>
                                        </div>
                                    </div>
                                    <div className="db-Trend-row">
                                        <div className="db-Trend-col db-Trend-colValue">
                                            <span>
                                                {' '}
                                                <span className="chart-font">
                                                    {uptime} %
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {!isCurrentlyNotMonitoring && (
                    <div className="block-chart-main line-chart">
                        <AreaChart
                            type={type}
                            data={data}
                            name={'monitorStatus'}
                        />
                    </div>
                )}
            </div>
        );
    } else {
        monitorInfo = (
            <div className="db-Trend">
                <span></span>
                <div className="db-Trend-colInformation">
                    <div className="db-Trend-rowTitle" title="Gross volume">
                        <div className="db-Trend-title">
                            <span className="chart-font">Monitor Status</span>
                        </div>
                    </div>
                    <div className="db-Trend-row">
                        <div className="db-Trend-col db-Trend-colValue">
                            <span>
                                {' '}
                                <span
                                    className={`chart-font Text-color--${statusColor}`}
                                >
                                    {monitorStatus}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="db-Trend-colInformation">
                    <div className="db-Trend-rowTitle" title="Gross volume">
                        <div className="db-Trend-title">
                            <span className="chart-font">Uptime Stats</span>
                        </div>
                    </div>
                    <div className="db-Trend-row">
                        <div className="db-Trend-col db-Trend-colValue">
                            <span>
                                {' '}
                                <span className="chart-font">{uptime} %</span>
                            </span>
                        </div>
                    </div>
                </div>
                <ShouldRender if={block && block.length > 0}>
                    <div className="db-Trend-colInformation">
                        <div className="db-Trend-rowTitle" title="Gross volume">
                            <div className="db-Trend-title">
                                <span className="chart-font">
                                    Response Time
                                </span>
                            </div>
                        </div>
                        <div className="db-Trend-row">
                            <div className="db-Trend-col db-Trend-colValue">
                                <span>
                                    {' '}
                                    <span className="chart-font">
                                        {responseTime} ms
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="block-chart-main">
                        <div className="block-chart">{block}</div>
                    </div>
                </ShouldRender>
            </div>
        );
    }

    return (
        <div className="db-Trends-content">
            <div className="db-TrendsRows">{monitorInfo}</div>
        </div>
    );
}

MonitorChart.displayName = 'MonitorChart';

MonitorChart.propTypes = {
    start: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.instanceOf(moment),
    ]),
    end: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.instanceOf(moment),
    ]),
    monitor: PropTypes.object,
    data: PropTypes.array,
    statuses: PropTypes.array,
    status: PropTypes.string,
    showAll: PropTypes.bool,
    activeProbe: PropTypes.number,
    probes: PropTypes.array,
    requesting: PropTypes.bool,
    openModal: PropTypes.func,
};

const mapStateToProps = state => {
    return {
        activeProbe: state.monitor.activeProbe,
        probes: state.probe.probes.data,
        requesting: state.monitor.fetchMonitorLogsRequest,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators({ openModal }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MonitorChart);
