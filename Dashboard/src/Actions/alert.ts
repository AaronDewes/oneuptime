import BackendAPI from 'CommonUI/src/utils/api/backend';
import { Dispatch } from 'redux';
import ObjectID from 'Common/Types/ObjectID';
import * as types from '../constants/alert';
import ErrorPayload from 'CommonUI/src/payload-types/error';
import PositiveNumber from 'Common/Types/PositiveNumber';
export const resetAlert: Function = (): void => {
    return {
        type: types.ALERT_FETCH_RESET,
    };
};

export const alertRequest: Function = (promise: $TSFixMe): void => {
    return {
        type: types.ALERT_FETCH_REQUEST,
        payload: promise,
    };
};

export const alertError: Function = (error: ErrorPayload): void => {
    return {
        type: types.ALERT_FETCH_FAILED,
        payload: error,
    };
};

export const alertSuccess: Function = (alert: $TSFixMe): void => {
    return {
        type: types.ALERT_FETCH_SUCCESS,
        payload: alert,
    };
};

// Calls the API to fetch Alerts.

export const fetchAlert: Function = (projectId: ObjectID): void => {
    return function (dispatch: Dispatch): void {
        const promise = BackendAPI.get(`alert/${projectId}`);

        dispatch(alertRequest());

        promise.then(
            (payload): void => {
                dispatch(alertSuccess(payload.data));
            },
            (error): void => {
                dispatch(alertError(error));
            }
        );

        return promise;
    };
};

export const resetProjectAlert: Function = (): void => {
    return {
        type: types.PROJECT_ALERT_FETCH_RESET,
    };
};

export const projectAlertRequest: Function = (promise: $TSFixMe): void => {
    return {
        type: types.PROJECT_ALERT_FETCH_REQUEST,
        payload: promise,
    };
};

export const projectAlertError: Function = (error: ErrorPayload): void => {
    return {
        type: types.PROJECT_ALERT_FETCH_FAILED,
        payload: error,
    };
};

export const projectAlertSuccess: Function = (alert: $TSFixMe): void => {
    return {
        type: types.PROJECT_ALERT_FETCH_SUCCESS,
        payload: alert,
    };
};

// Calls the API to fetch Alerts.

export function fetchProjectAlert(
    projectId: ObjectID,
    skip: PositiveNumber,
    limit: PositiveNumber
): void {
    return function (dispatch: Dispatch): void {
        const promise = BackendAPI.get(
            `alert/${projectId}/alert?skip=${skip}&limit=${limit}`
        );

        dispatch(projectAlertRequest());

        promise.then(
            (payload): void => {
                const data = payload.data;
                data.projectId = projectId;
                dispatch(projectAlertSuccess(data));
            },
            (error): void => {
                dispatch(projectAlertError(error));
            }
        );

        return promise;
    };
}

// Incidents Alert
export const incidentResetAlert: Function = (): void => {
    return {
        type: types.INCIDENTS_ALERT_FETCH_RESET,
    };
};

export const incidentAlertRequest: Function = (promise: $TSFixMe): void => {
    return {
        type: types.INCIDENTS_ALERT_FETCH_REQUEST,
        payload: promise,
    };
};

export const incidentAlertError: Function = (error: ErrorPayload): void => {
    return {
        type: types.INCIDENTS_ALERT_FETCH_FAILED,
        payload: error,
    };
};

export const incidentAlertSuccess: Function = (alert: $TSFixMe): void => {
    return {
        type: types.INCIDENTS_ALERT_FETCH_SUCCESS,
        payload: alert,
    };
};

// Calls the API to fetch Alerts.

export function fetchIncidentAlert(
    projectId: ObjectID,
    incidentSlug: $TSFixMe,
    skip: PositiveNumber,
    limit: PositiveNumber
) {
    return function (dispatch: Dispatch): void {
        const promise = BackendAPI.get(
            `alert/${projectId}/incident/${incidentSlug}?skip=${skip}&limit=${limit}`
        );

        dispatch(incidentAlertRequest());

        promise.then(
            (alerts): void => {
                dispatch(incidentAlertSuccess(alerts.data));
            },
            (error): void => {
                dispatch(incidentAlertError(error));
            }
        );

        return promise;
    };
}

// Subscribers Alert

export const subscriberResetAlert: Function = (): void => {
    return {
        type: types.SUBSCRIBERS_ALERT_FETCH_RESET,
    };
};

