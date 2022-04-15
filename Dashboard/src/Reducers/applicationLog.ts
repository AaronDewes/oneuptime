import {
    CREATE_APPLICATION_LOG_FAILURE,
    CREATE_APPLICATION_LOG_REQUEST,
    CREATE_APPLICATION_LOG_RESET,
    CREATE_APPLICATION_LOG_SUCCESS,
    FETCH_APPLICATION_LOGS_FAILURE,
    FETCH_APPLICATION_LOGS_REQUEST,
    FETCH_APPLICATION_LOGS_RESET,
    FETCH_APPLICATION_LOGS_SUCCESS,
    DELETE_APPLICATION_LOG_FAILURE,
    DELETE_APPLICATION_LOG_REQUEST,
    DELETE_APPLICATION_LOG_SUCCESS,
    DELETE_COMPONENT_APPLICATION_LOGS,
    FETCH_LOGS_FAILURE,
    FETCH_LOGS_REQUEST,
    FETCH_LOGS_RESET,
    FETCH_LOGS_SUCCESS,
    RESET_APPLICATION_LOG_KEY_FAILURE,
    RESET_APPLICATION_LOG_KEY_REQUEST,
    RESET_APPLICATION_LOG_KEY_RESET,
    RESET_APPLICATION_LOG_KEY_SUCCESS,
    EDIT_APPLICATION_LOG_SWITCH,
    EDIT_APPLICATION_LOG_FAILURE,
    EDIT_APPLICATION_LOG_REQUEST,
    EDIT_APPLICATION_LOG_RESET,
    EDIT_APPLICATION_LOG_SUCCESS,
    FETCH_LOG_STAT_FAILURE,
    FETCH_LOG_STAT_REQUEST,
    FETCH_LOG_STAT_RESET,
    FETCH_LOG_STAT_SUCCESS,
    GET_LOG_SUCCESS,
} from '../constants/applicationLog';
import moment from 'moment';

import Action from 'CommonUI/src/types/action';

