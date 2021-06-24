import { getApi, putApi, postApi, deleteApi } from '../api';
import * as types from '../constants/incidentBasicSettings';
import errors from '../errors';

const fetchBasicIncidentSettingsRequest = () => ({
    type: types.FETCH_INCIDENT_BASIC_SETTINGS_REQUEST,
});

const fetchBasicIncidentSettingsSuccess = payload => ({
    type: types.FETCH_INCIDENT_BASIC_SETTINGS_SUCCESS,
    payload,
});

const fetchBasicIncidentSettingsFailure = payload => ({
    type: types.FETCH_INCIDENT_BASIC_SETTINGS_FAILURE,
    payload,
});

export const fetchBasicIncidentSettings = projectId => {
    return function(dispatch) {
        const promise = getApi(`incidentSettings/${projectId}`);
        dispatch(fetchBasicIncidentSettingsRequest());
        promise.then(
            function(incidentBasicSettings) {
                dispatch(
                    fetchBasicIncidentSettingsSuccess(
                        incidentBasicSettings.data
                    )
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
                dispatch(fetchBasicIncidentSettingsFailure(errors(error)));
            }
        );
    };
};

const updateBasicIncidentSettingsRequest = () => ({
    type: types.UPDATE_INCIDENT_BASIC_SETTINGS_REQUEST,
});

const updateBasicIncidentSettingsSuccess = payload => ({
    type: types.UPDATE_INCIDENT_BASIC_SETTINGS_SUCCESS,
    payload,
});

const updateBasicIncidentSettingsFailure = payload => ({
    type: types.UPDATE_INCIDENT_BASIC_SETTINGS_FAILURE,
    payload,
});

export const updateDefaultIncidentSettings = (projectId, incidentPriority) => {
    return function(dispatch) {
        const promise = putApi(`incidentSettings/${projectId}/setDefault`, {
            incidentPriority,
        });
        dispatch(updateBasicIncidentSettingsRequest());
        promise.then(
            function(incidentDefaultSetting) {
                dispatch(
                    updateBasicIncidentSettingsSuccess(
                        incidentDefaultSetting.data
                    )
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
                dispatch(updateBasicIncidentSettingsFailure(errors(error)));
            }
        );
        return promise;
    };
};

export const updateBasicIncidentSettings = (
    projectId,
    title,
    description,
    incidentPriority
) => {
    return function(dispatch) {
        const promise = putApi(`incidentSettings/${projectId}`, {
            title,
            description,
            incidentPriority,
        });
        dispatch(updateBasicIncidentSettingsRequest());
        promise.then(
            function(incidentBasicSettings) {
                dispatch(
                    updateBasicIncidentSettingsSuccess(
                        incidentBasicSettings.data
                    )
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
                dispatch(updateBasicIncidentSettingsFailure(errors(error)));
            }
        );
    };
};

const fetchBasicIncidentSettingsVariablesRequest = () => ({
    type: types.FETCH_INCIDENT_BASIC_SETTINGS_VARIABLES_REQUEST,
});

const fetchBasicIncidentSettingsVariablesSuccess = payload => ({
    type: types.FETCH_INCIDENT_BASIC_SETTINGS_VARIABLES_SUCCESS,
    payload,
});

const fetchBasicIncidentSettingsVariablesFailure = payload => ({
    type: types.FETCH_INCIDENT_BASIC_SETTINGS_VARIABLES_FAILURE,
    payload,
});

export const fetchBasicIncidentSettingsVariables = () => {
    return function(dispatch) {
        const promise = getApi(`incidentSettings/variables`);
        dispatch(fetchBasicIncidentSettingsVariablesRequest());
        promise.then(
            function(incidentBasicSettings) {
                dispatch(
                    fetchBasicIncidentSettingsVariablesSuccess(
                        incidentBasicSettings.data
                    )
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
                    fetchBasicIncidentSettingsVariablesFailure(errors(error))
                );
            }
        );
    };
};

export const setRevealIncidentSettingsVariables = payload => dispatch => {
    dispatch({
        type: types.SET_REVEAL_VARIABLES_INCIDENT_BASIC_SETTINGS,
        payload,
    });
};

// FETCH ALL TEMPALTES IN A PROJECT
export const fetchIncidentTemplatesRequest = () => ({
    type: types.FETCH_INCIDENT_TEMPLATES_REQUEST,
});

export const fetchIncidentTemplatesSuccess = payload => ({
    type: types.FETCH_INCIDENT_TEMPLATES_SUCCESS,
    payload,
});

export const fetchIncidentTemplatesFailure = error => ({
    type: types.FETCH_INCIDENT_TEMPLATE_FAILURE,
    payload: error,
});

export const fetchIncidentTemplates = ({
    projectId,
    skip,
    limit,
}) => dispatch => {
    const url = `incidentSettings/${projectId}?skip=${skip}&limit=${limit}`;

    const promise = getApi(url);
    dispatch(fetchIncidentTemplatesRequest());
    promise.then(
        function(incidentBasicSettings) {
            dispatch(fetchIncidentTemplatesSuccess(incidentBasicSettings.data));
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
            dispatch(fetchIncidentTemplatesFailure(errors(error)));
        }
    );

    return promise;
};

// CREATE TEMPLATE IN A PROJECT
export const createIncidentTemplateRequest = () => ({
    type: types.CREATE_INCIDENT_TEMPLATE_REQUEST,
});

export const createIncidentTemplateSuccess = payload => ({
    type: types.CREATE_INCIDENT_TEMPLATE_SUCCESS,
    payload,
});

export const createIncidentTemplateFailure = error => ({
    type: types.CREATE_INCIDENT_TEMPLATE_FAILURE,
    payload: error,
});

export const createIncidentTemplate = ({ projectId, data }) => dispatch => {
    const url = `incidentSettings/${projectId}`;

    const promise = postApi(url, data);
    dispatch(createIncidentTemplateRequest());
    promise.then(
        function(incidentBasicSettings) {
            dispatch(createIncidentTemplateSuccess(incidentBasicSettings.data));
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
            dispatch(createIncidentTemplateFailure(errors(error)));
        }
    );

    return promise;
};

// UPDATE A TEMPLATE IN A PROJECT
export const updateIncidentTemplateRequest = () => ({
    type: types.UPDATE_INCIDENT_TEMPLATE_REQUEST,
});

export const updateIncidentTemplateSuccess = payload => ({
    type: types.UPDATE_INCIDENT_TEMPALTE_SUCCESS,
    payload,
});

export const updateIncidentTemplateFailure = error => ({
    type: types.UPDATE_INCIDENT_TEMPLATE_FAILURE,
    payload: error,
});

export const updateIncidentTemplate = ({
    projectId,
    templateId,
    data,
}) => dispatch => {
    const url = `incidentSettings/${projectId}/${templateId}`;

    const promise = putApi(url, data);
    dispatch(updateIncidentTemplateRequest());
    promise.then(
        function(incidentBasicSettings) {
            dispatch(updateIncidentTemplateSuccess(incidentBasicSettings.data));
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
            dispatch(updateIncidentTemplateFailure(errors(error)));
        }
    );

    return promise;
};

// DELETE A TEMPLATE IN A PROJECT
export const deleteIncidentTemplateRequest = () => ({
    type: types.DELETE_INCIDENT_TEMPLATE_REQUEST,
});

export const deleteIncidentTemplateSuccess = payload => ({
    type: types.DELETE_INCIDENT_TEMPLATE_SUCCESS,
    payload,
});

export const deleteIncidentTemplateFailure = error => ({
    type: types.DELETE_INCIDENT_TEMPLATE_FAILURE,
    payload: error,
});

export const deleteIncidentTemplate = ({
    projectId,
    templateId,
}) => dispatch => {
    const url = `incidentSettings/${projectId}/${templateId}`;

    const promise = deleteApi(url);
    dispatch(deleteIncidentTemplateRequest());
    promise.then(
        function(incidentBasicSettings) {
            dispatch(deleteIncidentTemplateSuccess(incidentBasicSettings.data));
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
            dispatch(deleteIncidentTemplateFailure(errors(error)));
        }
    );

    return promise;
};

// SET DEFAULT INCIDENT TEMPLATE
export const setDefaultTemplateRequest = () => ({
    type: types.SET_DEFAULT_INCIDENT_TEMPLATE_REQUEST,
});

export const setDefaultTemplateSuccess = payload => ({
    type: types.SET_DEFAULT_INCIDENT_TEMPLATE_SUCCESS,
    payload,
});

export const setDefaultTemplateFailure = error => ({
    type: types.SET_DEFAULT_INCIDENT_TEMPLATE_FAILURE,
    payload: error,
});

export const setDefaultTemplate = ({ projectId, templateId }) => dispatch => {
    const url = `incidentSettings/${projectId}/${templateId}/setDefault`;

    const promise = putApi(url, {});
    dispatch(setDefaultTemplateRequest());
    promise.then(
        function(incidentBasicSettings) {
            dispatch(setDefaultTemplateSuccess(incidentBasicSettings.data));
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
            dispatch(setDefaultTemplateFailure(errors(error)));
        }
    );

    return promise;
};

// SET ACTIVE TEMPLATE
export const setActiveTemplate = id => ({
    type: types.SET_ACTIVE_TEMPLATE,
    payload: id,
});

// FETCH DEFAULT INCIDENT TEMPLATE
export const fetchDefaultTemplateRequest = () => ({
    type: types.FETCH_DEFAULT_TEMPLATE_REQUEST,
});

export const fetchDefaultTemplateSuccess = payload => ({
    type: types.FETCH_DEFAULT_TEMPLATE_SUCCESS,
    payload,
});

export const fetchDefaultTemplateFailure = error => ({
    type: types.FETCH_DEFAULT_TEMPLATE_FAILURE,
    payload: error,
});

export const fetchDefaultTemplate = ({ projectId }) => dispatch => {
    const url = `incidentSettings/${projectId}/default`;

    const promise = getApi(url);
    dispatch(fetchDefaultTemplateRequest());
    promise.then(
        function(incidentBasicSettings) {
            dispatch(fetchDefaultTemplateSuccess(incidentBasicSettings.data));
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
            dispatch(fetchDefaultTemplateFailure(errors(error)));
        }
    );

    return promise;
};
