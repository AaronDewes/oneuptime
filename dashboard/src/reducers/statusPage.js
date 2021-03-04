import {
    CREATE_STATUSPAGE_REQUEST,
    CREATE_STATUSPAGE_SUCCESS,
    CREATE_STATUSPAGE_FAILURE,
    CREATE_STATUSPAGE_RESET,
    UPDATE_STATUSPAGE_SETTING_REQUEST,
    UPDATE_STATUSPAGE_SETTING_SUCCESS,
    UPDATE_STATUSPAGE_SETTING_FAILURE,
    UPDATE_STATUSPAGE_SETTING_RESET,
    UPDATE_STATUSPAGE_MONITORS_REQUEST,
    UPDATE_STATUSPAGE_MONITORS_SUCCESS,
    UPDATE_STATUSPAGE_MONITORS_FAILURE,
    UPDATE_STATUSPAGE_MONITORS_RESET,
    UPDATE_PRIVATE_STATUSPAGE_REQUEST,
    UPDATE_PRIVATE_STATUSPAGE_SUCCESS,
    UPDATE_PRIVATE_STATUSPAGE_FAILURE,
    UPDATE_PRIVATE_STATUSPAGE_RESET,
    UPDATE_STATUSPAGE_BRANDING_REQUEST,
    UPDATE_STATUSPAGE_BRANDING_SUCCESS,
    UPDATE_STATUSPAGE_BRANDING_FAILURE,
    UPDATE_STATUSPAGE_BRANDING_RESET,
    UPDATE_STATUSPAGE_THEME_REQUEST,
    UPDATE_STATUSPAGE_THEME_SUCCESS,
    UPDATE_STATUSPAGE_THEME_FAILURE,
    UPDATE_STATUSPAGE_NAME_FAILURE,
    UPDATE_STATUSPAGE_NAME_REQUEST,
    UPDATE_STATUSPAGE_NAME_RESET,
    UPDATE_STATUSPAGE_NAME_SUCCESS,
    UPDATE_STATUSPAGE_LINKS_REQUEST,
    UPDATE_STATUSPAGE_LINKS_SUCCESS,
    UPDATE_STATUSPAGE_LINKS_FAILURE,
    UPDATE_STATUSPAGE_LINKS_RESET,
    FETCH_STATUSPAGE_REQUEST,
    FETCH_STATUSPAGE_SUCCESS,
    FETCH_STATUSPAGE_FAILURE,
    FETCH_STATUSPAGE_RESET,
    FETCH_SUBPROJECT_STATUSPAGE_REQUEST,
    FETCH_SUBPROJECT_STATUSPAGE_SUCCESS,
    FETCH_SUBPROJECT_STATUSPAGE_FAILURE,
    FETCH_SUBPROJECT_STATUSPAGE_RESET,
    FETCH_PROJECT_STATUSPAGE_REQUEST,
    FETCH_PROJECT_STATUSPAGE_SUCCESS,
    FETCH_PROJECT_STATUSPAGE_FAILURE,
    FETCH_PROJECT_STATUSPAGE_RESET,
    DELETE_PROJECT_STATUSPAGES,
    DELETE_STATUSPAGE_REQUEST,
    DELETE_STATUSPAGE_SUCCESS,
    DELETE_STATUSPAGE_FAILED,
    DELETE_STATUSPAGE_RESET,
    LOGO_CACHE_INSERT,
    FAVICON_CACHE_INSERT,
    LOGO_CACHE_RESET,
    FAVICON_CACHE_RESET,
    SWITCH_STATUSPAGE_SUCCESS,
    BANNER_CACHE_INSERT,
    BANNER_CACHE_RESET,
    SET_STATUS_PAGE_COLORS,
    UPDATE_SUBSCRIBER_OPTION_REQUEST,
    UPDATE_SUBSCRIBER_OPTION_SUCCESS,
    UPDATE_SUBSCRIBER_OPTION_FAILURE,
    UPDATE_SUBSCRIBER_OPTION_RESET,
    ADD_MORE_DOMAIN,
    CANCEL_ADD_MORE_DOMAIN,
    UPDATE_STATUSPAGE_CUSTOM_HTML_REQUEST,
    UPDATE_STATUSPAGE_CUSTOM_HTML_SUCCESS,
    UPDATE_STATUSPAGE_CUSTOM_HTML_FAILURE,
    FETCH_INCIDENT_STATUSPAGE_REQUEST,
    FETCH_INCIDENT_STATUSPAGE_FAILURE,
    FETCH_INCIDENT_STATUSPAGE_SUCCESS,
    FETCH_INCIDENT_STATUSPAGE_RESET,
    RESET_STATUS_BUBBLE_ID_REQUEST,
    RESET_STATUS_BUBBLE_ID_SUCCESS,
    RESET_STATUS_BUBBLE_ID_FAILURE,
    UPDATE_STATUSPAGE_EMBEDDED_CSS_REQUEST,
    UPDATE_STATUSPAGE_EMBEDDED_CSS_SUCCESS,
    UPDATE_STATUSPAGE_EMBEDDED_CSS_FAILURE,
    RESET_STATUSPAGE_EMBEDDED_CSS_REQUEST,
    RESET_STATUSPAGE_EMBEDDED_CSS_SUCCESS,
    RESET_STATUSPAGE_EMBEDDED_CSS_FAILURE,
    SHOW_DUPLICATE_STATUSPAGE,
    DUPLICATE_STATUSPAGE_REQUEST,
    DUPLICATE_STATUSPAGE_SUCCESS,
    DUPLICATE_STATUSPAGE_FAILURE,
    DUPLICATE_STATUSPAGE_RESET,
} from '../constants/statusPage';

