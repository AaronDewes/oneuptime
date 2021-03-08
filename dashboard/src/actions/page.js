import * as types from '../constants/page';

export const pageLoadRequest = function(title) {
    return {
        type: types.PAGE_LOAD_REQUEST,
        payload: title,
    };
};
export const pageLoadSuccess = function(title) {
    return {
        type: types.PAGE_LOAD_SUCCESS,
        payload: title,
    };
};
export const resetPageLoad = function() {
    return {
        type: types.PAGE_LOAD_RESET,
    };
};

export const loadPage = function(title) {
    return function(dispatch) {
        dispatch(pageLoadRequest(title));
        dispatch(pageLoadSuccess(title));
        dispatch(closeSideNav());
    };
};

export function openSideNav() {
    return {
        type: 'OPEN_SIDENAV',
    };
}

export function closeSideNav() {
    return {
        type: 'CLOSE_SIDENAV',
    };
}

export function toggleProjectSettingsMore(payload) {
    return {
        type: types.TOGGLE_PROJECT_SETTINGS_MORE,
        payload,
    };
}
