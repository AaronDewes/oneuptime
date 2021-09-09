import isEmail from 'sane-email-validation';
import validUrl from 'valid-url';
let apiUrl = window.location.origin + '/api';
let dashboardUrl = window.location.origin + '/dashboard';
let accountsUrl = window.location.origin + '/accounts';
let realtimeUrl = window.location.origin + '/realtime';

export function env(value) {
    const { _env } = window;
    return (
        (_env && _env[`REACT_APP_${value}`]) ||
        process.env[`REACT_APP_${value}`]
    );
}

let protocol = window.location.protocol;
if (env('BACKEND_PROTOCOL')) {
    protocol = env('BACKEND_PROTOCOL') + ':';
}

if (
    window &&
    window.location &&
    window.location.host &&
    (window.location.host.includes('localhost:') ||
        window.location.host.includes('0.0.0.0:') ||
        window.location.host.includes('127.0.0.1:'))
) {
    apiUrl = protocol + '//localhost:3002/api';
    dashboardUrl = protocol + '//localhost:3000/dashboard';
    accountsUrl = protocol + '//localhost:3003/accounts';
    realtimeUrl = protocol + '//localhost:3300/realtime';
} else if (env('FYIPE_HOST')) {
    const FYIPE_HOST = env('FYIPE_HOST').replace(/(http:\/\/|https:\/\/)/, ''); // remove any protocol that might have been added
    apiUrl = protocol + `//${FYIPE_HOST}/api`;
    dashboardUrl = protocol + `//${FYIPE_HOST}/dashboard`;
    accountsUrl = protocol + `//${FYIPE_HOST}/accounts`;
    realtimeUrl = protocol + `//${FYIPE_HOST}/realtime`;
}

export const API_URL = apiUrl;

export const REALTIME_URL = realtimeUrl;

export const DASHBOARD_URL = dashboardUrl;

export const ACCOUNTS_URL = accountsUrl;

export const DOMAIN = window.location.origin;

export const VERSION = process.env.VERSION || env('VERSION');

export const SENTRY_DSN = process.env.SENTRY_DSN || env('SENTRY_DSN');

export const User = {
    getAccessToken() {
        return localStorage.getItem('access_token');
    },

    setAccessToken(token) {
        localStorage.setItem('access_token', token);
    },

    setUserId(id) {
        localStorage.setItem('id', id);
    },

    getUserId() {
        return localStorage.getItem('id');
    },

    clear() {
        localStorage.clear();
    },

    removeUserId() {
        localStorage.removeItem('id');
    },

    removeAccessToken() {
        localStorage.removeItem('token');
    },

    isLoggedIn() {
        return Boolean(localStorage.getItem('access_token'));
    },
};

// Data validation Util goes in here.
export const Validate = {
    isDomain(domain) {
        return domain.search(/\./) >= 0;
    },

    url(url) {
        return validUrl.isUri(url);
    },

    text(text) {
        if (!text || text.trim() === '') {
            return false;
        }

        return true;
    },

    email(email) {
        if (this.text(email)) return isEmail(email);

        return false;
    },

    compare(text1, text2) {
        return text1 === text2;
    },
};

export function getQueryVar(variable, url) {
    if (!url) url = window.location.href;
    variable = variable.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + variable + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export const bindRaf = fn => {
    let isRunning = null;
    let args = null;

    const run = () => {
        isRunning = false;
        fn(...args);
    };

    return function(...invokingArguments) {
        args = invokingArguments;

        if (isRunning) {
            return;
        }

        isRunning = true;
        requestAnimationFrame(run);
    };
};

export const filterProbeData = (monitor, probe, backupStatus) => {
    const monitorStatuses = monitor.statuses || backupStatus;

    const probesStatus =
        monitorStatuses && monitorStatuses.length > 0
            ? probe
                ? monitorStatuses.filter(probeStatuses => {
                      return (
                          probeStatuses._id === null ||
                          String(probeStatuses._id) === String(probe._id)
                      );
                  })
                : monitorStatuses
            : [];
    const statuses =
        probesStatus &&
        probesStatus[0] &&
        probesStatus[0].statuses &&
        probesStatus[0].statuses.length > 0
            ? probesStatus[0].statuses
            : [];

    return statuses;
};

export const getMonitorStatus = statuses =>
    statuses && statuses.length > 0 ? statuses[0].status || 'online' : 'online';

export function getServiceStatus(monitorsData, probes) {
    const monitorsLength = monitorsData.length;
    const probesLength = probes && probes.length;

    const totalServices = monitorsLength * probesLength;
    let onlineServices = totalServices;
    let degraded = 0;

    monitorsData.forEach(monitor => {
        probes.forEach(probe => {
            const statuses = filterProbeData(monitor, probe);
            const monitorStatus = monitor.status
                ? monitor.status
                : getMonitorStatus(statuses);
            if (monitorStatus === 'offline') {
                onlineServices--;
            }
            if (monitorStatus === 'degraded') {
                degraded++;
            }
        });
    });

    if (onlineServices === totalServices) {
        if (degraded !== 0) return 'some-degraded';
        return 'all';
    } else if (onlineServices === 0) {
        return 'none';
    } else if (onlineServices < totalServices) {
        return 'some';
    }
}

export const formatDecimal = (value, decimalPlaces) => {
    return Number(
        Math.round(parseFloat(value + 'e' + decimalPlaces)) +
            'e-' +
            decimalPlaces
    ).toFixed(decimalPlaces);
};

export const formatBytes = (a, b, c, d, e) => {
    return (
        formatDecimal(
            ((b = Math),
            (c = b.log),
            (d = 1e3),
            (e = (c(a) / c(d)) | 0),
            a / b.pow(d, e)),
            2
        ) +
        ' ' +
        (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes')
    );
};

export const capitalize = words => {
    if (!words || !words.trim()) return '';

    words = words.split(' ');
    words = words.map(
        word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

    return words.join(' ').trim();
};

export const handleResources = (monitorState, announcement) => {
    const affectedMonitors = [];
    let monitorCount = 0;

    if (announcement.monitors.length <= 0) {
        return 'No resource is affected';
    }

    const announcementMonitors = [];
    // populate the ids of the announcement monitors in an array
    announcement &&
        announcement.monitors &&
        announcement.monitors.map(monitor => {
            announcementMonitors.push(
                String(monitor.monitorId._id || monitor.monitorId)
            );
            return monitor;
        });

    monitorState.map(monitor => {
        if (announcementMonitors.includes(String(monitor._id))) {
            affectedMonitors.push(monitor);
            monitorCount += 1;
        }
        return monitor;
    });
    // check if the length of monitors on status page equals the monitor count
    // if they are equal then all the monitors in status page is in a particular scheduled event
    if (monitorCount === monitorState.length) {
        return 'All resources are affected';
    } else {
        const result = affectedMonitors
            .map(monitor => capitalize(monitor.name))
            .join(', ')
            .replace(/, ([^,]*)$/, ' and $1');
        return result;
    }
};

export const cacheProvider = {
    get: (language, key) =>
        ((JSON.parse(localStorage.getItem('translations')) || {})[key] || {})[
            language
        ],
    set: (language, key, value) => {
        const existing = JSON.parse(localStorage.getItem('translations')) || {
            [key]: {},
        };
        existing[key] = { ...existing[key], [language]: value };
        localStorage.setItem('translations', JSON.stringify(existing));
    },
};
