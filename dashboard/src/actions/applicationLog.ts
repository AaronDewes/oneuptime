import { postApi, getApi, deleteApi, putApi } from '../api';
import * as types from '../constants/applicationLog';
import errors from '../errors';

//Create new log container
//props -> {name: '', type, data -> { data.url}}
export function createApplicationLog(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    values: $TSFixMe
) {
    return function(dispatch: $TSFixMe) {
        const promise = postApi(
            `application-log/${projectId}/${componentId}/create`,
            values
        );
        dispatch(createApplicationLogRequest());

        promise.then(
            function(applicationLog) {
                dispatch(createApplicationLogSuccess(applicationLog.data));
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
                dispatch(createApplicationLogFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function createApplicationLogSuccess(newApplicationLog: $TSFixMe) {
    return {
        type: types.CREATE_APPLICATION_LOG_SUCCESS,
        payload: newApplicationLog,
    };
}

export function createApplicationLogRequest() {
    return {
        type: types.CREATE_APPLICATION_LOG_REQUEST,
    };
}

export function createApplicationLogFailure(error: $TSFixMe) {
    return {
        type: types.CREATE_APPLICATION_LOG_FAILURE,
        payload: error,
    };
}

export function resetCreateApplicationLog() {
    return {
        type: types.CREATE_APPLICATION_LOG_RESET,
    };
}

export function fetchApplicationLogs(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    skip = 0,
    limit = 0,
    paginated = false
) {
    return function(dispatch: $TSFixMe) {
        const promise = getApi(
            `application-log/${projectId}/${componentId}?skip=${skip}&limit=${limit}`
        );
        dispatch(fetchApplicationLogsRequest(paginated));

        promise.then(
            function(applicationLogs) {
                dispatch(fetchApplicationLogsSuccess(applicationLogs.data));
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
                dispatch(fetchApplicationLogsFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function fetchApplicationLogsSuccess(applicationLogs: $TSFixMe) {
    return {
        type: types.FETCH_APPLICATION_LOGS_SUCCESS,
        payload: applicationLogs,
    };
}

export function fetchApplicationLogsRequest(paginated: $TSFixMe) {
    return {
        type: types.FETCH_APPLICATION_LOGS_REQUEST,
        payload: paginated,
    };
}

export function fetchApplicationLogsFailure(error: $TSFixMe) {
    return {
        type: types.FETCH_APPLICATION_LOGS_FAILURE,
        payload: error,
    };
}

export function resetFetchApplicationLogs() {
    return {
        type: types.FETCH_APPLICATION_LOGS_RESET,
    };
}

//Delete a applicationLog
//props -> {name: '', type, data -> { data.url}}
export function deleteApplicationLog(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    applicationLogId: $TSFixMe
) {
    return function(dispatch: $TSFixMe) {
        const promise = deleteApi(
            `application-log/${projectId}/${componentId}/${applicationLogId}`,
            {
                applicationLogId,
            }
        );
        dispatch(deleteApplicationLogRequest(applicationLogId));

        promise.then(
            function(applicationLog) {
                dispatch(deleteApplicationLogSuccess(applicationLog.data._id));
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
                    deleteApplicationLogFailure({
                        error: errors(error),
                        applicationLogId,
                    })
                );
            }
        );

        return promise;
    };
}

export function deleteApplicationLogSuccess(removedApplicationLogId: $TSFixMe) {
    return {
        type: types.DELETE_APPLICATION_LOG_SUCCESS,
        payload: removedApplicationLogId,
    };
}

export function deleteApplicationLogRequest(applicationLogId: $TSFixMe) {
    return {
        type: types.DELETE_APPLICATION_LOG_REQUEST,
        payload: applicationLogId,
    };
}

export function deleteApplicationLogFailure(error: $TSFixMe) {
    return {
        type: types.DELETE_APPLICATION_LOG_FAILURE,
        payload: error,
    };
}

export function deleteComponentApplicationLogs(componentId: $TSFixMe) {
    return {
        type: types.DELETE_COMPONENT_APPLICATION_LOGS,
        payload: componentId,
    };
}

export function fetchLogs(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    applicationLogId: $TSFixMe,
    skip: $TSFixMe,
    limit: $TSFixMe,
    startDate: $TSFixMe,
    endDate: $TSFixMe,
    type: $TSFixMe,
    filter: $TSFixMe
) {
    return function(dispatch: $TSFixMe) {
        const promise = postApi(
            `application-log/${projectId}/${componentId}/${applicationLogId}/logs`,
            {
                skip,
                limit,
                startDate,
                endDate,
                type,
                filter,
            }
        );
        dispatch(fetchLogsRequest({ applicationLogId }));

        promise.then(
            function(response) {
                dispatch(
                    fetchLogsSuccess({
                        applicationLogId,

                        logs: response.data.data.logs,

                        dateRange: response.data.data.dateRange,
                        skip,
                        limit,

                        count: response.data.count,
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
                    fetchLogsFailure({ applicationLogId, error: errors(error) })
                );
            }
        );

        return promise;
    };
}

export function fetchLogsSuccess(logs: $TSFixMe) {
    return {
        type: types.FETCH_LOGS_SUCCESS,
        payload: logs,
    };
}

export function fetchLogsRequest(applicationLogId: $TSFixMe) {
    return {
        type: types.FETCH_LOGS_REQUEST,
        payload: applicationLogId,
    };
}

export function fetchLogsFailure(error: $TSFixMe) {
    return {
        type: types.FETCH_LOGS_FAILURE,
        payload: error,
    };
}
export function resetFetchLogs() {
    return {
        type: types.FETCH_LOGS_RESET,
    };
}

export function resetApplicationLogKey(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    applicationLogId: $TSFixMe
) {
    return function(dispatch: $TSFixMe) {
        const promise = postApi(
            `application-log/${projectId}/${componentId}/${applicationLogId}/reset-key`
        );
        dispatch(resetApplicationLogKeyRequest());

        promise.then(
            function(applicationLog) {
                dispatch(resetApplicationLogKeySuccess(applicationLog.data));
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
                dispatch(resetApplicationLogKeyFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function resetApplicationLogKeySuccess(applicationLog: $TSFixMe) {
    return {
        type: types.RESET_APPLICATION_LOG_KEY_SUCCESS,
        payload: applicationLog,
    };
}

export function resetApplicationLogKeyRequest() {
    return {
        type: types.RESET_APPLICATION_LOG_KEY_REQUEST,
    };
}

export function resetApplicationLogKeyFailure(error: $TSFixMe) {
    return {
        type: types.RESET_APPLICATION_LOG_KEY_FAILURE,
        payload: error,
    };
}

export function resetresetApplicationLogKey() {
    return {
        type: types.RESET_APPLICATION_LOG_KEY_RESET,
    };
}
export function editApplicationLogSwitch(index: $TSFixMe) {
    return {
        type: types.EDIT_APPLICATION_LOG_SWITCH,
        payload: index,
    };
}
//Edit new applicationLog
export function editApplicationLog(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    applicationLogId: $TSFixMe,
    values: $TSFixMe
) {
    return function(dispatch: $TSFixMe) {
        const promise = putApi(
            `application-log/${projectId}/${componentId}/${applicationLogId}`,
            values
        );
        dispatch(editApplicationLogRequest());

        promise.then(
            function(applicationLog) {
                dispatch(editApplicationLogSuccess(applicationLog.data));
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
                dispatch(editApplicationLogFailure(errors(error)));
            }
        );

        return promise;
    };
}

export function editApplicationLogSuccess(newApplicationLog: $TSFixMe) {
    return {
        type: types.EDIT_APPLICATION_LOG_SUCCESS,
        payload: newApplicationLog,
    };
}

export function editApplicationLogRequest() {
    return {
        type: types.EDIT_APPLICATION_LOG_REQUEST,
    };
}

export function editApplicationLogFailure(error: $TSFixMe) {
    return {
        type: types.EDIT_APPLICATION_LOG_FAILURE,
        payload: error,
    };
}

export function fetchStats(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    applicationLogId: $TSFixMe
) {
    return function(dispatch: $TSFixMe) {
        const promise = postApi(
            `application-log/${projectId}/${componentId}/${applicationLogId}/stats`,
            {}
        );
        dispatch(fetchStatsRequest({ applicationLogId }));

        promise.then(
            function(logs) {
                dispatch(
                    fetchStatsSuccess({
                        applicationLogId,

                        stats: logs.data.data,
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
                    fetchStatsFailure({
                        applicationLogId,
                        error: errors(error),
                    })
                );
            }
        );

        return promise;
    };
}

export function fetchStatsSuccess(stats: $TSFixMe) {
    return {
        type: types.FETCH_LOG_STAT_SUCCESS,
        payload: stats,
    };
}

export function fetchStatsRequest(applicationLogId: $TSFixMe) {
    return {
        type: types.FETCH_LOG_STAT_REQUEST,
        payload: applicationLogId,
    };
}

export function fetchStatsFailure(error: $TSFixMe) {
    return {
        type: types.FETCH_LOG_STAT_FAILURE,
        payload: error,
    };
}
export function resetFetchStats() {
    return {
        type: types.FETCH_LOG_STAT_RESET,
    };
}
export function getLogSuccess(log: $TSFixMe) {
    return {
        type: types.GET_LOG_SUCCESS,
        payload: log,
    };
}

export function searchLog(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    applicationLogId: $TSFixMe,
    payload: $TSFixMe
) {
    return function(dispatch: $TSFixMe) {
        const promise = postApi(
            `application-log/${projectId}/${componentId}/${applicationLogId}/search`,
            payload
        );
        dispatch(fetchLogsRequest({ applicationLogId }));
        promise.then(
            function(response) {
                dispatch(
                    fetchLogsSuccess({
                        applicationLogId,

                        logs: response.data.searchedLogs,

                        count: response.data.totalSearchCount,
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
                    fetchLogsFailure({ applicationLogId, error: errors(error) })
                );
            }
        );
        return promise;
    };
}
