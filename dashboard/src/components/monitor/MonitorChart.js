import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BlockChart from '../blockchart/BlockChart';
import AreaChart from '../areachart';
import toPascalCase from 'to-pascal-case';
import moment from 'moment';
import ShouldRender from '../basic/ShouldRender';
import { formatDecimal, formatBytes } from '../../config';

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

                if (monitorStatus.status === 'offline') {
                    timeObj.downTime =
                        timeObj.downTime + end.diff(start, 'seconds');
                    timeObj.date = end.toISOString();
                }
                if (monitorStatus.status === 'degraded') {
                    timeObj.degradedTime =
                        timeObj.degradedTime + end.diff(start, 'seconds');
                }
                if (monitorStatus.status === 'online') {
                    timeObj.upTime =
                        timeObj.upTime + end.diff(start, 'seconds');
                }
            }
        });

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
}) {
    const [now, setNow] = useState(Date.now());

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
        uptimePercent || uptimePercent === 0
            ? uptimePercent.toString().split('.')[0]
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

    const isCurrentlyNotMonitoring =
        (lastAlive && moment(now).diff(moment(lastAlive), 'seconds') >= 300) ||
        !lastAlive;

    let monitorInfo;
    if (type === 'server-monitor') {
        monitorInfo = (
            <Fragment>
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
                                                {checkLogs
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
                                                {checkLogs
                                                    ? formatDecimal(
                                                          data[0].avgCpuLoad,
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
                                                {checkLogs
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
                                                {checkLogs
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
                                                {checkLogs
                                                    ? formatBytes(
                                                          data[0].totalMemory
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
                                                {checkLogs
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
                        <AreaChart type={type} data={data} name={'memory'} />
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
                                                {checkLogs
                                                    ? formatBytes(
                                                          data[0].storageUsed
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
                                                {checkLogs
                                                    ? formatBytes(
                                                          data[0].totalStorage
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
                                                {checkLogs
                                                    ? formatDecimal(
                                                          data[0].storageUsage,
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
                                                    {checkLogs
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
                                                    {checkLogs
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
            </Fragment>
        );
    } else if (type === 'url' || type === 'api' || type === 'device') {
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
                                                            {responseTime} ms
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
    } else if (type === 'manual') {
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
};

const mapStateToProps = state => {
    return {
        activeProbe: state.monitor.activeProbe,
        probes: state.probe.probes.data,
    };
};

export default connect(mapStateToProps)(MonitorChart);