export const subscriberAlertRequest: Function = (promise: $TSFixMe): void => {
    return {
        type: types.SUBSCRIBERS_ALERT_FETCH_REQUEST,
        payload: promise,
    };
};

export const subscriberAlertError: Function = (error: ErrorPayload): void => {
    return {
        type: types.SUBSCRIBERS_ALERT_FETCH_FAILED,
        payload: error,
    };
};

export const subscriberAlertSuccess: Function = (alert: $TSFixMe): void => {
    return {
        type: types.SUBSCRIBERS_ALERT_FETCH_SUCCESS,
        payload: alert,
    };
};

// Calls the API to fetch Subscriber Alerts.

export function fetchSubscriberAlert(
    projectId: ObjectID,
    incidentSlug: $TSFixMe,
    skip: PositiveNumber,
    limit: PositiveNumber
): void {
    skip = parseInt(skip);
    limit = parseInt(limit);
    return function (dispatch: Dispatch): void {
        skip = skip < 0 ? 0 : skip;
        limit = limit < 0 ? 0 : limit;
        let promise = null;
        if (skip >= 0 && limit >= 0) {
            promise = BackendAPI.get(
                `subscriberAlert/${projectId}/incident/${incidentSlug}?skip=${skip}&limit=${limit}`
            );
        } else {
            promise = BackendAPI.get(
                `subscriberAlert/${projectId}/incident/${incidentSlug}`
            );
        }

        dispatch(subscriberAlertRequest());

        promise.then(
            (alerts): void => {
                dispatch(subscriberAlertSuccess(alerts.data));
            },
            (error): void => {
                dispatch(subscriberAlertError(error));
            }
        );

        return promise;
    };
}

export const fetchAlertChargesRequest: Function = (promise: $TSFixMe): void => {
    return {
        type: types.FETCH_ALERT_CHARGES_REQUEST,
        payload: promise,
    };
};

export const fetchAlertChargesFailed: Function = (
    error: ErrorPayload
): void => {
    return {
        type: types.FETCH_ALERT_CHARGES_FAILED,
        payload: error,
    };
};

export const fetchAlertChargesSuccess: Function = (
    alertCharges: $TSFixMe
): void => {
    return {
        type: types.FETCH_ALERT_CHARGES_SUCCESS,
        payload: alertCharges,
    };
};

export function fetchAlertCharges(
    projectId: ObjectID,
    skip: PositiveNumber,
    limit: PositiveNumber
): void {
    let promise;
    return function (dispatch: Dispatch): void {
        if (skip >= 0 && limit > 0) {
            promise = BackendAPI.get(
                `alert/${projectId}/alert/charges?skip=${skip}&limit=${limit}`
            );
        } else {
            promise = BackendAPI.get(`alert/${projectId}/alert/charges`);
        }

        dispatch(fetchAlertChargesRequest(promise));

        promise.then(
            (alertCharges): void => {
                dispatch(fetchAlertChargesSuccess(alertCharges.data));
            },
            (error): void => {
                dispatch(fetchAlertChargesFailed(error));
            }
        );
        return promise;
    };
}

export const downloadAlertChargesRequest: Function = (
    promise: $TSFixMe
): void => {
    return {
        type: types.DOWNLOAD_ALERT_CHARGES_REQUEST,
        payload: promise,
    };
};

export const downloadAlertChargesFailed: Function = (
    error: ErrorPayload
): void => {
    return {
        type: types.DOWNLOAD_ALERT_CHARGES_FAILED,
        payload: error,
    };
};

export const downloadAlertChargesSuccess: Function = (
    alertCharges: $TSFixMe
): void => {
    return {
        type: types.DOWNLOAD_ALERT_CHARGES_SUCCESS,
        payload: alertCharges,
    };
};

export const downloadAlertCharges: Function = (projectId: ObjectID): void => {
    return function (dispatch: Dispatch): void {
        const promise = BackendAPI.get(`alert/${projectId}/alert/charges`);

        dispatch(downloadAlertChargesRequest(promise));

        promise.then(
            (alertCharges): void => {
                dispatch(downloadAlertChargesSuccess(alertCharges.data));
            },
            (error): void => {
                dispatch(downloadAlertChargesFailed(error));
            }
        );
        return promise;
    };
};
