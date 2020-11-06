import * as types from '../constants/incident';

const initialState = {
    incidents: {
        requesting: false,
        error: null,
        success: false,
        incidents: [],
        count: null,
        limit: null,
        skip: null,
    },
    newIncident: {
        requesting: false,
        error: null,
        success: false,
        monitorId: null,
    },
    incident: {
        requesting: false,
        resolving: false,
        error: null,
        success: false,
        incident: null,
        count: 0,
        skip: 0,
        limit: 10,
        deleteIncident: {
            requesting: false,
            error: null,
            success: false,
        },
    },
    investigationNotes: {
        create: {
            requesting: false,
            error: null,
            success: false,
        },
        edit: {
            requesting: false,
            error: null,
            success: false,
        },
    },
    internalNotes: {
        create: {
            requesting: false,
            error: null,
            success: false,
        },
        edit: {
            requesting: false,
            error: null,
            success: false,
        },
    },
    unresolvedincidents: {
        requesting: false,
        error: null,
        success: false,
        incidents: [],
        resolving: false,
    },
    closeincident: {
        requesting: false,
        error: null,
        success: false,
    },
    editIncident: {
        requesting: false,
        error: null,
        success: false,
    },
    fetchIncidentTimelineRequest: false,
    incidentMessages: {},
};

