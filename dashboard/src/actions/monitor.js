import { postApi, getApi, deleteApi, putApi } from '../api';
import * as types from '../constants/monitor';
import errors from '../errors';
import { change, autofill } from 'redux-form';
//import { PricingPlan } from '../config';
//import { User } from '../config';
//import { upgradePlanEmpty, upgradeToEnterpriseMail } from '../actions/project';

//Monitor list
//props -> {name: '', type, data -> { data.url}}
export function fetchMonitors(projectId) {
    return function(dispatch) {
        const promise = getApi(`monitor/${projectId}`);
        dispatch(fetchMonitorsRequest());

        promise.then(
            function(monitors) {
                dispatch(fetchMonitorsSuccess(monitors.data));
            },
            function(error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchMonitorsFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchMonitorsSuccess(monitors) {
    return {
        type: types.FETCH_MONITORS_SUCCESS,
        payload: monitors,
    };
}

export function fetchMonitorsRequest() {
    return {
        type: types.FETCH_MONITORS_REQUEST,
    };
}

export function fetchMonitorsFailure(error) {
    return {
        type: types.FETCH_MONITORS_FAILURE,
        payload: error,
    };
}

export function resetFetchMonitors() {
    return {
        type: types.FETCH_MONITORS_RESET,
    };
}

//Create new monitor
//props -> {name: '', type, data -> { data.url}}
export function createMonitor(projectId, values) {
    values.projectId = values.projectId._id || values.projectId;
    return function(dispatch) {
        dispatch(createMonitorRequest());
        const promise = postApi(`monitor/${projectId}`, values);
        promise.then(
            function(monitor) {
                dispatch(createMonitorSuccess(monitor.data));
                return monitor.data;
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(createMonitorFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function toggleEdit(payload) {
    return {
        type: types.TOGGLE_EDIT,
        payload,
    };
}

export function createMonitorSuccess(newMonitor) {
    return {
        type: types.CREATE_MONITOR_SUCCESS,
        payload: newMonitor,
    };
}

export function createMonitorRequest() {
    return {
        type: types.CREATE_MONITOR_REQUEST,
    };
}

export function createMonitorFailure(error) {
    return {
        type: types.CREATE_MONITOR_FAILURE,
        payload: error,
    };
}

export function resetCreateMonitor() {
    return {
        type: types.CREATE_MONITOR_RESET,
    };
}

//Edit new monitor
//props -> {name: '', type, data -> { data.url}}
export function editMonitor(projectId, values) {
    values.projectId = values.projectId._id || values.projectId;

    return function(dispatch) {
        const promise = putApi(`monitor/${projectId}/${values._id}`, values);
        if (
            !values.lighthouseScanStatus ||
            (values.lighthouseScanStatus &&
                values.lighthouseScanStatus !== 'scan')
        ) {
            dispatch(editMonitorRequest());
        }

        promise.then(
            function(monitor) {
                dispatch(editMonitorSuccess(monitor.data));
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(editMonitorFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function editMonitorSuccess(newMonitor) {
    return {
        type: types.EDIT_MONITOR_SUCCESS,
        payload: newMonitor,
    };
}

export function editMonitorRequest() {
    return {
        type: types.EDIT_MONITOR_REQUEST,
    };
}

export function editMonitorFailure(error) {
    return {
        type: types.EDIT_MONITOR_FAILURE,
        payload: error,
    };
}

export function editMonitorSwitch(index) {
    return {
        type: types.EDIT_MONITOR_SWITCH,
        payload: index,
    };
}

export function resetEditMonitor() {
    return {
        type: types.EDIT_MONITOR_RESET,
    };
}

//Add new site url
//props -> siteUrl
export function addSiteUrl(monitorId, projectId, siteUrl) {
    return function(dispatch) {
        const promise = postApi(`monitor/${projectId}/siteUrl/${monitorId}`, {
            siteUrl,
        });
        dispatch(editMonitorRequest());

        promise.then(
            function(monitor) {
                dispatch(editMonitorSuccess(monitor.data));
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(editMonitorFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function deleteSiteUrl(monitorId, projectId, siteUrl) {
    return function(dispatch) {
        const promise = deleteApi(`monitor/${projectId}/siteUrl/${monitorId}`, {
            siteUrl,
        });
        dispatch(editMonitorRequest());

        promise.then(
            function(monitor) {
                dispatch(editMonitorSuccess(monitor.data));
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(editMonitorFailure(errors(error)));
            }
        );

        return promise;
    };
}

//Delete a monitor
//props -> {name: '', type, data -> { data.url}}
export function deleteMonitor(monitorId, projectId) {
    return function(dispatch) {
        const promise = deleteApi(`monitor/${projectId}/${monitorId}`, {
            monitorId,
        });
        dispatch(deleteMonitorRequest(monitorId));

        promise.then(
            function(monitor) {
                dispatch(deleteMonitorSuccess(monitor.data._id));
            },
            function(error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(
                    deleteMonitorFailure({ error: errors(error), monitorId })
                );
            }
        );

        return promise;
    };
}

export function deleteMonitorSuccess(removedMonitorId) {
    return {
        type: types.DELETE_MONITOR_SUCCESS,
        payload: removedMonitorId,
    };
}

export function deleteMonitorRequest(monitorId) {
    return {
        type: types.DELETE_MONITOR_REQUEST,
        payload: monitorId,
    };
}

export function deleteMonitorFailure(error) {
    return {
        type: types.DELETE_MONITOR_FAILURE,
        payload: error,
    };
}

export function deleteProjectMonitors(projectId) {
    return {
        type: types.DELETE_PROJECT_MONITORS,
        payload: projectId,
    };
}

//Fetch Incidents of monitors
//props -> {name: '', type, data -> { data.url}}
export function fetchMonitorsIncidents(projectId, monitorId, skip, limit) {
    return function(dispatch) {
        const promise = postApi(`incident/${projectId}/monitor/${monitorId}`, {
            limit,
            skip,
        });
        dispatch(fetchMonitorsIncidentsRequest(monitorId));

        promise.then(
            function(monitors) {
                dispatch(
                    fetchMonitorsIncidentsSuccess({
                        projectId,
                        monitorId,
                        incidents: monitors.data,
                        skip,
                        limit,
                        count: monitors.data.count,
                    })
                );
            },
            function(error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchMonitorsIncidentsFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchMonitorsIncidentsSuccess(monitors) {
    return {
        type: types.FETCH_MONITORS_INCIDENT_SUCCESS,
        payload: monitors,
    };
}

export function fetchMonitorsIncidentsRequest(monitorId) {
    return {
        type: types.FETCH_MONITORS_INCIDENT_REQUEST,
        payload: monitorId,
    };
}

export function fetchMonitorsIncidentsFailure(error) {
    return {
        type: types.FETCH_MONITORS_INCIDENT_FAILURE,
        payload: error,
    };
}

//Fetch Subscribers of monitors
export function fetchMonitorsSubscribers(projectId, monitorId, skip, limit) {
    return function(dispatch) {
        const promise = getApi(
            `subscriber/${projectId}/monitor/${monitorId}?limit=${limit}&skip=${skip}`
        );
        dispatch(fetchMonitorsSubscribersRequest(monitorId));

        promise.then(
            function(subscribers) {
                dispatch(
                    fetchMonitorsSubscribersSuccess({
                        projectId,
                        monitorId,
                        subscribers: subscribers.data,
                        skip: skip,
                        limit: limit,
                        count: subscribers.data.count,
                    })
                );
            },
            function(error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchMonitorsSubscribersFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchMonitorsSubscribersSuccess(monitors) {
    return {
        type: types.FETCH_MONITORS_SUBSCRIBER_SUCCESS,
        payload: monitors,
    };
}

export function fetchMonitorsSubscribersRequest(monitorId) {
    return {
        type: types.FETCH_MONITORS_SUBSCRIBER_REQUEST,
        payload: monitorId,
    };
}

export function fetchMonitorsSubscribersFailure(error) {
    return {
        type: types.FETCH_MONITORS_SUBSCRIBER_FAILURE,
        payload: error,
    };
}

// Fetch Monitor Logs
export function fetchMonitorLogs(projectId, monitorId, startDate, endDate) {
    return function(dispatch) {
        const promise = postApi(
            `monitor/${projectId}/monitorLog/${monitorId}`,
            { startDate, endDate }
        );
        dispatch(fetchMonitorLogsRequest());
        dispatch(updateDateRange(startDate, endDate));

        promise.then(
            function(monitorLogs) {
                dispatch(
                    fetchMonitorLogsSuccess({
                        projectId,
                        monitorId,
                        logs: monitorLogs.data,
                    })
                );
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchMonitorLogsFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function updateDateRange(startDate, endDate) {
    return {
        type: 'UPDATE_DATE_RANGE',
        payload: { startDate, endDate },
    };
}

export function fetchMonitorLogsRequest() {
    return {
        type: types.FETCH_MONITOR_LOGS_REQUEST,
    };
}

export function fetchMonitorLogsSuccess(monitorLogs) {
    return {
        type: types.FETCH_MONITOR_LOGS_SUCCESS,
        payload: monitorLogs,
    };
}

export function fetchMonitorLogsFailure(error) {
    return {
        type: types.FETCH_MONITOR_LOGS_FAILURE,
        payload: error,
    };
}

// Fetch Monitor Statuses list
export function fetchMonitorStatuses(projectId, monitorId, startDate, endDate) {
    return function(dispatch) {
        const promise = postApi(
            `monitor/${projectId}/monitorStatuses/${monitorId}`,
            { startDate, endDate }
        );
        dispatch(fetchMonitorStatusesRequest());

        promise.then(
            function(monitorStatuses) {
                dispatch(
                    fetchMonitorStatusesSuccess({
                        projectId,
                        monitorId,
                        statuses: monitorStatuses.data,
                    })
                );
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchMonitorStatusesFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchMonitorStatusesRequest() {
    return {
        type: types.FETCH_MONITOR_STATUSES_REQUEST,
    };
}

export function fetchMonitorStatusesSuccess(monitorStatuses) {
    return {
        type: types.FETCH_MONITOR_STATUSES_SUCCESS,
        payload: monitorStatuses,
    };
}

export function fetchMonitorStatusesFailure(error) {
    return {
        type: types.FETCH_MONITOR_STATUSES_FAILURE,
        payload: error,
    };
}

// Fetch Monitor Criteria
export function fetchMonitorCriteria() {
    return function(dispatch) {
        const promise = getApi('monitorCriteria');
        dispatch(fetchMonitorCriteriaRequest());

        promise.then(
            function(monitorCriteria) {
                dispatch(fetchMonitorCriteriaSuccess(monitorCriteria));
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchMonitorCriteriaFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchMonitorCriteriaRequest() {
    return {
        type: types.FETCH_MONITOR_CRITERIA_REQUEST,
    };
}

export function fetchMonitorCriteriaSuccess(monitorCriteria) {
    return {
        type: types.FETCH_MONITOR_CRITERIA_SUCCESS,
        payload: monitorCriteria,
    };
}

export function fetchMonitorCriteriaFailure(error) {
    return {
        type: types.FETCH_MONITOR_CRITERIA_FAILURE,
        payload: error,
    };
}

export function setMonitorCriteria(
    monitorName,
    monitorCategory,
    monitorSubProject,
    monitorCallSchedule,
    monitorSla,
    incidentCommunicationSla,
    monitorType
) {
    return function(dispatch) {
        dispatch({
            type: types.SET_MONITOR_CRITERIA,
            payload: {
                name: monitorName,
                category: monitorCategory,
                subProject: monitorSubProject,
                schedule: monitorCallSchedule,
                type: monitorType,
                monitorSla,
                incidentCommunicationSla,
            },
        });
    };
}

//Fetch Logs of monitors
export function getMonitorLogs(
    projectId,
    monitorId,
    skip,
    limit,
    startDate,
    endDate,
    probeValue,
    incidentId
) {
    return function(dispatch) {
        const promise = postApi(
            `monitor/${projectId}/monitorLogs/${monitorId}`,
            {
                skip,
                limit,
                startDate,
                endDate,
                probeValue,
                incidentId: incidentId ? incidentId : null,
            }
        );
        dispatch(getMonitorLogsRequest({ monitorId }));

        promise.then(
            function(monitors) {
                dispatch(
                    getMonitorLogsSuccess({
                        monitorId,
                        logs: monitors.data.data,
                        skip,
                        limit,
                        count: monitors.data.count,
                    })
                );
            },
            function(error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(
                    getMonitorLogsFailure({ monitorId, error: errors(error) })
                );
            }
        );
        return promise;
    };
}

export function getMonitorLogsSuccess(logs) {
    return {
        type: types.GET_MONITOR_LOGS_SUCCESS,
        payload: logs,
    };
}

export function getMonitorLogsRequest(logs) {
    return {
        type: types.GET_MONITOR_LOGS_REQUEST,
        payload: logs,
    };
}

export function getMonitorLogsFailure(error) {
    return {
        type: types.GET_MONITOR_LOGS_FAILURE,
        payload: error,
    };
}

// Fetch Lighthouse Logs list
export function fetchLighthouseLogs(projectId, monitorId, skip, limit, url) {
    return function(dispatch) {
        const promise = getApi(
            url
                ? `monitor/${projectId}/lighthouseLog/${monitorId}?limit=${limit}&skip=${skip}&url=${url}`
                : `monitor/${projectId}/lighthouseLog/${monitorId}?limit=${limit}&skip=${skip}`
        );
        dispatch(fetchLighthouseLogsRequest());

        promise.then(
            function(lighthouseLogs) {
                dispatch(
                    fetchLighthouseLogsSuccess({
                        projectId,
                        monitorId,
                        logs: lighthouseLogs.data,
                        skip,
                        limit,
                        count: lighthouseLogs.data.count,
                    })
                );
            },
            function(error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchLighthouseLogsFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchLighthouseLogsRequest() {
    return {
        type: types.FETCH_LIGHTHOUSE_LOGS_REQUEST,
    };
}

export function fetchLighthouseLogsSuccess(lighthouseLogs) {
    return {
        type: types.FETCH_LIGHTHOUSE_LOGS_SUCCESS,
        payload: lighthouseLogs,
    };
}

export function fetchLighthouseLogsFailure(error) {
    return {
        type: types.FETCH_LIGHTHOUSE_LOGS_FAILURE,
        payload: error,
    };
}

// Fetch Monitor Issue list
export function fetchMonitorIssue(projectId, issueId) {
    return function(dispatch) {
        const promise = getApi(
            `monitor/${projectId}/lighthouseIssue/${issueId}`
        );
        dispatch(fetchMonitorIssueRequest());

        promise.then(
            function(monitorIssue) {
                dispatch(fetchMonitorIssueSuccess(monitorIssue.data));
            },
            function(error) {
                if (error && error.response && error.response.data)
                    error = error.response.data;
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(fetchMonitorIssueFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchMonitorIssueRequest() {
    return {
        type: types.FETCH_MONITOR_ISSUE_REQUEST,
    };
}

export function fetchMonitorIssueSuccess(monitorIssue) {
    return {
        type: types.FETCH_MONITOR_ISSUE_SUCCESS,
        payload: monitorIssue,
    };
}

export function fetchMonitorIssueFailure(error) {
    return {
        type: types.FETCH_MONITOR_ISSUE_FAILURE,
        payload: error,
    };
}

export function addSeat(projectId) {
    return function(dispatch) {
        const promise = postApi(`monitor/${projectId}/addseat`, {});
        dispatch(addSeatRequest());

        promise.then(
            function(monitor) {
                dispatch(createMonitorFailure(monitor.data));
                dispatch(addSeatSuccess(monitor.data));
            },
            function(error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(addSeatFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function addSeatSuccess(message) {
    return {
        type: types.ADD_SEAT_SUCCESS,
        payload: message,
    };
}

export function addSeatRequest() {
    return {
        type: types.ADD_SEAT_REQUEST,
    };
}

export function addSeatFailure(error) {
    return {
        type: types.ADD_SEAT_FAILURE,
        payload: error,
    };
}

export function addSeatReset() {
    return {
        type: types.ADD_SEAT_RESET,
    };
}

export function addArrayField(val) {
    return function(dispatch) {
        dispatch(change('NewMonitor', `${val}.field3`, true));
    };
}

export function removeArrayField(val) {
    return function(dispatch) {
        dispatch(change('NewMonitor', `${val}.field3`, false));
        dispatch(autofill('NewMonitor', `${val}.collection`, undefined));
    };
}

export function selectedProbe(val) {
    return function(dispatch) {
        dispatch({
            type: types.SELECT_PROBE,
            payload: val,
        });
    };
}

export const closeBreachedMonitorSlaRequest = () => ({
    type: types.CLOSE_BREACHED_MONITOR_SLA_REQUEST,
});

export const closeBreachedMonitorSlaSuccess = payload => ({
    type: types.CLOSE_BREACHED_MONITOR_SLA_SUCCESS,
    payload,
});

export const closeBreachedMonitorSlaFailure = error => ({
    type: types.CLOSE_BREACHED_MONITOR_SLA_FAILURE,
    payload: error,
});

export const closeBreachedMonitorSla = (projectId, slaId) => async dispatch => {
    try {
        dispatch(closeBreachedMonitorSlaRequest());

        const response = await postApi(
            `monitor/${projectId}/closeSla/${slaId}`
        );
        dispatch(closeBreachedMonitorSlaSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(closeBreachedMonitorSlaFailure(errorMsg));
    }
};

export const fetchBreachedMonitorSlaRequest = () => ({
    type: types.FETCH_BREACHED_MONITOR_SLA_REQUEST,
});

export const fetchBreachedMonitorSlaSuccess = payload => ({
    type: types.FETCH_BREACHED_MONITOR_SLA_SUCCESS,
    payload,
});

export const fetchBreachedMonitorSlaFailure = error => ({
    type: types.FETCH_BREACHED_MONITOR_SLA_FAILURE,
    payload: error,
});

export const fetchBreachedMonitorSla = projectId => async dispatch => {
    try {
        dispatch(fetchBreachedMonitorSlaRequest());

        const response = await getApi(
            `monitor/${projectId}/monitorSlaBreaches`
        );
        dispatch(fetchBreachedMonitorSlaSuccess(response.data));
    } catch (error) {
        const errorMsg =
            error.response && error.response.data
                ? error.response.data
                : error.data
                ? error.data
                : error.message
                ? error.message
                : 'Network Error';
        dispatch(fetchBreachedMonitorSlaFailure(errorMsg));
    }
};