import {
    PAGINATE_NEXT,
    PAGINATE_PREV,
    PAGINATE_RESET,
} from '../constants/statusPage';

import {
    VERIFY_DOMAIN_FAILURE,
    VERIFY_DOMAIN_REQUEST,
    VERIFY_DOMAIN_SUCCESS,
    CREATE_DOMAIN_REQUEST,
    CREATE_DOMAIN_SUCCESS,
    CREATE_DOMAIN_FAILURE,
    DELETE_DOMAIN_REQUEST,
    DELETE_DOMAIN_SUCCESS,
    DELETE_DOMAIN_FAILURE,
    UPDATE_DOMAIN_REQUEST,
    UPDATE_DOMAIN_SUCCESS,
    UPDATE_DOMAIN_FAILURE,
} from '../constants/domain';

const INITIAL_STATE = {
    addMoreDomain: false,
    showDuplicateStatusPage: false,
    setting: {
        error: null,
        requesting: false,
        success: false,
    },
    newStatusPage: {
        error: null,
        requesting: false,
        success: false,
        statusPage: null,
    },
    duplicateStatusPage: {
        error: null,
        requesting: false,
        success: false,
        statusPage: null,
    },
    monitors: {
        error: null,
        requesting: false,
        success: false,
    },
    privateStatusPage: {
        error: null,
        requesting: false,
        success: false,
    },
    branding: {
        error: null,
        requesting: false,
        success: false,
    },
    pageName: {
        error: null,
        requesting: false,
        success: false,
    },
    links: {
        error: null,
        requesting: false,
        success: false,
    },
    customHTML: {
        error: null,
        requesting: false,
        success: false,
    },
    logocache: {
        data: null,
    },
    bannercache: {
        data: null,
    },
    colors: {},
    faviconcache: {
        data: null,
    },
    deleteStatusPage: {
        success: false,
        requesting: false,
        error: null,
    },
    subscriberOption: {
        success: false,
        requesting: false,
        error: null,
    },
    verifyDomain: {
        requesting: false,
        success: false,
        error: null,
    },
    addDomain: {
        requesting: false,
        success: false,
        error: null,
    },
    deleteDomain: {
        requesting: false,
        success: false,
        error: null,
    },
    updateDomain: {
        requesting: false,
        success: false,
        error: null,
    },
    //this is for main status page object.
    error: null,
    requesting: false,
    success: false,
    status: {},
    statusPages: [],
    subProjectStatusPages: [],
    incidentStatusPages: [],
    count: null,
    limit: null,
    skip: null,
    pages: {
        counter: 1,
    },
    statusBubble: {
        requesting: false,
        success: false,
        error: null,
    },
    embeddedCss: {
        requesting: false,
        success: false,
        error: null,
    },
    resetEmbeddedCss: {
        requesting: false,
        success: false,
        error: null,
    },
    theme: {
        requesting: false,
        success: false,
        error: null,
    },
};

