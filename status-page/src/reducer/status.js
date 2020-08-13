import {
    STATUSPAGE_REQUEST,
    STATUSPAGE_SUCCESS,
    STATUSPAGE_FAILURE,
    STATUSPAGE_NOTES_REQUEST,
    STATUSPAGE_NOTES_SUCCESS,
    STATUSPAGE_NOTES_FAILURE,
    MORE_NOTES_REQUEST,
    MORE_NOTES_SUCCESS,
    MORE_NOTES_FAILURE,
    STATUSPAGE_NOTES_RESET,
    INDIVIDUAL_NOTES_ENABLE,
    INDIVIDUAL_NOTES_DISABLE,
    SCHEDULED_EVENTS_REQUEST,
    SCHEDULED_EVENTS_SUCCESS,
    SCHEDULED_EVENTS_FAILURE,
    MORE_EVENTS_REQUEST,
    MORE_EVENTS_SUCCESS,
    MORE_EVENTS_FAILURE,
    SCHEDULED_EVENTS_RESET,
    INDIVIDUAL_EVENTS_ENABLE,
    INDIVIDUAL_EVENTS_DISABLE,
    SELECT_PROBE,
    FETCH_MONITOR_STATUSES_REQUEST,
    FETCH_MONITOR_STATUSES_SUCCESS,
    FETCH_MONITOR_STATUSES_FAILURE,
    FETCH_MONITOR_LOGS_REQUEST,
    FETCH_MONITOR_LOGS_SUCCESS,
    FETCH_MONITOR_LOGS_FAILURE,
    FETCH_EVENT_NOTES_FAILURE,
    FETCH_EVENT_NOTES_REQUEST,
    FETCH_EVENT_NOTES_SUCCESS,
    FETCH_EVENT_FAILURE,
    FETCH_EVENT_REQUEST,
    FETCH_EVENT_SUCCESS,
    MORE_EVENT_NOTE_FAILURE,
    MORE_EVENT_NOTE_REQUEST,
    MORE_EVENT_NOTE_SUCCESS,
    FETCH_INCIDENT_NOTES_REQUEST,
    FETCH_INCIDENT_NOTES_SUCCESS,
    FETCH_INCIDENT_NOTES_FAILURE,
    FETCH_INCIDENT_REQUEST,
    FETCH_INCIDENT_SUCCESS,
    FETCH_INCIDENT_FAILURE,
    MORE_INCIDENT_NOTES_FAILURE,
    MORE_INCIDENT_NOTES_REQUEST,
    MORE_INCIDENT_NOTES_SUCCESS,
} from '../constants/status';

