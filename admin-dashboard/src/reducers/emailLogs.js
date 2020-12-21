import {
    FETCH_AUDITLOGS_REQUEST,
    FETCH_AUDITLOGS_SUCCESS,
    FETCH_AUDITLOGS_FAILURE,
    SEARCH_AUDITLOGS_REQUEST,
    SEARCH_AUDITLOGS_SUCCESS,
    SEARCH_AUDITLOGS_FAILURE,
    DELETE_ALL_AUDITLOGS_REQUEST,
    DELETE_ALL_AUDITLOGS_SUCCESS,
    DELETE_ALL_AUDITLOGS_FAILURE,
    FETCH_AUDITLOG_STATUS_FAILED,
    FETCH_AUDITLOG_STATUS_REQUEST,
    FETCH_AUDITLOG_STATUS_SUCCESS,
    FETCH_AUDITLOG_STATUS_RESET,
    CHANGE_AUDITLOG_STATUS_FAILED,
    CHANGE_AUDITLOG_STATUS_REQUEST,
    CHANGE_AUDITLOG_STATUS_RESET,
    CHANGE_AUDITLOG_STATUS_SUCCESS,
} from '../constants/auditLogs';

const INITIAL_STATE = {
    auditLogs: {
        error: null,
        requesting: false,
        success: false,
        auditLogs: [],
        count: null,
        limit: null,
        skip: null,
        deleteRequest: false,
        deleted: false,
    },
    searchAuditLogs: {
        requesting: false,
        error: null,
        success: false,
    },
    auditLogStatus: {
        error: null,
        requesting: false,
        success: false,
        data: null,
    },
    changeAuditLogStatus: {
        error: null,
        requesting: false,
        success: false,
    },
};

export default function project(state = INITIAL_STATE, action) {
    switch (action.type) {
        // Fetch auditLogs list
        case FETCH_AUDITLOGS_REQUEST:
            return Object.assign({}, state, {
                auditLogs: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case FETCH_AUDITLOGS_SUCCESS:
            return Object.assign({}, state, {
                auditLogs: {
                    requesting: false,
                    error: null,
                    success: true,
                    auditLogs: action.payload.data,
                    count: action.payload.count,
                    limit: action.payload.limit,
                    skip: action.payload.skip,
                    deleteRequest: false,
                    deleted: false,
                },
            });

        case FETCH_AUDITLOGS_FAILURE:
            return Object.assign({}, state, {
                auditLogs: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        // Search AuditLog list.
        case SEARCH_AUDITLOGS_REQUEST:
            return Object.assign({}, state, {
                searchAuditLogs: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case SEARCH_AUDITLOGS_SUCCESS:
            return Object.assign({}, state, {
                auditLogs: {
                    requesting: false,
                    error: null,
                    success: true,
                    auditLogs: action.payload.data,
                    count: action.payload.count,
                    limit: action.payload.limit,
                    skip: action.payload.skip,
                    deleteRequest: false,
                    deleted: true,
                },
                searchAuditLogs: {
                    requesting: false,
                    error: null,
                    success: true,
                },
            });

        case SEARCH_AUDITLOGS_FAILURE:
            return Object.assign({}, state, {
                searchAuditLogs: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        //Delete all Audit logs
        case DELETE_ALL_AUDITLOGS_REQUEST:
            return {
                ...state,
                auditLogs: {
                    ...state.auditLogs,
                    error: null,
                    success: false,
                    deleteRequest: true,
                },
            };

        case DELETE_ALL_AUDITLOGS_SUCCESS:
            return Object.assign({}, state, {
                auditLogs: {
                    requesting: false,
                    error: null,
                    success: true,
                    deleteRequest: false,
                    deleted: true,
                    auditLogs: [],
                    count: null,
                    limit: null,
                    skip: null,
                },
            });

        case DELETE_ALL_AUDITLOGS_FAILURE:
            return {
                ...state,
                auditLogs: {
                    ...state.auditLogs,
                    error: action.payload,
                    success: false,
                    deleteRequest: false,
                },
            };
        case FETCH_AUDITLOG_STATUS_REQUEST:
            return Object.assign({}, state, {
                auditLogStatus: {
                    error: null,
                    requesting: true,
                    success: false,
                    data: null,
                },
            });

        case FETCH_AUDITLOG_STATUS_SUCCESS: {
            return Object.assign({}, state, {
                auditLogStatus: {
                    error: null,
                    requesting: false,
                    success: true,
                    data: {
                        ...action.payload,
                    },
                },
            });
        }

        case FETCH_AUDITLOG_STATUS_FAILED:
            return Object.assign({}, state, {
                auditLogStatus: {
                    ...state.auditLogStatus,
                    error: action.payload,
                    requesting: false,
                    success: false,
                },
            });

        case FETCH_AUDITLOG_STATUS_RESET:
            return Object.assign({}, state, {
                auditLogStatus: {
                    error: null,
                    requesting: false,
                    success: false,
                    data: null,
                },
            });
        case CHANGE_AUDITLOG_STATUS_REQUEST:
            return Object.assign({}, state, {
                changeAuditLogStatus: {
                    error: null,
                    requesting: true,
                    success: false,
                },
            });

        case CHANGE_AUDITLOG_STATUS_SUCCESS: {
            return Object.assign({}, state, {
                auditLogStatus: {
                    error: null,
                    requesting: false,
                    success: true,
                    data: {
                        ...action.payload,
                    },
                },
                changeAuditLogStatus: {
                    error: null,
                    requesting: false,
                    success: true,
                },
            });
        }

        case CHANGE_AUDITLOG_STATUS_FAILED:
            return Object.assign({}, state, {
                changeAuditLogStatus: {
                    error: action.payload,
                    requesting: false,
                    success: false,
                },
            });

        case CHANGE_AUDITLOG_STATUS_RESET:
            return Object.assign({}, state, {
                changeAuditLogStatus: {
                    error: null,
                    requesting: false,
                    success: false,
                },
            });

        default:
            return state;
    }
}