const INITIAL_STATE: $TSFixMe = {
    newApplicationLog: {
        applicationLog: null,
        error: null,
        requesting: false,
        success: false,
        initialValue: null,
    },
    applicationLogsList: {
        applicationLogs: [],
        error: null,
        requesting: false,
        success: false,
        startDate: moment().subtract(30, 'd'),
        endDate: moment(),
        paginatedRequest: false,
    },
    logs: {},
    editApplicationLog: {
        requesting: false,
        error: null,
        success: false,
    },
    stats: {},
};
export default function applicationLog(
    state: $TSFixMe = INITIAL_STATE,
    action: Action
): void {
    let applicationLogs: $TSFixMe,
        failureLogs: $TSFixMe,
        requestLogs: $TSFixMe,
        failureStats: $TSFixMe,
        requestStats: $TSFixMe,
        logCount: $TSFixMe,
        typeCount: $TSFixMe;
    switch (action.type) {
        case CREATE_APPLICATION_LOG_SUCCESS:
            return Object.assign({}, state, {
                newApplicationLog: INITIAL_STATE.newApplicationLog,
                applicationLogsList: {
                    ...state.applicationLogsList,
                    applicationLogs: [action.payload].concat(
                        state.applicationLogsList.applicationLogs
                    ),
                },
            });
        case CREATE_APPLICATION_LOG_FAILURE:
            return Object.assign({}, state, {
                newApplicationLog: {
                    ...state.newApplicationLog,
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case CREATE_APPLICATION_LOG_RESET:
            return Object.assign({}, state, {
                newApplicationLog: INITIAL_STATE.newApplicationLog,
            });

        case CREATE_APPLICATION_LOG_REQUEST:
            return Object.assign({}, state, {
                newApplicationLog: {
                    ...state.newApplicationLog,
                    requesting: true,
                },
            });
        case FETCH_APPLICATION_LOGS_SUCCESS:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: null,
                    success: true,
                    applicationLogs: action.payload.applicationLogs,
                    count: action.payload.count,
                    skip: action.payload.skip,
                    limit: action.payload.limit,
                    paginatedRequest: false,
                },
            });

        case FETCH_APPLICATION_LOGS_FAILURE:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: action.payload,
                    success: false,
                    paginatedRequest: false,
                },
            });

        case FETCH_APPLICATION_LOGS_RESET:
            return Object.assign({}, state, {
                applicationLogsList: INITIAL_STATE.applicationLogsList,
            });

        case FETCH_APPLICATION_LOGS_REQUEST:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: action.payload ? false : true,
                    error: null,
                    success: false,
                    paginatedRequest: true,
                },
            });

        case DELETE_APPLICATION_LOG_SUCCESS:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: null,
                    success: true,
                    applicationLogs:
                        state.applicationLogsList.applicationLogs.filter(
                            ({ _id }: $TSFixMe) => {
                                return _id !== action.payload;
                            }
                        ),
                },
                deleteApplicationLog: false,
            });

        case DELETE_APPLICATION_LOG_FAILURE:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
                deleteApplicationLog: false,
            });

        case DELETE_APPLICATION_LOG_REQUEST:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: null,
                    success: false,
                },
                deleteApplicationLog: action.payload,
            });

        case DELETE_COMPONENT_APPLICATION_LOGS:
            applicationLogs = Object.assign(
                [],
                state.applicationLogsList.applicationLogs
            );
            applicationLogs = applicationLogs.filter(
                (applicationLog: $TSFixMe) => {
                    return action.payload !== applicationLog.componentId;
                }
            );

            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    applicationLogs,
                    error: null,
                    loading: false,
                },
            });
        case FETCH_LOGS_SUCCESS:
            return Object.assign({}, state, {
                logs: {
                    ...state.logs,
                    [action.payload.applicationLogId]: {
                        logs: action.payload.logs,
                        dateRange: action.payload.dateRange,
                        error: null,
                        requesting: false,
                        success: true,
                        skip: action.payload.skip,
                        limit: action.payload.limit,
                        count: action.payload.count,
                    },
                },
            });

        case FETCH_LOGS_FAILURE:
            failureLogs = {
                ...state.logs,

                [action.payload.applicationLogId]: state.logs[
                    action.payload.applicationLogId
                ]
                    ? {
                          ...state.logs[action.payload.applicationLogId],
                          error: action.payload.error,
                      }
                    : {
                          logs: [],
                          error: action.payload.error,
                          requesting: false,
                          success: false,
                          skip: 0,
                          limit: 10,
                          count: null,
                      },
            };
            return Object.assign({}, state, {
                logs: failureLogs,
            });

        case FETCH_LOGS_REQUEST:
            requestLogs = {
                ...state.logs,

                [action.payload.applicationLogId]: state.logs[
                    action.payload.applicationLogId
                ]
                    ? {
                          ...state.logs[action.payload.applicationLogId],
                          requesting: true,
                      }
                    : {
                          logs: [],
                          error: null,
                          requesting: true,
                          success: false,
                          skip: 0,
                          limit: 10,
                          count: null,
                      },
            };
            return Object.assign({}, state, {
                logs: requestLogs,
            });

        case FETCH_LOGS_RESET:
            return Object.assign({}, state, {
                logs: INITIAL_STATE.logs,
            });
        case RESET_APPLICATION_LOG_KEY_SUCCESS:
            applicationLogs = state.applicationLogsList.applicationLogs.map(
                (applicationLog: $TSFixMe) => {
                    if (applicationLog._id === action.payload._id) {
                        applicationLog = action.payload;
                    }
                    return applicationLog;
                }
            );
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: null,
                    success: true,
                    applicationLogs: applicationLogs,
                },
            });

        case RESET_APPLICATION_LOG_KEY_FAILURE:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case RESET_APPLICATION_LOG_KEY_RESET:
            return Object.assign({}, state, {
                applicationLogsList: INITIAL_STATE.applicationLogsList,
            });

        case RESET_APPLICATION_LOG_KEY_REQUEST:
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: true,
                    error: null,
                    success: false,
                },
            });
        case EDIT_APPLICATION_LOG_SWITCH:
            applicationLogs = state.applicationLogsList.applicationLogs.map(
                (applicationLog: $TSFixMe) => {
                    if (applicationLog._id === action.payload) {
                        if (!applicationLog.editMode) {
                            applicationLog.editMode = true;
                        } else {
                            applicationLog.editMode = false;
                        }
                    } else {
                        applicationLog.editMode = false;
                    }
                    return applicationLog;
                }
            );
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: null,
                    success: false,
                    applicationLogs: applicationLogs,
                },
                editApplicationLog: {
                    requesting: false,
                    error: null,
                    success: false,
                },
            });
        case EDIT_APPLICATION_LOG_SUCCESS:
            applicationLogs = state.applicationLogsList.applicationLogs.map(
                (applicationLog: $TSFixMe) => {
                    if (applicationLog._id === action.payload._id) {
                        applicationLog = action.payload;
                    }
                    return applicationLog;
                }
            );
            return Object.assign({}, state, {
                applicationLogsList: {
                    ...state.applicationLogsList,
                    requesting: false,
                    error: null,
                    success: true,
                    applicationLogs: applicationLogs,
                },
            });
        case EDIT_APPLICATION_LOG_FAILURE:
            return Object.assign({}, state, {
                editApplicationLog: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case EDIT_APPLICATION_LOG_RESET:
            return Object.assign({}, state, {
                editApplicationLog: INITIAL_STATE.editApplicationLog,
            });

        case EDIT_APPLICATION_LOG_REQUEST:
            return Object.assign({}, state, {
                editApplicationLog: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case FETCH_LOG_STAT_SUCCESS:
            return Object.assign({}, state, {
                stats: {
                    ...state.stats,
                    [action.payload.applicationLogId]: {
                        stats: action.payload.stats,
                        error: null,
                        requesting: false,
                        success: true,
                    },
                },
            });

        case FETCH_LOG_STAT_FAILURE:
            failureStats = {
                ...state.stats,

                [action.payload.applicationLogId]: state.stats[
                    action.payload.applicationLogId
                ]
                    ? {
                          ...state.stats[action.payload.applicationLogId],
                          error: action.payload.error,
                      }
                    : {
                          stats: [],
                          error: action.payload.error,
                          requesting: false,
                          success: false,
                      },
            };
            return Object.assign({}, state, {
                stats: failureStats,
            });

        case FETCH_LOG_STAT_REQUEST:
            requestStats = {
                ...state.stats,

                [action.payload.applicationLogId]: state.stats[
                    action.payload.applicationLogId
                ]
                    ? {
                          ...state.stats[action.payload.applicationLogId],
                          requesting: true,
                      }
                    : {
                          stats: [],
                          error: null,
                          requesting: true,
                          success: false,
                      },
            };
            return Object.assign({}, state, {
                stats: requestStats,
            });

        case FETCH_LOG_STAT_RESET:
            return Object.assign({}, state, {
                stats: INITIAL_STATE.stats,
            });
        case GET_LOG_SUCCESS:
            requestLogs = state.logs[action.payload.applicationLogId._id].logs; // Current logs
            logCount =
                state.stats[action.payload.applicationLogId._id].stats.all || 0; // Current count of all logs
            typeCount =
                state.stats[action.payload.applicationLogId._id].stats[
                    action.payload.type
                ] || 0; // Current count of all logs of that type
            if (
                requestLogs.filter((log: $TSFixMe) => {
                    return log._id === action.payload._id;
                }).length > 0
            ) {
                // If the new log exist maybe the event was emitted twice or more, just replace

                requestLogs = state.logs[
                    action.payload.applicationLogId._id
                ].logs.map((log: $TSFixMe) => {
                    if (log._id === action.payload._id) {
                        log = action.payload;
                    }
                    return log;
                });
            } else {
                // New log add to beginning of logs

                requestLogs = state.logs[
                    action.payload.applicationLogId._id
                ].logs.concat([action.payload]);
                // Update counts
                logCount += 1;
                typeCount += 1;
            }
            if (requestLogs.length > 10) {
                requestLogs.pop();
            }
            return Object.assign({}, state, {
                logs: {
                    ...state.logs,
                    [action.payload.applicationLogId._id]: {
                        ...state.logs[action.payload.applicationLogId._id],
                        logs: requestLogs,
                        count: logCount,
                    },
                },
                stats: {
                    ...state.stats,
                    [action.payload.applicationLogId._id]: {
                        ...state.stats[action.payload.applicationLogId._id],
                        stats: {
                            ...state.stats[action.payload.applicationLogId._id]
                                .stats,
                            all: logCount,
                            [action.payload.type]: typeCount,
                        },
                    },
                },
            });
        default:
            return state;
    }
}