const INITIAL_STATE = {
    error: null,
    statusPage: {},
    requesting: false,
    notes: {
        error: null,
        notes: [],
        requesting: false,
        skip: 0,
    },
    events: {
        error: null,
        events: [],
        requesting: false,
        skip: 0,
        count: 0,
    },
    logs: [],
    requestingmore: false,
    requestingmoreevents: false,
    requestingstatuses: false,
    individualnote: null,
    individualevent: null,
    notesmessage: null,
    eventsmessage: null,
    activeProbe: 0,
    eventNoteList: {
        requesting: false,
        success: false,
        error: null,
        eventNotes: [],
        skip: 0,
        count: 0,
    },
    requestingMoreNote: false,
    moreNoteError: null,
    scheduledEvent: {
        requesting: false,
        success: false,
        error: null,
        event: {},
    },
    incident: {
        requesting: false,
        success: false,
        error: null,
        incident: {},
    },
    incidentNotes: {
        requesting: false,
        success: false,
        error: null,
        notes: [],
        skip: 0,
        count: 0,
    },
    moreIncidentNotes: false,
    moreIncidentNotesError: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case STATUSPAGE_SUCCESS:
            return Object.assign({}, state, {
                error: null,
                statusPage: action.payload,
                requesting: false,
            });

        case STATUSPAGE_FAILURE:
            return Object.assign({}, state, {
                error: action.payload,
                requesting: false,
            });

        case STATUSPAGE_REQUEST:
            return Object.assign({}, state, {
                error: null,
                requesting: true,
            });

        case 'UPDATE_STATUS_PAGE': {
            const isValidMonitorNote =
                state.individualnote &&
                action.payload.monitorIds &&
                action.payload.monitorIds.length > 0 &&
                action.payload.monitorIds.find(
                    monitor => monitor._id === state.individualnote._id
                );
            return Object.assign({}, state, {
                error: null,
                statusPage: {
                    ...action.payload,

                    monitorsData:
                        action.payload.monitorsData &&
                        action.payload.monitorsData.length > 0
                            ? action.payload.monitorsData.map(
                                  newMonitorData => {
                                      if (
                                          state.statusPage.monitorsData &&
                                          state.statusPage.monitorsData.length >
                                              0
                                      ) {
                                          state.statusPage.monitorsData.forEach(
                                              oldMonitorData => {
                                                  if (
                                                      newMonitorData._id ===
                                                      oldMonitorData._id
                                                  ) {
                                                      newMonitorData.statuses =
                                                          oldMonitorData.statuses;
                                                  }
                                              }
                                          );
                                      }

                                      return newMonitorData;
                                  }
                              )
                            : [],
                },
                individualnote: isValidMonitorNote
                    ? state.individualnote
                    : null,
                notesmessage: isValidMonitorNote ? state.notesmessage : null,
                requesting: false,
            });
        }

        case 'UPDATE_MONITOR':
            return Object.assign({}, state, {
                error: null,
                statusPage: {
                    ...state.statusPage,

                    monitorIds:
                        state.statusPage.monitorIds &&
                        state.statusPage.monitorIds.length > 0
                            ? state.statusPage.monitorIds.map(monitor => {
                                  if (monitor._id === action.payload._id) {
                                      monitor.name = action.payload.name;
                                  }
                                  return monitor;
                              })
                            : [],
                    monitorsData:
                        state.statusPage.monitorsData &&
                        state.statusPage.monitorsData.length > 0
                            ? state.statusPage.monitorsData.map(monitor => {
                                  if (monitor._id === action.payload._id) {
                                      return {
                                          ...monitor,
                                          ...action.payload,
                                          monitorCategoryId:
                                              action.payload.monitorCategoryId,
                                      };
                                  }
                                  return monitor;
                              })
                            : [],
                },
                requesting: false,
            });

        case 'DELETE_MONITOR': {
            const isIndividualNote =
                state.individualnote &&
                state.individualnote._id === action.payload;
            return Object.assign({}, state, {
                error: null,
                statusPage: {
                    ...state.statusPage,

                    monitorIds:
                        state.statusPage.monitorIds &&
                        state.statusPage.monitorIds.length > 0
                            ? state.statusPage.monitorIds.filter(
                                  monitor => monitor._id !== action.payload
                              )
                            : [],
                    monitorsData:
                        state.statusPage.monitorsData &&
                        state.statusPage.monitorsData.length > 0
                            ? state.statusPage.monitorsData.filter(
                                  monitor => monitor._id !== action.payload
                              )
                            : [],
                },
                individualnote: isIndividualNote ? null : state.individualnote,
                notesmessage: isIndividualNote ? null : state.notesmessage,
                requesting: false,
            });
        }

        case STATUSPAGE_NOTES_SUCCESS:
            return Object.assign({}, state, {
                notes: {
                    error: null,
                    notes:
                        action.payload && action.payload.data
                            ? action.payload.data
                            : [],
                    requesting: false,
                    skip:
                        action.payload && action.payload.skip
                            ? action.payload.skip
                            : 0,
                    count:
                        action.payload && action.payload.count
                            ? action.payload.count
                            : 0,
                },
            });

        case STATUSPAGE_NOTES_FAILURE:
            return Object.assign({}, state, {
                notes: {
                    error: action.payload,
                    notes: state.notes.notes,
                    requesting: false,
                    skip: state.notes.skip,
                    count: state.notes.count,
                },
            });

        case STATUSPAGE_NOTES_REQUEST:
            return Object.assign({}, state, {
                notes: {
                    error: null,
                    notes: [],
                    requesting: true,
                    skip: 0,
                    count: 0,
                },
            });

        case STATUSPAGE_NOTES_RESET:
            return Object.assign({}, state, {
                notes: {
                    error: null,
                    notes: [],
                    requesting: false,
                    skip: 0,
                    count: 0,
                },
            });

        case 'UPDATE_INCIDENT_NOTE':
            return Object.assign({}, state, {
                notes: {
                    ...state.notes,

                    notes:
                        state.notes.notes && state.notes.notes.length > 0
                            ? state.notes.notes.map(note => {
                                  if (note._id === action.payload._id) {
                                      return action.payload;
                                  } else {
                                      return note;
                                  }
                              })
                            : [],
                },
            });

        case MORE_NOTES_SUCCESS:
            return Object.assign({}, state, {
                notes: {
                    error: null,
                    notes: state.notes.notes.concat(action.payload.data),
                    requesting: false,
                    skip: action.payload.skip,
                    count: action.payload.count
                        ? action.payload.count
                        : state.notes.count,
                },
                requestingmore: false,
            });

        case MORE_NOTES_FAILURE:
            return Object.assign({}, state, {
                notes: {
                    error: action.payload,
                    notes: state.notes.notes,
                    requesting: false,
                    skip: state.notes.skip,
                    count: state.notes.count,
                },
                requestingmore: false,
            });

        case MORE_NOTES_REQUEST:
            return Object.assign({}, state, { requestingmore: true });

        case INDIVIDUAL_NOTES_ENABLE:
            return Object.assign({}, state, {
                individualnote: action.payload.name,
                notesmessage: action.payload.message,
            });

        case INDIVIDUAL_NOTES_DISABLE:
            return Object.assign({}, state, {
                individualnote: null,
                notesmessage: null,
            });

        case SCHEDULED_EVENTS_SUCCESS:
            return Object.assign({}, state, {
                events: {
                    error: null,
                    events:
                        action.payload && action.payload.data
                            ? action.payload.data
                            : [],
                    requesting: false,
                    skip:
                        action.payload && action.payload.skip
                            ? action.payload.skip
                            : 0,
                    count:
                        action.payload && action.payload.count
                            ? action.payload.count
                            : 0,
                },
            });

        case SCHEDULED_EVENTS_FAILURE:
            return Object.assign({}, state, {
                events: {
                    error: action.payload,
                    events: state.events.events,
                    requesting: false,
                    skip: state.events.skip,
                    count: state.events.count,
                },
            });

        case SCHEDULED_EVENTS_REQUEST:
            return Object.assign({}, state, {
                events: {
                    error: null,
                    events: [],
                    requesting: true,
                    skip: 0,
                    count: 0,
                },
            });

        case SCHEDULED_EVENTS_RESET:
            return Object.assign({}, state, {
                events: {
                    error: null,
                    events: [],
                    requesting: false,
                    skip: 0,
                    count: 0,
                },
            });

        case 'ADD_SCHEDULED_EVENT': {
            let monitorInStatusPage = false;
            const eventArray = [];
            action.payload.monitors.map(monitor => {
                return state.statusPage.monitors.map(monitorData => {
                    if (
                        String(monitorData.monitor) ===
                        String(monitor.monitorId._id)
                    ) {
                        const dataObj = { ...action.payload };
                        dataObj.monitors = [monitor];
                        eventArray.push(dataObj);
                        monitorInStatusPage = true;
                    }
                    return monitorData;
                });
            });

            return Object.assign({}, state, {
                events: {
                    ...state.events,
                    events: monitorInStatusPage
                        ? [...eventArray, ...state.events.events]
                        : [...state.events.events],
                    count: state.events.count + eventArray.length,
                },
            });
        }

        case 'UPDATE_SCHEDULED_EVENT': {
            const events = state.events.events.map(event => {
                if (event._id === action.payload._id) {
                    // monitors are not updated during scheduled event update
                    return { ...action.payload, monitors: event.monitors };
                }
                return event;
            });

            return Object.assign({}, state, {
                events: {
                    ...state.events,
                    events,
                },
            });
        }

        case MORE_EVENTS_SUCCESS:
            return Object.assign({}, state, {
                events: {
                    error: null,
                    events: state.events.events.concat(action.payload.data),
                    requesting: false,
                    skip: action.payload.skip,
                    count: action.payload.count
                        ? action.payload.count
                        : state.events.count,
                },
                requestingmoreevents: false,
            });

        case MORE_EVENTS_FAILURE:
            return Object.assign({}, state, {
                events: {
                    error: action.payload,
                    events: state.events.events,
                    requesting: false,
                    skip: state.events.skip,
                    count: state.events.count,
                },
                requestingmoreevents: false,
            });

        case MORE_EVENTS_REQUEST:
            return Object.assign({}, state, { requestingmoreevents: true });

        case INDIVIDUAL_EVENTS_ENABLE:
            return Object.assign({}, state, {
                individualevent: action.payload.name,
                eventsmessage: action.payload.message,
            });

        case INDIVIDUAL_EVENTS_DISABLE:
            return Object.assign({}, state, {
                individualevent: null,
                eventsmessage: null,
            });

        case SELECT_PROBE:
            return Object.assign({}, state, {
                activeProbe: action.payload,
            });

        case FETCH_MONITOR_STATUSES_REQUEST:
            return Object.assign({}, state, {
                requestingstatuses: true,
            });

        case FETCH_MONITOR_STATUSES_SUCCESS:
            return Object.assign({}, state, {
                statusPage: {
                    ...state.statusPage,

                    monitorsData: state.statusPage.monitorsData.map(monitor => {
                        if (monitor._id === action.payload.monitorId) {
                            monitor.statuses = action.payload.statuses.data;
                        }
                        return monitor;
                    }),
                },
                requestingstatuses: false,
            });

        case FETCH_MONITOR_STATUSES_FAILURE:
            return Object.assign({}, state, {
                statusPage: {
                    ...state.statusPage,

                    requesting: false,
                    error: action.payload,
                    success: false,
                },
                requestingstatuses: false,
            });

        case 'UPDATE_MONITOR_STATUS':
            return Object.assign({}, state, {
                statusPage: {
                    ...state.statusPage,

                    monitorsData: state.statusPage.monitorsData.map(monitor => {
                        if (monitor._id === action.payload.status.monitorId) {
                            const data = Object.assign(
                                {},
                                action.payload.status.data
                            );
                            const probes = action.payload.probes;
                            const isValidProbe =
                                (monitor.type === 'url' ||
                                    monitor.type === 'api' ||
                                    monitor.type === 'device') &&
                                probes &&
                                probes.length > 0;

                            if (
                                monitor.statuses &&
                                monitor.statuses.length > 0
                            ) {
                                const monitorProbes = monitor.statuses.map(
                                    a => a._id
                                );

                                if (
                                    monitorProbes.includes(data.probeId) ||
                                    !data.probeId
                                ) {
                                    monitor.statuses = monitor.statuses.map(
                                        probeStatuses => {
                                            const probeId = probeStatuses._id;

                                            if (
                                                probeId === data.probeId ||
                                                !data.probeId
                                            ) {
                                                const previousStatus =
                                                    probeStatuses.statuses[0];
                                                previousStatus.endTime = new Date().toISOString();

                                                return {
                                                    _id: probeId,
                                                    statuses: [
                                                        data,
                                                        previousStatus,
                                                        ...probeStatuses.statuses.slice(
                                                            1
                                                        ),
                                                    ],
                                                };
                                            } else {
                                                return probeStatuses;
                                            }
                                        }
                                    );

                                    if (
                                        isValidProbe &&
                                        !probes.every(probe =>
                                            monitorProbes.includes(probe._id)
                                        )
                                    ) {
                                        // add manual status to all new probes
                                        const newProbeStatuses = [];

                                        probes.forEach(probe => {
                                            if (
                                                !monitorProbes.includes(
                                                    probe._id
                                                )
                                            ) {
                                                newProbeStatuses.push({
                                                    _id: probe._id,
                                                    statuses: [data],
                                                });
                                            }
                                        });

                                        monitor.statuses = [
                                            ...monitor.statuses,
                                            ...newProbeStatuses,
                                        ];
                                    }
                                } else {
                                    monitor.statuses = [
                                        ...monitor.statuses,
                                        {
                                            _id: data.probeId || null,
                                            statuses: [data],
                                        },
                                    ];
                                }
                            } else {
                                if (isValidProbe) {
                                    monitor.statuses = probes.map(probe => ({
                                        _id: probe._id,
                                        statuses: [data],
                                    }));
                                } else {
                                    monitor.statuses = [
                                        {
                                            _id: data.probeId || null,
                                            statuses: [data],
                                        },
                                    ];
                                }
                            }
                        }
                        return monitor;
                    }),
                },
                requestingstatuses: false,
            });

        case FETCH_MONITOR_LOGS_REQUEST:
            return Object.assign({}, state, {
                logs: state.logs.some(log => log.monitorId === action.payload)
                    ? state.logs.map(log =>
                          log.monitorId !== action.payload
                              ? log
                              : {
                                    monitorId: action.payload,
                                    error: null,
                                    logs: [],
                                    requesting: true,
                                }
                      )
                    : [
                          ...state.logs,
                          {
                              monitorId: action.payload,
                              logs: [],
                              requesting: true,
                              error: null,
                          },
                      ],
            });
        case FETCH_MONITOR_LOGS_SUCCESS:
            return Object.assign({}, state, {
                logs: state.logs.map(log =>
                    log.monitorId !== action.payload.monitorId
                        ? log
                        : {
                              monitorId: action.payload.monitorId,
                              logs:
                                  action.payload.logs.data.length === 0
                                      ? []
                                      : action.payload.logs.data[0].logs,
                              requesting: false,
                              error: null,
                          }
                ),
            });
        case FETCH_MONITOR_LOGS_FAILURE:
            return Object.assign({}, state, {
                logs: state.logs.map(log =>
                    log.monitorId !== action.payload
                        ? log
                        : {
                              monitorId: action.payload.monitorId,
                              logs: [],
                              requesting: false,
                              error: action.payload,
                          }
                ),
            });

        case FETCH_EVENT_REQUEST:
            return {
                ...state,
                scheduledEvent: {
                    ...state.scheduledEvent,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case FETCH_EVENT_SUCCESS:
            return {
                ...state,
                scheduledEvent: {
                    requesting: false,
                    success: true,
                    error: null,
                    event: action.payload.data,
                },
            };

        case FETCH_EVENT_FAILURE:
            return {
                ...state,
                scheduledEvent: {
                    ...state.scheduledEvent,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case FETCH_EVENT_NOTES_REQUEST:
            return {
                ...state,
                eventNoteList: {
                    ...state.eventNoteList,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case FETCH_EVENT_NOTES_SUCCESS:
            return {
                ...state,
                eventNoteList: {
                    ...state.eventNoteList,
                    requesting: false,
                    success: true,
                    error: null,
                    eventNotes: action.payload.data,
                    count: action.payload.count,
                },
            };

        case FETCH_EVENT_NOTES_FAILURE:
            return {
                ...state,
                eventNoteList: {
                    ...state.eventNoteList,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case MORE_EVENT_NOTE_REQUEST:
            return {
                ...state,
                requestingMoreNote: true,
                moreNoteError: null,
            };

        case MORE_EVENT_NOTE_SUCCESS: {
            return {
                ...state,
                eventNoteList: {
                    ...state.eventNoteList,
                    eventNotes: [
                        ...state.eventNoteList.eventNotes,
                        ...action.payload.data,
                    ],
                    skip: action.payload.skip,
                },
                requestingMoreNote: false,
                moreNoteError: null,
            };
        }

        case MORE_EVENT_NOTE_FAILURE:
            return {
                ...state,
                requestingMoreNote: false,
                moreNoteError: action.payload,
            };

        case FETCH_INCIDENT_REQUEST:
            return {
                ...state,
                incident: {
                    ...state.incident,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case FETCH_INCIDENT_SUCCESS:
            return {
                ...state,
                incident: {
                    requesting: false,
                    success: true,
                    error: null,
                    incident: action.payload,
                },
            };

        case FETCH_INCIDENT_FAILURE:
            return {
                ...state,
                incident: {
                    ...state.incident,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case FETCH_INCIDENT_NOTES_REQUEST:
            return {
                ...state,
                incidentNotes: {
                    ...state.incidentNotes,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case FETCH_INCIDENT_NOTES_SUCCESS:
            return {
                ...state,
                incidentNotes: {
                    ...state.incidentNotes,
                    requesting: false,
                    success: true,
                    error: null,
                    notes: action.payload.data,
                    count: action.payload.count,
                },
            };

        case FETCH_INCIDENT_NOTES_FAILURE:
            return {
                ...state,
                incidentNotes: {
                    ...state.incidentNotes,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case MORE_INCIDENT_NOTES_REQUEST:
            return {
                ...state,
                moreIncidentNotes: true,
            };

        case MORE_INCIDENT_NOTES_SUCCESS:
            return {
                ...state,
                moreIncidentNotes: false,
                incidentNotes: {
                    ...state.incidentNotes,
                    notes: [
                        ...state.incidentNotes.notes,
                        ...action.payload.data,
                    ],
                    skip: action.payload.skip,
                },
            };

        case MORE_INCIDENT_NOTES_FAILURE:
            return {
                ...state,
                moreIncidentNotes: false,
                moreIncidentNotesError: action.payload,
            };

        case 'INCIDENT_CREATED':
            return {
                ...state,
                notes: {
                    ...state.notes,
                    notes: [...state.notes.notes, action.payload],
                    count: state.notes.count + 1,
                },
            };

        case 'INCIDENT_UPDATED': {
            const notes = state.notes.notes.map(note => {
                if (String(note._id) === String(action.payload._id)) {
                    note = action.payload;
                    return note;
                }
                return note;
            });
            return {
                ...state,
                notes: {
                    ...state.notes,
                    notes,
                },
            };
        }

        default:
            return state;
    }
};