export default function statusPage(state = INITIAL_STATE, action) {
    let status, statusPage, isExistingStatusPage;
    switch (action.type) {
        //create statuspage
        case CREATE_STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                newStatusPage: {
                    ...state.newStatusPage,
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case CREATE_STATUSPAGE_SUCCESS:
            isExistingStatusPage = state.subProjectStatusPages.find(
                statusPage => statusPage._id === action.payload.projectId
            );
            return Object.assign({}, state, {
                newStatusPage: {
                    requesting: false,
                    error: null,
                    success: true,
                    newStatusPage: action.payload,
                },
                subProjectStatusPages: isExistingStatusPage
                    ? state.subProjectStatusPages.length > 0
                        ? state.subProjectStatusPages.map(statusPage => {
                              return statusPage._id === action.payload.projectId
                                  ? {
                                        _id: action.payload.projectId,
                                        statusPages: [
                                            action.payload,
                                            ...statusPage.statusPages.filter(
                                                (status, index) => index < 9
                                            ),
                                        ],
                                        count: statusPage.count + 1,
                                        skip: statusPage.skip,
                                        limit: statusPage.limit,
                                    }
                                  : statusPage;
                          })
                        : [
                              {
                                  _id: action.payload.projectId,
                                  statusPages: [action.payload],
                                  count: 1,
                                  skip: 0,
                                  limit: 0,
                              },
                          ]
                    : state.subProjectStatusPages.concat([
                          {
                              _id: action.payload.projectId,
                              statusPages: [action.payload],
                              count: 1,
                              skip: 0,
                              limit: 0,
                          },
                      ]),
            });

        case CREATE_STATUSPAGE_FAILURE:
            return Object.assign({}, state, {
                newStatusPage: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case CREATE_STATUSPAGE_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        //Duplicate statuspage
        case DUPLICATE_STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                duplicateStatusPage: {
                    ...state.duplicateStatusPage,
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case DUPLICATE_STATUSPAGE_SUCCESS:
            return Object.assign({}, state, {
                duplicateStatusPage: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status: action.payload,
            });

        case DUPLICATE_STATUSPAGE_FAILURE:
            return Object.assign({}, state, {
                duplicateStatusPage: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case DUPLICATE_STATUSPAGE_RESET:
            return Object.assign({}, state, {
                duplicateStatusPage: {
                    requesting: false,
                    error: null,
                    success: true,
                },
            });

        //handle domain
        case CREATE_DOMAIN_REQUEST:
            return {
                ...state,
                addDomain: {
                    ...state.addDomain,
                    requesting: true,
                },
            };

        case CREATE_DOMAIN_SUCCESS:
            return {
                ...state,
                addMoreDomain: false,
                addDomain: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                status: {
                    ...state.status,
                    domains: action.payload.domains,
                },
            };

        case CREATE_DOMAIN_FAILURE:
            return {
                ...state,
                addMoreDomain: true,
                addDomain: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case UPDATE_DOMAIN_REQUEST:
            return {
                ...state,
                updateDomain: {
                    ...state.updateDomain,
                    requesting: true,
                    error: null,
                },
            };

        case UPDATE_DOMAIN_SUCCESS:
            return {
                ...state,
                updateDomain: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                status: action.payload,
            };

        case UPDATE_DOMAIN_FAILURE:
            return {
                ...state,
                updateDomain: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case DELETE_DOMAIN_REQUEST:
            return {
                ...state,
                deleteDomain: {
                    ...state.deleteDomain,
                    requesting: true,
                    error: null,
                },
            };

        case DELETE_DOMAIN_SUCCESS:
            return {
                ...state,
                deleteDomain: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                status: action.payload,
            };

        case DELETE_DOMAIN_FAILURE:
            return {
                ...state,
                deleteDomain: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case ADD_MORE_DOMAIN:
            return {
                ...state,
                addMoreDomain: true,
            };

        case CANCEL_ADD_MORE_DOMAIN:
            return {
                ...state,
                addMoreDomain: false,
            };

        case VERIFY_DOMAIN_REQUEST:
            return {
                ...state,
                verifyDomain: {
                    ...state.verifyDomain,
                    requesting: true,
                },
            };

        case VERIFY_DOMAIN_SUCCESS: {
            const updateDomains = JSON.parse(
                JSON.stringify(state.status.domains)
            ); // deep clone to avoid mutation of state
            updateDomains.forEach(({ domainVerificationToken }) => {
                if (domainVerificationToken._id === action.payload._id) {
                    domainVerificationToken.verified = action.payload.verified;
                    domainVerificationToken.verifiedAt =
                        action.payload.verifiedAt;
                }
            });

            return {
                ...state,
                status: {
                    ...state.status,
                    domains: updateDomains,
                },
                verifyDomain: {
                    ...state.verifyDomain,
                    requesting: false,
                    success: true,
                    error: null,
                },
            };
        }

        case VERIFY_DOMAIN_FAILURE:
            return {
                ...state,
                verifyDomain: {
                    ...state.verifyDomain,
                    requesting: false,
                    error: action.payload,
                },
            };

        //update setting
        case UPDATE_STATUSPAGE_SETTING_REQUEST:
            return Object.assign({}, state, {
                setting: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_SETTING_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                addMoreDomain: false,
                setting: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_STATUSPAGE_SETTING_FAILURE:
            return Object.assign({}, state, {
                setting: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_SETTING_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        // update monitor
        case UPDATE_STATUSPAGE_MONITORS_REQUEST:
            return Object.assign({}, state, {
                monitors: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_MONITORS_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                monitors: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case 'DELETE_MONITOR_BY_SOCKET': {
            if (state.status._id) {
                const status = {
                    ...state.status,
                    monitors: state.status.monitors.filter(
                        monitorData =>
                            String(monitorData.monitor) !==
                            String(action.payload)
                    ),
                };
                return {
                    ...state,
                    status,
                };
            }

            return {
                ...state,
            };
        }

        case UPDATE_STATUSPAGE_MONITORS_FAILURE:
            return Object.assign({}, state, {
                monitors: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_MONITORS_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        // update private statuspages
        case UPDATE_PRIVATE_STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                privateStatusPage: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_PRIVATE_STATUSPAGE_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                privateStatusPage: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_PRIVATE_STATUSPAGE_FAILURE:
            return Object.assign({}, state, {
                privateStatusPage: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_PRIVATE_STATUSPAGE_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        // update subscriber options
        case UPDATE_SUBSCRIBER_OPTION_REQUEST:
            return Object.assign({}, state, {
                subscriberOption: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_SUBSCRIBER_OPTION_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                subscriberOption: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_SUBSCRIBER_OPTION_FAILURE:
            return Object.assign({}, state, {
                subscriberOption: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_SUBSCRIBER_OPTION_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });
        // update branding
        case UPDATE_STATUSPAGE_BRANDING_REQUEST:
            return Object.assign({}, state, {
                branding: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_BRANDING_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                branding: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_STATUSPAGE_BRANDING_FAILURE:
            return Object.assign({}, state, {
                branding: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_BRANDING_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        // update theme
        case UPDATE_STATUSPAGE_THEME_REQUEST:
            return Object.assign({}, state, {
                theme: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_THEME_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                theme: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_STATUSPAGE_THEME_FAILURE:
            return Object.assign({}, state, {
                theme: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        // update status page name
        case UPDATE_STATUSPAGE_NAME_REQUEST:
            return Object.assign({}, state, {
                pageName: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_NAME_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                pageName: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_STATUSPAGE_NAME_FAILURE:
            return Object.assign({}, state, {
                pageName: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_NAME_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        // update links
        case UPDATE_STATUSPAGE_LINKS_REQUEST:
            return Object.assign({}, state, {
                links: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_LINKS_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                links: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_STATUSPAGE_LINKS_FAILURE:
            return Object.assign({}, state, {
                links: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_LINKS_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        case UPDATE_STATUSPAGE_CUSTOM_HTML_REQUEST:
            return Object.assign({}, state, {
                customHTML: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_CUSTOM_HTML_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                customHTML: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_STATUSPAGE_CUSTOM_HTML_FAILURE:
            return Object.assign({}, state, {
                customHTML: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        // fetch status page
        case FETCH_STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                ...state,
                error: null,
                requesting: true,
                success: false,
                status: {},
            });

        case FETCH_STATUSPAGE_FAILURE:
            return Object.assign({}, state, {
                status: {},
                requesting: false,
                success: false,
                error: action.payload,
            });

        case FETCH_STATUSPAGE_RESET:
            return Object.assign({}, state, {
                status: INITIAL_STATE.statusPage,
            });

        case FETCH_STATUSPAGE_SUCCESS:
            return Object.assign({}, state, {
                statusPages: action.payload.data,
                error: null,
                requesting: false,
                success: false,
            });

        // fetch subproject status pages
        case FETCH_SUBPROJECT_STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                ...state,
                error: null,
                requesting: true,
                success: false,
                status: {},
            });

        case FETCH_SUBPROJECT_STATUSPAGE_FAILURE:
            return Object.assign({}, state, {
                status: {},
                requesting: false,
                success: false,
                error: action.payload,
            });

        case FETCH_SUBPROJECT_STATUSPAGE_RESET:
            return Object.assign({}, state, {
                subProjectStatusPages: [],
            });

        case FETCH_SUBPROJECT_STATUSPAGE_SUCCESS: {
            const subProjectStatusPages = action.payload.map(statusPage => {
                const statusPages = [];
                statusPage.statusPages.forEach(statuspage => {
                    const monitorNames = [],
                        monitors = [];
                    statuspage.monitors.forEach(monitorData => {
                        monitorNames.push(monitorData.monitor.name);
                        monitors.push({
                            ...monitorData,
                            monitor: monitorData.monitor._id,
                        });
                    });
                    statusPages.push({
                        ...statuspage,
                        monitorNames,
                        monitors,
                    });
                });

                return {
                    ...statusPage,
                    statusPages,
                };
            });

            return Object.assign({}, state, {
                subProjectStatusPages,
                error: null,
                requesting: false,
                success: true,
            });
        }

        // for statuspages pointing to incidents

        case FETCH_INCIDENT_STATUSPAGE_REQUEST:
            return {
                ...state,
                error: null,
                requesting: true,
                success: false,
                status: {},
            };

        case FETCH_INCIDENT_STATUSPAGE_FAILURE:
            return {
                ...state,
                status: {},
                requesting: false,
                success: false,
                error: action.payload,
            };

        case FETCH_INCIDENT_STATUSPAGE_RESET:
            return {
                ...state,
                incidentStatusPages: [],
            };

        case FETCH_INCIDENT_STATUSPAGE_SUCCESS: {
            const statusPages = [];
            action.payload.data.forEach(statuspage => {
                const monitorNames = [],
                    monitors = [];
                statuspage.monitors.forEach(monitorData => {
                    monitorNames.push(monitorData.monitor.name);
                });
                statuspage.monitors.forEach(monitorData => {
                    monitors.push({
                        ...monitorData,
                        monitor: monitorData.monitor._id,
                    });
                });
                statusPages.push({
                    ...statuspage,
                    monitorNames,
                    monitors,
                });
            });
            const incidentStatusPages = {
                count: action.payload.count || 0,
                limit: action.payload.limit || 10,
                skip: action.payload.skip || 0,
                statusPages,
            };

            return {
                ...state,
                incidentStatusPages,
                error: null,
                requesting: false,
                success: true,
            };
        }

        // fetch list of statuspages in a project
        case FETCH_PROJECT_STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                ...state,
                error: null,
                requesting: true,
                success: false,
            });

        case FETCH_PROJECT_STATUSPAGE_FAILURE:
            return Object.assign({}, state, {
                requesting: false,
                success: false,
                error: action.payload,
            });

        case FETCH_PROJECT_STATUSPAGE_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        case FETCH_PROJECT_STATUSPAGE_SUCCESS:
            return Object.assign({}, state, {
                subProjectStatusPages: state.subProjectStatusPages.map(
                    statusPage => {
                        return statusPage._id === action.payload.projectId
                            ? {
                                  _id: action.payload.projectId,
                                  statusPages: [...action.payload.data],
                                  count: action.payload.count,
                                  skip: action.payload.skip,
                                  limit: action.payload.limit,
                              }
                            : statusPage;
                    }
                ),
                error: null,
                requesting: false,
                success: true,
            });

        case SWITCH_STATUSPAGE_SUCCESS:
            return Object.assign({}, state, {
                status: action.payload || {},
                colors: action.payload.colors,
            });

        case DELETE_PROJECT_STATUSPAGES:
            statusPage = Object.assign([], state.statusPage);
            statusPage = statusPage.filter(
                status => status.projectId !== action.payload
            );
            return Object.assign({}, state, {
                statusPage,
            });

        case DELETE_STATUSPAGE_SUCCESS:
            return Object.assign({}, state, {
                deleteStatusPage: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                statusPages: state.statusPages.filter(
                    ({ _id }) => _id !== action.payload._id
                ),
                subProjectStatusPages: state.subProjectStatusPages.map(
                    subProjectStatusPage => {
                        subProjectStatusPage.statusPages = subProjectStatusPage.statusPages.filter(
                            ({ _id }) => _id !== action.payload._id
                        );
                        return subProjectStatusPage;
                    }
                ),
            });

        case DELETE_STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                deleteStatusPage: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case DELETE_STATUSPAGE_FAILED:
            return Object.assign({}, state, {
                deleteStatusPage: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case DELETE_STATUSPAGE_RESET:
            return Object.assign({}, state, {
                deleteStatusPage: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });

        case LOGO_CACHE_INSERT:
            return Object.assign({}, state, {
                logocache: {
                    data: action.payload,
                },
            });

        case FAVICON_CACHE_INSERT:
            return Object.assign({}, state, {
                faviconcache: {
                    data: action.payload,
                },
            });

        case LOGO_CACHE_RESET:
            return Object.assign({}, state, {
                logocache: {
                    data: null,
                },
            });

        case FAVICON_CACHE_RESET:
            return Object.assign({}, state, {
                faviconcache: {
                    data: null,
                },
            });

        case BANNER_CACHE_INSERT:
            return Object.assign({}, state, {
                bannercache: {
                    data: action.payload,
                },
            });

        case BANNER_CACHE_RESET:
            return Object.assign({}, state, {
                bannercache: {
                    data: null,
                },
            });

        case SET_STATUS_PAGE_COLORS:
            return Object.assign({}, state, {
                colors: action.payload,
            });

        case PAGINATE_NEXT:
            return {
                ...state,
                pages: {
                    counter: state.pages.counter + 1,
                },
            };

        case PAGINATE_PREV:
            return {
                ...state,
                pages: {
                    counter: state.pages.counter - 1,
                },
            };

        case PAGINATE_RESET:
            return {
                ...state,
                pages: {
                    counter: 1,
                },
            };

        case RESET_STATUS_BUBBLE_ID_REQUEST:
            return Object.assign({}, state, {
                statusBubble: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case RESET_STATUS_BUBBLE_ID_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                statusBubble: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case RESET_STATUS_BUBBLE_ID_FAILURE:
            return Object.assign({}, state, {
                statusBubble: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_EMBEDDED_CSS_REQUEST:
            return Object.assign({}, state, {
                embeddedCss: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_STATUSPAGE_EMBEDDED_CSS_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                embeddedCss: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case UPDATE_STATUSPAGE_EMBEDDED_CSS_FAILURE:
            return Object.assign({}, state, {
                embeddedCss: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case RESET_STATUSPAGE_EMBEDDED_CSS_REQUEST:
            return Object.assign({}, state, {
                resetEmbeddedCss: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case RESET_STATUSPAGE_EMBEDDED_CSS_SUCCESS:
            status = action.payload;
            return Object.assign({}, state, {
                resetEmbeddedCss: {
                    requesting: false,
                    error: null,
                    success: true,
                },
                status,
            });

        case RESET_STATUSPAGE_EMBEDDED_CSS_FAILURE:
            return Object.assign({}, state, {
                resetEmbeddedCss: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case SHOW_DUPLICATE_STATUSPAGE:
            return Object.assign({}, state, {
                showDuplicateStatusPage: action.payload,
            });

        default:
            return state;
    }
}