export default function incident(state = initialState, action) {
    let incident,
        incidents,
        unresolvedincidents,
        index,
        index1,
        isExistingIncident,
        failureIncidentMessage,
        requestIncidentMessage,
        incidentMessages,
        noteStatus;
    switch (action.type) {
        case types.INCIDENTS_SUCCESS:
            return Object.assign({}, state, {
                incidents: {
                    requesting: false,
                    error: null,
                    success: true,
                    incidents: action.payload,
                },
            });

        case types.INCIDENTS_REQUEST:
            return Object.assign({}, state, {
                incidents: {
                    ...state.incidents,
                    requesting: true,
                    success: false,
                    error: null,
                    count: null,
                    limit: null,
                    skip: null,
                },
            });

        case types.INCIDENTS_FAILED:
            return Object.assign({}, state, {
                incidents: {
                    ...state.incidents,
                    requesting: false,
                    error: action.payload,
                    success: false,
                    count: null,
                    limit: null,
                    skip: null,
                },
            });

        case types.INCIDENTS_RESET:
            return Object.assign({}, state, {
                incidents: {
                    requesting: false,
                    error: null,
                    success: false,
                    incidents: [],
                    count: null,
                    limit: null,
                    skip: null,
                },
            });

        case types.CREATE_INCIDENT_RESET:
            return Object.assign({}, state, {
                newIncident: initialState.newIncident,
            });

        case types.CREATE_INCIDENT_SUCCESS:
            isExistingIncident = state.incidents.incidents.find(
                incident => incident._id === action.payload.projectId
            );
            return Object.assign({}, state, {
                newIncident: {
                    requesting: false,
                    error: null,
                    success: false,
                    monitorId: null,
                },
                incidents: {
                    incidents: isExistingIncident
                        ? state.incidents.incidents.length > 0
                            ? state.incidents.incidents.map(incident => {
                                  return incident._id ===
                                      action.payload.projectId
                                      ? {
                                            _id: action.payload.projectId,
                                            incidents: [
                                                action.payload,
                                                ...incident.incidents.filter(
                                                    (inc, index) => index < 9
                                                ),
                                            ],
                                            count: incident.count + 1,
                                            skip: incident.skip,
                                            limit: incident.limit,
                                        }
                                      : incident;
                              })
                            : [
                                  {
                                      _id: action.payload.projectId,
                                      incidents: [action.payload],
                                      count: 1,
                                      skip: 0,
                                      limit: 0,
                                  },
                              ]
                        : state.incidents.incidents.concat([
                              {
                                  _id: action.payload.projectId,
                                  incidents: [action.payload],
                                  count: 1,
                                  skip: 0,
                                  limit: 0,
                              },
                          ]),
                    error: null,
                    requesting: false,
                    success: true,
                },
            });

        case types.CREATE_INCIDENT_REQUEST:
            return Object.assign({}, state, {
                newIncident: {
                    requesting: true,
                    success: false,
                    error: null,
                    monitorId: action.payload,
                },
            });

        case types.CREATE_INCIDENT_FAILED:
            return Object.assign({}, state, {
                newIncident: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                    monitorId: null,
                },
            });

        case types.UPDATE_INCIDENT_REQUEST:
            return Object.assign({}, state, {
                editIncident: {
                    ...state.editIncident,
                    error: null,
                    requesting: true,
                    success: false,
                },
            });

        case types.UPDATE_INCIDENT_SUCCESS:
            incidents = Object.assign([], state.incidents.incidents);
            index = incidents.findIndex(
                incident => incident._id === action.payload._id
            );
            if (index >= 0) incidents[index] = action.payload;

            if (
                state.incident.incident &&
                state.incident.incident._id === action.payload._id
            )
                incident = Object.assign({}, action.payload);
            else Object.assign(incident, state.incident.incident);

            unresolvedincidents = Object.assign(
                [],
                state.unresolvedincidents.incidents
            );
            index1 = unresolvedincidents.findIndex(
                incident => incident._id === action.payload._id
            );
            if (index1 >= 0) unresolvedincidents[index1] = action.payload;

            return Object.assign({}, state, {
                incidents: {
                    ...state.incidents,
                    incidents,
                },
                incident: {
                    ...state.incident,
                    incident,
                },
                unresolvedincidents: {
                    ...state.unresolvedincidents,
                    incidents: unresolvedincidents,
                },
                editIncident: {
                    ...state.editIncident,
                    error: null,
                    requesting: false,
                    success: true,
                },
            });

        case types.UPDATE_INCIDENT_FAILED:
            return Object.assign({}, state, {
                editIncident: {
                    ...state.editIncident,
                    error: action.payload,
                    requesting: false,
                    success: false,
                },
            });

        case types.UPDATE_INCIDENT_RESET:
            return Object.assign({}, state, {
                editIncident: {
                    ...state.editIncident,
                    error: null,
                    requesting: false,
                    success: false,
                },
            });

        case types.INCIDENT_SUCCESS: {
            return Object.assign({}, state, {
                incident: {
                    requesting: false,
                    error: null,
                    success: true,
                    incident: action.payload,
                },
            });
        }

        case types.INCIDENT_REQUEST:
            return Object.assign({}, state, {
                incident: {
                    ...state.incident,
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case types.INCIDENT_FAILED:
            if (action.payload.multiple)
                return Object.assign({}, state, {
                    unresolvedincidents: {
                        requesting: false,
                        error: action.payload.error,
                        success: false,
                        incidents: state.unresolvedincidents.incidents,
                    },
                });
            else
                return Object.assign({}, state, {
                    incident: {
                        ...state.incident,
                        requesting: false,
                        error: action.payload.error,
                        success: false,
                    },
                });

        case types.INCIDENT_RESET:
            return Object.assign({}, state, {
                incident: {
                    requesting: false,
                    error: null,
                    success: false,
                    incident: null,
                },
            });

        case types.INCIDENT_TIMELINE_REQUEST:
            return Object.assign({}, state, {
                fetchIncidentTimelineRequest: true,
            });

        case types.INCIDENT_TIMELINE_SUCCESS: {
            const incident = Object.assign({}, state.incident.incident);
            if (incident) incident.timeline = action.payload.data;
            return Object.assign({}, state, {
                incident: {
                    ...state.incident,
                    ...incident,
                    count: action.payload.count,
                    skip: action.payload.skip,
                    limit: action.payload.limit,
                },
                fetchIncidentTimelineRequest: false,
            });
        }

        case types.INCIDENT_TIMELINE_FAILED:
            return Object.assign({}, state, {
                incident: {
                    ...state.incident,
                    error: action.payload,
                },
                fetchIncidentTimelineRequest: false,
            });

        case 'UPDATE_INCIDENT_TIMELINE': {
            const incident = Object.assign({}, state.incident.incident);
            if (
                incident &&
                incident.timeline &&
                action.payload.incidentId === incident._id
            ) {
                incident.timeline = [...incident.timeline, action.payload];
                if (incident.timeline.length > 10) incident.timeline.pop();
                return Object.assign({}, state, {
                    incident: {
                        ...state.incident,
                        incident,
                        count: state.incident.count + 1,
                    },
                });
            } else {
                return state;
            }
        }

        case types.PROJECT_INCIDENTS_SUCCESS:
            return Object.assign({}, state, {
                incidents: {
                    incidents: state.incidents.incidents.map(incident => {
                        return incident._id === action.payload.projectId
                            ? {
                                  _id: action.payload.projectId,
                                  incidents: [...action.payload.data],
                                  count: action.payload.count,
                                  skip: action.payload.skip,
                                  limit: action.payload.limit,
                              }
                            : incident;
                    }),
                    error: null,
                    requesting: false,
                    success: true,
                },
            });

        case types.PROJECT_INCIDENTS_REQUEST:
            return Object.assign({}, state, {
                incidents: {
                    requesting: true,
                    success: false,
                    error: null,
                    incidents: state.incidents.incidents,
                },
            });

        case types.PROJECT_INCIDENTS_FAILED:
            return Object.assign({}, state, {
                incidents: {
                    requesting: false,
                    error: action.payload.error,
                    success: false,
                    incidents: state.incidents.incidents,
                },
            });

        case types.PROJECT_INCIDENTS_RESET:
            return Object.assign({}, state, {
                incidents: {
                    requesting: false,
                    error: null,
                    success: false,
                    incidents: [],
                },
            });

        case types.ACKNOWLEDGE_INCIDENT_SUCCESS:
            if (action.payload.multiple) {
                return Object.assign({}, state, {
                    unresolvedincidents: {
                        requesting: false,
                        resolving: false,
                        error: null,
                        success: true,
                        incidents: state.unresolvedincidents.incidents.map(
                            incident => {
                                if (incident._id === action.payload.data._id) {
                                    return action.payload.data;
                                } else {
                                    return incident;
                                }
                            }
                        ),
                    },
                });
            } else {
                return Object.assign({}, state, {
                    incident: {
                        requesting: false,
                        resolving: false,
                        error: null,
                        success: true,
                        incident: action.payload.data,
                    },
                    unresolvedincidents: {
                        requesting: false,
                        resolving: false,
                        error: null,
                        success: true,
                        incidents: state.unresolvedincidents.incidents.map(
                            incident => {
                                if (incident._id === action.payload.data._id) {
                                    return action.payload.data;
                                } else {
                                    return incident;
                                }
                            }
                        ),
                    },
                });
            }

        case types.RESOLVE_INCIDENT_SUCCESS:
            if (action.payload.multiple) {
                return Object.assign({}, state, {
                    incident: {
                        ...state.incident,
                        incident: action.payload.data,
                    },
                    unresolvedincidents: {
                        requesting: false,
                        resolving: false,
                        error: null,
                        success: true,
                        incidents: state.unresolvedincidents.incidents.map(
                            incident => {
                                if (incident._id === action.payload.data._id) {
                                    return action.payload.data;
                                } else {
                                    return incident;
                                }
                            }
                        ),
                    },
                });
            } else {
                return Object.assign({}, state, {
                    incident: {
                        requesting: false,
                        resolving: false,
                        error: null,
                        success: true,
                        incident: action.payload.data,
                    },
                    unresolvedincidents: {
                        requesting: false,
                        resolving: false,
                        error: null,
                        success: true,
                        incidents: state.unresolvedincidents.incidents.map(
                            incident => {
                                if (incident._id === action.payload.data._id) {
                                    return action.payload.data;
                                } else {
                                    return incident;
                                }
                            }
                        ),
                    },
                });
            }

        case types.ACKNOWLEDGE_INCIDENT_REQUEST:
            if (action.payload.multiple) {
                return Object.assign({}, state, {
                    unresolvedincidents: {
                        ...state.unresolvedincidents,
                        requesting: true,
                        success: false,
                        error: null,
                        resolving: false,
                    },
                });
            } else {
                return Object.assign({}, state, {
                    incident: {
                        ...state.incident,
                        requesting: true,
                        success: false,
                        error: null,
                        resolving: false,
                    },
                });
            }

        case types.RESOLVE_INCIDENT_REQUEST:
            if (action.payload.multiple) {
                return Object.assign({}, state, {
                    unresolvedincidents: {
                        ...state.unresolvedincidents,
                        requesting: false,
                        success: false,
                        error: null,
                        resolving: true,
                    },
                });
            } else {
                return Object.assign({}, state, {
                    incident: {
                        ...state.incident,
                        requesting: false,
                        success: false,
                        error: null,
                        resolving: true,
                    },
                });
            }

        case types.UNRESOLVED_INCIDENTS_SUCCESS: {
            return Object.assign({}, state, {
                unresolvedincidents: {
                    requesting: false,
                    error: null,
                    success: true,
                    incidents: action.payload,
                    resolving: false,
                },
            });
        }

        case types.UNRESOLVED_INCIDENTS_REQUEST:
            return Object.assign({}, state, {
                unresolvedincidents: {
                    ...state.unresolvedincidents,
                    requesting: true,
                    success: false,
                    error: null,
                    resolving: false,
                },
            });

        case types.UNRESOLVED_INCIDENTS_FAILED:
            return Object.assign({}, state, {
                unresolvedincidents: {
                    ...state.unresolvedincidents,
                    requesting: false,
                    error: action.payload,
                    success: false,
                    resolving: false,
                },
            });

        case types.UNRESOLVED_INCIDENTS_RESET:
            return Object.assign({}, state, {
                unresolvedincidents: {
                    requesting: false,
                    error: null,
                    success: false,
                    incidents: [],
                    resolving: false,
                },
            });

        case types.DELETE_PROJECT_INCIDENTS:
            incidents = Object.assign([], state.incidents);
            incidents = incidents.filter(
                incident => incident.projectId !== action.payload
            );
            return Object.assign({}, state, {
                incidents: {
                    requesting: false,
                    error: null,
                    success: false,
                    incidents,
                    count: null,
                    limit: null,
                    skip: null,
                },
            });

        case types.INTERNAL_NOTE_SUCCESS:
            incidentMessages =
                state.incidentMessages[action.payload.incidentId._id][
                    action.payload.type
                ].incidentMessages.filter(
                    incidentMessage =>
                        incidentMessage._id === action.payload._id
                ).length > 0
                    ? state.incidentMessages[action.payload.incidentId._id][
                          action.payload.type
                      ].incidentMessages.map(incidentMessage => {
                          if (incidentMessage._id === action.payload._id) {
                              incidentMessage = action.payload;
                          }
                          return incidentMessage;
                      })
                    : [action.payload].concat(
                          state.incidentMessages[action.payload.incidentId._id][
                              action.payload.type
                          ].incidentMessages
                      );
            if (incidentMessages.length > 10) incidentMessages.pop();
            noteStatus = action.payload.updated
                ? { edit: { requesting: false, success: true, error: null } }
                : { create: { requesting: false, success: true, error: null } };
            return Object.assign({}, state, {
                incidentMessages: {
                    ...state.incidentMessages,
                    [action.payload.incidentId._id]: {
                        ...state.incidentMessages[
                            action.payload.incidentId._id
                        ],
                        [action.payload.type]: {
                            ...state.incidentMessages[
                                action.payload.incidentId._id
                            ][action.payload.type],
                            incidentMessages: incidentMessages,
                            count: action.payload.updated
                                ? state.incidentMessages[
                                      action.payload.incidentId._id
                                  ][action.payload.type].count
                                : state.incidentMessages[
                                      action.payload.incidentId._id
                                  ][action.payload.type].count + 1,
                        },
                    },
                },
                internalNotes: {
                    ...state.internalNotes,
                    ...noteStatus,
                },
            });

        case types.INTERNAL_NOTE_REQUEST:
            noteStatus = action.payload.updated
                ? { edit: { requesting: true, success: false, error: null } }
                : { create: { requesting: true, success: false, error: null } };
            return Object.assign({}, state, {
                internalNotes: {
                    ...state.internalNotes,
                    ...noteStatus,
                },
            });

        case types.INTERNAL_NOTE_FAILED:
            noteStatus = action.payload.updated
                ? {
                      edit: {
                          requesting: false,
                          success: false,
                          error: action.payload.error,
                      },
                  }
                : {
                      create: {
                          requesting: false,
                          success: false,
                          error: action.payload.error,
                      },
                  };
            return Object.assign({}, state, {
                internalNotes: {
                    ...state.internalNotes,
                    ...noteStatus,
                },
            });

        case types.INVESTIGATION_NOTE_SUCCESS: {
            let noteFound = false;
            incidentMessages =
                state.incidentMessages[action.payload.incidentId._id][
                    action.payload.type
                ].incidentMessages.filter(
                    incidentMessage =>
                        incidentMessage._id === action.payload._id
                ).length > 0
                    ? state.incidentMessages[action.payload.incidentId._id][
                          action.payload.type
                      ].incidentMessages.map(incidentMessage => {
                          if (incidentMessage._id === action.payload._id) {
                              noteFound = true;
                              incidentMessage = action.payload;
                          }
                          return incidentMessage;
                      })
                    : [action.payload].concat(
                          state.incidentMessages[action.payload.incidentId._id][
                              action.payload.type
                          ].incidentMessages
                      );
            if (incidentMessages.length > 10) incidentMessages.pop();
            noteStatus = action.payload.updated
                ? { edit: { requesting: false, success: true, error: null } }
                : { create: { requesting: false, success: true, error: null } };
            return Object.assign({}, state, {
                incidentMessages: {
                    ...state.incidentMessages,
                    [action.payload.incidentId._id]: {
                        ...state.incidentMessages[
                            action.payload.incidentId._id
                        ],
                        [action.payload.type]: {
                            ...state.incidentMessages[
                                action.payload.incidentId._id
                            ][action.payload.type],
                            incidentMessages: incidentMessages,
                            count:
                                noteFound || action.payload.updated
                                    ? state.incidentMessages[
                                          action.payload.incidentId._id
                                      ][action.payload.type].count
                                    : state.incidentMessages[
                                          action.payload.incidentId._id
                                      ][action.payload.type].count + 1,
                        },
                    },
                },
                investigationNotes: {
                    ...state.investigationNotes,
                    ...noteStatus,
                },
            });
        }

        case types.INVESTIGATION_NOTE_REQUEST:
            noteStatus = action.payload.updated
                ? { edit: { requesting: true, success: false, error: null } }
                : { create: { requesting: true, success: false, error: null } };
            return Object.assign({}, state, {
                investigationNotes: {
                    ...state.investigationNotes,
                    ...noteStatus,
                },
            });

        case types.INVESTIGATION_NOTE_FAILED:
            noteStatus = action.payload.updated
                ? {
                      edit: {
                          requesting: false,
                          success: false,
                          error: action.payload.error,
                      },
                  }
                : {
                      create: {
                          requesting: false,
                          success: false,
                          error: action.payload.error,
                      },
                  };
            return Object.assign({}, state, {
                investigationNotes: {
                    ...state.investigationNotes,
                    ...noteStatus,
                },
            });

        case 'ADD_INCIDENT_NOTE': {
            let incidentFound = false;
            let incidentMessages = [];
            if (state.incidentMessages[action.payload.incidentId._id]) {
                incidentMessages = [
                    ...state.incidentMessages[action.payload.incidentId._id][
                        action.payload.type
                    ].incidentMessages.map(incidentMessage => {
                        if (
                            String(incidentMessage._id) ===
                            String(action.payload._id)
                        ) {
                            incidentFound = true;
                            return action.payload;
                        }
                        return incidentMessage;
                    }),
                ];

                if (!incidentFound) {
                    incidentMessages = [action.payload, ...incidentMessages];
                }

                return {
                    ...state,
                    incidentMessages: {
                        ...state.incidentMessages,
                        [action.payload.incidentId._id]: {
                            ...state.incidentMessages[
                                action.payload.incidentId._id
                            ],
                            [action.payload.type]: {
                                ...state.incidentMessages[
                                    action.payload.incidentId._id
                                ][action.payload.type],
                                incidentMessages,
                                count: incidentFound
                                    ? state.incidentMessages[
                                          action.payload.incidentId._id
                                      ][action.payload.type].count
                                    : state.incidentMessages[
                                          action.payload.incidentId._id
                                      ][action.payload.type].count + 1,
                            },
                        },
                    },
                };
            }

            return {
                ...state,
            };
        }

        case 'INCIDENT_RESOLVED_BY_SOCKET':
            return Object.assign({}, state, {
                unresolvedincidents: {
                    requesting: false,
                    error: null,
                    success: true,
                    incidents: state.unresolvedincidents.incidents.map(
                        incident => {
                            if (incident._id === action.payload.data._id) {
                                return action.payload.data;
                            } else {
                                return incident;
                            }
                        }
                    ),
                },
                incident: {
                    requesting: false,
                    error: null,
                    success: true,
                    incident:
                        state.incident.incident &&
                        state.incident.incident._id === action.payload.data._id
                            ? action.payload.data
                            : state.incident.incident,
                },
            });

        case 'INCIDENT_ACKNOWLEDGED_BY_SOCKET':
            return Object.assign({}, state, {
                unresolvedincidents: {
                    requesting: false,
                    error: null,
                    success: true,
                    incidents: state.unresolvedincidents.incidents.map(
                        incident => {
                            if (incident._id === action.payload.data._id) {
                                return action.payload.data;
                            } else {
                                return incident;
                            }
                        }
                    ),
                },
                incident: {
                    requesting: false,
                    error: null,
                    success: true,
                    incident:
                        state.incident.incident &&
                        state.incident.incident._id === action.payload.data._id
                            ? action.payload.data
                            : state.incident.incident,
                },
            });

        case 'DELETE_MONITOR_BY_SOCKET':
            return Object.assign({}, state, {
                unresolvedincidents: {
                    ...state.unresolvedincidents,
                    incidents: state.unresolvedincidents.incidents.filter(
                        incident => {
                            if (incident.monitorId._id === action.payload) {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    ),
                },
            });

        case 'ADD_NEW_INCIDENT_TO_UNRESOLVED':
            return Object.assign({}, state, {
                unresolvedincidents: {
                    ...state.unresolvedincidents,
                    incidents: [action.payload].concat(
                        state.unresolvedincidents.incidents
                    ),
                },
            });

        case 'UPDATE_INCIDENTS_MONITOR_NAME':
            return Object.assign({}, state, {
                unresolvedincidents: {
                    ...state.unresolvedincidents,
                    incidents: state.unresolvedincidents.incidents.map(
                        incident => {
                            if (incident.monitorId._id === action.payload._id) {
                                return {
                                    ...incident,
                                    monitorId: {
                                        ...incident.monitorId,
                                        name: action.payload.name,
                                    },
                                };
                            } else {
                                return incident;
                            }
                        }
                    ),
                },
            });

        case types.CLOSE_INCIDENT_SUCCESS:
            return Object.assign({}, state, {
                unresolvedincidents: {
                    requesting: false,
                    error: null,
                    success: true,
                    incidents: state.unresolvedincidents.incidents.filter(
                        incident => {
                            if (incident._id === action.payload._id) {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    ),
                },
                closeincident: {
                    requesting: false,
                    success: true,
                    error: null,
                },
            });

        case types.CLOSE_INCIDENT_REQUEST:
            return Object.assign({}, state, {
                closeincident: {
                    requesting: action.payload,
                    success: false,
                    error: null,
                },
            });

        case types.CLOSE_INCIDENT_FAILED:
            return Object.assign({}, state, {
                closeincident: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case types.DELETE_INCIDENT_SUCCESS:
            return Object.assign({}, state, {
                incident: {
                    ...state.incident,
                    deleteIncident: {
                        requesting: false,
                        success: true,
                        error: null,
                    },
                },
                unresolvedincidents: {
                    ...state.unresolvedincidents,
                    incidents: state.unresolvedincidents.incidents.filter(
                        incident => incident._id !== action.payload
                    ),
                },
            });

        case 'DELETE_INCIDENT': {
            if (state.incidents.incidents[0]) {
                return {
                    ...state,
                    incidents: {
                        ...state.incidents,
                        incidents: [
                            {
                                ...state.incidents.incidents[0],
                                incidents: state.incidents.incidents[0].incidents.filter(
                                    incident =>
                                        String(incident._id) !==
                                        String(action.payload._id)
                                ),
                            },
                        ],
                    },
                    unresolvedincidents: {
                        ...state.unresolvedincidents,
                        incidents: state.unresolvedincidents.incidents.filter(
                            incident =>
                                String(incident._id) !==
                                String(action.payload._id)
                        ),
                    },
                };
            }

            return {
                ...state,
            };
        }

        case types.DELETE_INCIDENT_FAILURE:
            return Object.assign({}, state, {
                incident: {
                    ...state.incident,
                    deleteIncident: {
                        requesting: false,
                        success: false,
                        error: action.payload,
                    },
                },
            });

        case types.DELETE_INCIDENT_REQUEST:
            return Object.assign({}, state, {
                incident: {
                    ...state.incident,
                    deleteIncident: {
                        requesting: true,
                        success: false,
                        error: null,
                    },
                },
            });

        case types.DELETE_INCIDENT_RESET:
            return Object.assign({}, state, {
                incident: {
                    ...state.incident,
                    deleteIncident: {
                        requesting: false,
                        success: false,
                        error: null,
                    },
                },
            });
        case types.FETCH_INCIDENT_MESSAGES_SUCCESS:
            return Object.assign({}, state, {
                incidentMessages: {
                    ...state.incidentMessages,
                    [action.payload.incidentId]: {
                        ...state.incidentMessages[action.payload.incidentId],
                        [action.payload.type]: {
                            incidentMessages: action.payload.incidentMessages,
                            error: null,
                            requesting: false,
                            success: true,
                            skip: action.payload.skip,
                            limit: action.payload.limit,
                            count: action.payload.count,
                        },
                    },
                },
            });
        case types.FETCH_INCIDENT_MESSAGES_FAILURE:
            failureIncidentMessage = {
                ...state.incidentMessages,
                [action.payload.incidentId]: state.incidentMessages[
                    action.payload.incidentId
                ][action.payload.type]
                    ? {
                          ...state.incidentMessages[action.payload.incidentId][
                              action.payload.type
                          ],
                          error: action.payload.error,
                      }
                    : {
                          incidentMessages: [],
                          error: action.payload.error,
                          requesting: false,
                          success: false,
                          skip: 0,
                          limit: 10,
                          count: null,
                      },
            };
            return Object.assign({}, state, {
                incidentMessages: failureIncidentMessage,
            });
        case types.FETCH_INCIDENT_MESSAGES_REQUEST:
            requestIncidentMessage = {
                ...state.incidentMessages,
                [action.payload.incidentId]: {
                    ...state.incidentMessages[action.payload.incidentId],
                    [action.payload.type]: state.incidentMessages[
                        action.payload.incidentId
                    ]
                        ? state.incidentMessages[action.payload.incidentId][
                              action.payload.type
                          ]
                            ? {
                                  ...state.incidentMessages[
                                      action.payload.incidentId
                                  ][action.payload.type],
                                  requesting: true,
                              }
                            : {
                                  incidentMessages: [],
                                  error: null,
                                  requesting: true,
                                  success: false,
                                  skip: 0,
                                  limit: 10,
                                  count: null,
                              }
                        : {
                              incidentMessages: [],
                              error: null,
                              requesting: true,
                              success: false,
                              skip: 0,
                              limit: 10,
                              count: null,
                          },
                },
            };
            return Object.assign({}, state, {
                incidentMessages: requestIncidentMessage,
            });
        case types.FETCH_INCIDENT_MESSAGES_RESET:
            return Object.assign({}, state, {
                incidentMessages: initialState.incidentMessages,
            });
        case types.EDIT_INCIDENT_MESSAGE_SWITCH:
            incidentMessages = state.incidentMessages[
                action.payload.incidentId._id
            ][action.payload.type].incidentMessages.map(incidentMessage => {
                if (incidentMessage._id === action.payload._id) {
                    if (!incidentMessage.editMode)
                        incidentMessage.editMode = true;
                    else incidentMessage.editMode = false;
                } else {
                    incidentMessage.editMode = false;
                }
                return incidentMessage;
            });
            return Object.assign({}, state, {
                incidentMessages: {
                    ...state.incidentMessages,
                    [action.payload.incidentId._id]: {
                        ...state.incidentMessages[
                            action.payload.incidentId._id
                        ],
                        [action.payload.type]: {
                            ...state.incidentMessages[
                                action.payload.incidentId._id
                            ][action.payload.type],
                            incidentMessages: incidentMessages,
                        },
                    },
                },
            });

        case types.DELETE_INCIDENT_MESSAGE_SUCCESS:
            incidentMessages = state.incidentMessages[
                action.payload.incidentId
            ][action.payload.type].incidentMessages.filter(
                incidentMessage => incidentMessage._id !== action.payload._id
            );
            return Object.assign({}, state, {
                incidentMessages: {
                    ...state.incidentMessages,
                    requesting: false,
                    error: action.payload,
                    success: false,
                    [action.payload.incidentId]: {
                        ...state.incidentMessages[action.payload.incidentId],
                        [action.payload.type]: {
                            ...state.incidentMessages[
                                action.payload.incidentId
                            ][action.payload.type],
                            incidentMessages: incidentMessages,
                            count:
                                state.incidentMessages[
                                    action.payload.incidentId
                                ][action.payload.type].count - 1,
                        },
                    },
                },
                deleteIncidentMessage: false,
            });

        case types.DELETE_INCIDENT_MESSAGE_FAILURE:
            return Object.assign({}, state, {
                incidentMessages: {
                    ...state.incidentMessages,
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
                deleteIncidentMessage: false,
            });

        case types.DELETE_INCIDENT_MESSAGE_REQUEST:
            return Object.assign({}, state, {
                incidentMessages: {
                    ...state.incidentMessages,
                },
                deleteIncidentMessage: action.payload,
            });
        default:
            return state;
    }
}
