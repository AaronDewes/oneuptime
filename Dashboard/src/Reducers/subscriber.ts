import * as types from '../constants/subscriber';

import Action from 'CommonUI/src/types/action';

const initialState: $TSFixMe = {
    subscribers: {
        requesting: false,
        error: null,
        success: false,
        subscribers: [],
        count: null,
        limit: null,
        skip: null,
    },
    newSubscriber: {
        requesting: false,
        error: null,
        success: false,
    },
    csvExport: {
        requesting: false,
        error: null,
        success: false,
        content: null,
    },
    deleteSubscriber: {
        requesting: false,
        error: null,
        success: false,
    },
    csvDownload: {
        requesting: false,
        error: null,
        success: false,
    },
    csvImport: {
        requesting: false,
        error: null,
        success: false,
    },
};

export default function subscriber(
    state: $TSFixMe = initialState,
    action: Action
): void {
    switch (action.type) {
        case types.CREATE_SUBSCRIBER_RESET:
            return Object.assign({}, state, {
                newSubscriber: initialState.newSubscriber,
            });

        case types.CREATE_SUBSCRIBER_SUCCESS:
            return Object.assign({}, state, {
                newSubscriber: {
                    requesting: false,
                    error: null,
                    success: false,
                },
                subscribers: {
                    ...state.subscribers,
                    subscribers: [action.payload].concat(
                        state.subscribers.subscribers
                    ),
                },
            });

        case types.CREATE_SUBSCRIBER_REQUEST:
            return Object.assign({}, state, {
                newSubscriber: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case types.CREATE_SUBSCRIBER_FAILED:
            return Object.assign({}, state, {
                newSubscriber: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case types.EXPORT_CSV_RESET:
            return Object.assign({}, state, {
                csvExport: initialState.csvExport,
            });

        case types.EXPORT_CSV_SUCCESS:
            return Object.assign({}, state, {
                csvExport: {
                    requesting: false,
                    success: true,
                    error: null,
                    content: action.payload,
                },
            });

        case types.EXPORT_CSV_REQUEST:
            return Object.assign({}, state, {
                csvExport: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case types.EXPORT_CSV_FAILED:
            return Object.assign({}, state, {
                csvExport: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });
        case types.DELETE_SUBSCRIBER_RESET:
            return Object.assign({}, state, {
                deleteSubscriber: initialState.deleteSubscriber,
            });

        case types.DELETE_SUBSCRIBER_SUCCESS:
            return Object.assign({}, state, {
                deleteSubscriber: {
                    requesting: false,
                    error: null,
                    success: false,
                },
                subscribers: {
                    ...state.subscribers,
                    subscribers: state.subscribers.subscribers.filter(
                        (subscriber: $TSFixMe) => {
                            return subscriber !== action.payload._id;
                        }
                    ),
                },
            });

        case types.DELETE_SUBSCRIBER_REQUEST:
            return Object.assign({}, state, {
                deleteSubscriber: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case types.DELETE_SUBSCRIBER_FAILED:
            return Object.assign({}, state, {
                deleteSubscriber: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case types.DOWNLOAD_CSV_TEMPLATE_REQUEST:
            return Object.assign({}, state, {
                requesting: true,
                error: null,
                success: false,
            });

        case types.DOWNLOAD_CSV_TEMPLATE_SUCCESS:
            return Object.assign({}, state, {
                requesting: false,
                error: null,
                success: true,
            });

        case types.DOWNLOAD_CSV_TEMPLATE_FAILED:
            return Object.assign({}, state, {
                requesting: false,
                error: action.payload,
                success: false,
            });

        default:
            return state;
    }
}
