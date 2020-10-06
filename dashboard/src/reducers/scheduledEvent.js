import {
    FETCH_SCHEDULED_EVENTS_SUCCESS,
    FETCH_SCHEDULED_EVENTS_REQUEST,
    FETCH_SCHEDULED_EVENTS_FAILURE,
    CREATE_SCHEDULED_EVENT_SUCCESS,
    CREATE_SCHEDULED_EVENT_REQUEST,
    CREATE_SCHEDULED_EVENT_FAILURE,
    DELETE_SCHEDULED_EVENT_SUCCESS,
    DELETE_SCHEDULED_EVENT_REQUEST,
    DELETE_SCHEDULED_EVENT_FAILURE,
    UPDATE_SCHEDULED_EVENT_SUCCESS,
    UPDATE_SCHEDULED_EVENT_REQUEST,
    UPDATE_SCHEDULED_EVENT_FAILURE,
    FETCH_SCHEDULED_EVENT_SUCCESS,
    FETCH_SCHEDULED_EVENT_REQUEST,
    FETCH_SCHEDULED_EVENT_FAILURE,
    CREATE_SCHEDULED_EVENT_NOTE_REQUEST,
    CREATE_SCHEDULED_EVENT_NOTE_SUCCESS,
    CREATE_SCHEDULED_EVENT_NOTE_FAILURE,
    FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_REQUEST,
    FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_SUCCESS,
    FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_FAILURE,
    FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_REQUEST,
    FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_SUCCESS,
    FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_FAILURE,
    UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_REQUEST,
    UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_SUCCESS,
    UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_FAILURE,
    UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_REQUEST,
    UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_SUCCESS,
    UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_FAILURE,
    DELETE_SCHEDULED_EVENT_NOTE_REQUEST,
    DELETE_SCHEDULED_EVENT_NOTE_SUCCESS,
    DELETE_SCHEDULED_EVENT_NOTE_FAILURE,
    FETCH_ONGOING_SCHEDULED_EVENTS_FAILURE,
    FETCH_ONGOING_SCHEDULED_EVENTS_REQUEST,
    FETCH_ONGOING_SCHEDULED_EVENTS_SUCCESS,
    FETCH_SUBPROJECT_SCHEDULED_EVENTS_FAILURE,
    FETCH_SUBPROJECT_SCHEDULED_EVENTS_REQUEST,
    FETCH_SUBPROJECT_SCHEDULED_EVENTS_SUCCESS,
    FETCH_SUBPROJECT_ONGOING_SCHEDULED_EVENTS_FAILURE,
    FETCH_SUBPROJECT_ONGOING_SCHEDULED_EVENTS_REQUEST,
    FETCH_SUBPROJECT_ONGOING_SCHEDULED_EVENTS_SUCCESS,
    RESOLVE_SCHEDULED_EVENT_FAILURE,
    RESOLVE_SCHEDULED_EVENT_REQUEST,
    RESOLVE_SCHEDULED_EVENT_SUCCESS,
} from '../constants/scheduledEvent';
import moment from 'moment';

const INITIAL_STATE = {
    scheduledEventList: {
        scheduledEvents: [],
        error: null,
        requesting: false,
        success: false,
        skip: null,
        limit: null,
        count: null,
    },
    subProjectScheduledEventList: {
        requesting: false,
        success: false,
        error: null,
        scheduledEvents: [],
    },
    newScheduledEvent: {
        scheduledEvent: null,
        error: null,
        requesting: false,
        success: false,
    },
    deletedScheduledEvent: {
        error: null,
        requesting: false,
        success: false,
    },
    updatedScheduledEvent: {
        scheduledEvent: null,
        error: null,
        requesting: false,
        success: false,
    },
    scheduledEventInvestigationList: {
        error: null,
        requesting: false,
        success: false,
        skip: null,
        limit: null,
        count: null,
        scheduledEventNotes: [],
    },
    scheduledEventInternalList: {
        error: null,
        requesting: false,
        success: false,
        skip: null,
        limit: null,
        count: null,
        scheduledEventNotes: [],
    },
    newScheduledEventNote: {
        scheduledEventNote: null,
        requesting: false,
        success: false,
        error: null,
    },
    updateScheduledEventNoteInternal: {
        requesting: false,
        success: false,
        error: null,
        scheduledEventNote: null,
    },
    updateScheduledEventNoteInvestigation: {
        requesting: false,
        success: false,
        error: null,
        scheduledEventNote: null,
    },
    deleteScheduledEventNote: {
        requesting: false,
        success: false,
        error: null,
    },
    ongoingScheduledEvent: {
        requesting: false,
        success: false,
        error: null,
        events: [],
        count: 0,
    },
    subProjectOngoingScheduledEvent: {
        requesting: false,
        success: false,
        error: null,
        events: [],
    },
    resolveScheduledEvent: {
        requesting: false,
        success: false,
        error: null,
    },
};

export default function scheduledEvent(state = INITIAL_STATE, action) {
    switch (action.type) {
        case CREATE_SCHEDULED_EVENT_SUCCESS: {
            let existingPayload = false;
            let existingOngoingEvent = false;
            const currentDate = moment().format();
            const startDate = moment(action.payload.startDate).format();
            const endDate = moment(action.payload.endDate).format();
            state.scheduledEventList.scheduledEvents.map(event => {
                if (String(event._id) === String(action.payload._id)) {
                    existingPayload = true;
                }
                return event;
            });

            const eventPayload = existingPayload ? [] : [action.payload];

            let events = [...state.subProjectOngoingScheduledEvent.events];

            state.subProjectOngoingScheduledEvent.events.forEach(eventData => {
                if (
                    String(eventData.project) ===
                    String(action.payload.projectId._id)
                ) {
                    eventData.ongoingScheduledEvents.forEach(event => {
                        if (String(event._id) === String(action.payload._id)) {
                            existingOngoingEvent = true;
                        }
                    });
                }
            });

            if (!existingOngoingEvent) {
                if (startDate <= currentDate && endDate > currentDate) {
                    events = state.subProjectOngoingScheduledEvent.events.map(
                        eventData => {
                            if (
                                String(eventData.project) ===
                                String(action.payload.projectId._id)
                            ) {
                                eventData.ongoingScheduledEvents = [
                                    action.payload,
                                    ...eventData.ongoingScheduledEvents,
                                ];
                                eventData.count =
                                    eventData.ongoingScheduledEvents.length;
                            }
                            return eventData;
                        }
                    );
                }
            }

            const scheduledEvents = state.subProjectScheduledEventList.scheduledEvents.map(
                event => {
                    if (
                        String(event.project) ===
                        String(action.payload.projectId._id)
                    ) {
                        const existingEvent = event.scheduledEvents.find(
                            event =>
                                String(event._id) === String(action.payload._id)
                        );
                        if (!existingEvent) {
                            event.scheduledEvents = [
                                action.payload,
                                ...event.scheduledEvents,
                            ];
                            event.count = event.count + 1;
                        }
                    }
                    return event;
                }
            );

            return Object.assign({}, state, {
                newScheduledEvent: {
                    requesting: false,
                    error: null,
                    success: true,
                    scheduledEvent: action.payload,
                },
                scheduledEventList: {
                    ...state.scheduledEventList,
                    scheduledEvents: [
                        ...eventPayload,
                        ...state.scheduledEventList.scheduledEvents,
                    ],
                    count: state.scheduledEventList.count + 1,
                },
                subProjectScheduledEventList: {
                    ...state.subProjectScheduledEventList,
                    scheduledEvents,
                },
                subProjectOngoingScheduledEvent: {
                    ...state.subProjectOngoingScheduledEvent,
                    events,
                },
            });
        }
        case CREATE_SCHEDULED_EVENT_FAILURE:
            return Object.assign({}, state, {
                ...state,
                newScheduledEvent: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                    scheduledEvent: state.newScheduledEvent.scheduledEvent,
                },
            });
        case CREATE_SCHEDULED_EVENT_REQUEST:
            return Object.assign({}, state, {
                ...state,
                newScheduledEvent: {
                    requesting: true,
                    error: null,
                    success: false,
                    scheduledEvent: state.newScheduledEvent.scheduledEvent,
                },
            });

        case FETCH_SCHEDULED_EVENTS_SUCCESS: {
            const scheduledEvents = state.subProjectScheduledEventList.scheduledEvents.map(
                event => {
                    if (
                        action.payload.data.length > 0 &&
                        String(event.project) ===
                            String(action.payload.data[0].projectId._id)
                    ) {
                        event.scheduledEvents = action.payload.data;
                        event.skip = action.payload.skip;
                    }

                    return event;
                }
            );
            return Object.assign({}, state, {
                ...state,
                scheduledEventList: {
                    requesting: false,
                    error: null,
                    success: true,
                    scheduledEvents: action.payload.data,
                    count: action.payload.count,
                    limit: action.payload.limit,
                    skip: action.payload.skip,
                },
                subProjectScheduledEventList: {
                    ...state.subProjectScheduledEventList,
                    scheduledEvents,
                },
            });
        }
        case FETCH_SCHEDULED_EVENTS_FAILURE:
            return Object.assign({}, state, {
                ...state,
                scheduledEventList: {
                    ...state.scheduledEventList,
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case FETCH_SCHEDULED_EVENTS_REQUEST:
            return Object.assign({}, state, {
                ...state,
                scheduledEventList: {
                    ...state.scheduledEventList,
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case FETCH_SUBPROJECT_SCHEDULED_EVENTS_REQUEST:
            return {
                ...state,
                subProjectScheduledEventList: {
                    ...state.subProjectScheduledEventList,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case FETCH_SUBPROJECT_SCHEDULED_EVENTS_SUCCESS:
            return {
                ...state,
                subProjectScheduledEventList: {
                    requesting: false,
                    success: true,
                    error: null,
                    scheduledEvents: action.payload,
                },
            };

        case FETCH_SUBPROJECT_SCHEDULED_EVENTS_FAILURE:
            return {
                ...state,
                subProjectScheduledEventList: {
                    ...state.subProjectScheduledEventList,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case FETCH_ONGOING_SCHEDULED_EVENTS_REQUEST:
            return {
                ...state,
                ongoingScheduledEvent: {
                    ...state.ongoingScheduledEvent,
                    requesting: true,
                    error: null,
                    success: false,
                },
            };

        case FETCH_ONGOING_SCHEDULED_EVENTS_SUCCESS:
            return {
                ...state,
                ongoingScheduledEvent: {
                    requesting: false,
                    success: true,
                    error: null,
                    events: action.payload.data,
                    count: action.payload.count,
                },
            };

        case FETCH_ONGOING_SCHEDULED_EVENTS_FAILURE:
            return {
                ...state,
                ongoingScheduledEvent: {
                    ...state.ongoingScheduledEvent,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case FETCH_SUBPROJECT_ONGOING_SCHEDULED_EVENTS_REQUEST:
            return {
                ...state,
                subProjectOngoingScheduledEvent: {
                    ...state.subProjectOngoingScheduledEvent,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case FETCH_SUBPROJECT_ONGOING_SCHEDULED_EVENTS_SUCCESS:
            return {
                ...state,
                subProjectOngoingScheduledEvent: {
                    requesting: false,
                    success: true,
                    error: null,
                    events: action.payload,
                },
            };

        case FETCH_SUBPROJECT_ONGOING_SCHEDULED_EVENTS_FAILURE:
            return {
                ...state,
                subProjectOngoingScheduledEvent: {
                    ...state.subProjectOngoingScheduledEvent,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case FETCH_SCHEDULED_EVENT_SUCCESS:
            return {
                ...state,
                newScheduledEvent: {
                    requesting: false,
                    error: null,
                    success: true,
                    scheduledEvent: action.payload,
                },
            };

        case FETCH_SCHEDULED_EVENT_REQUEST:
            return {
                ...state,
                newScheduledEvent: {
                    ...state.newScheduledEvent,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case FETCH_SCHEDULED_EVENT_FAILURE:
            return {
                ...state,
                newScheduledEvent: {
                    ...state.newScheduledEvent,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case DELETE_SCHEDULED_EVENT_SUCCESS: {
            let deleted = true;

            const scheduledEvents = state.subProjectScheduledEventList.scheduledEvents.map(
                subEvent => {
                    if (
                        String(subEvent.project) ===
                        String(action.payload.projectId)
                    ) {
                        subEvent.scheduledEvents = subEvent.scheduledEvents.filter(
                            event => {
                                if (
                                    String(event._id) ===
                                    String(action.payload._id)
                                ) {
                                    deleted = false;
                                }

                                return (
                                    String(event._id) !==
                                    String(action.payload._id)
                                );
                            }
                        );
                        subEvent.count = deleted
                            ? subEvent.count
                            : subEvent.count - 1;
                    }
                    return subEvent;
                }
            );

            const events = state.subProjectOngoingScheduledEvent.events.map(
                eventData => {
                    if (
                        String(eventData.project) ===
                        String(action.payload.projectId)
                    ) {
                        eventData.ongoingScheduledEvents = eventData.ongoingScheduledEvents.filter(
                            event =>
                                String(event._id) !== String(action.payload._id)
                        );
                        eventData.count =
                            eventData.ongoingScheduledEvents.length;
                    }
                    return eventData;
                }
            );

            return Object.assign({}, state, {
                ...state,
                scheduledEventList: {
                    ...state.scheduledEventList,
                    scheduledEvents: state.scheduledEventList.scheduledEvents.filter(
                        scheduledEvent => {
                            if (
                                String(scheduledEvent._id) ===
                                String(action.payload._id)
                            ) {
                                deleted = false;
                            }
                            return (
                                String(scheduledEvent._id) !==
                                String(action.payload._id)
                            );
                        }
                    ),
                    count: deleted
                        ? state.scheduledEventList.count
                        : state.scheduledEventList.count - 1,
                },
                deletedScheduledEvent: {
                    requesting: false,
                    success: true,
                    error: false,
                },
                subProjectScheduledEventList: {
                    ...state.subProjectScheduledEventList,
                    scheduledEvents,
                },
                subProjectOngoingScheduledEvent: {
                    ...state.subProjectOngoingScheduledEvent,
                    events,
                },
            });
        }

        case DELETE_SCHEDULED_EVENT_FAILURE:
            return Object.assign({}, state, {
                ...state,
                deletedScheduledEvent: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case DELETE_SCHEDULED_EVENT_REQUEST:
            return Object.assign({}, state, {
                ...state,
                deletedScheduledEvent: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case UPDATE_SCHEDULED_EVENT_SUCCESS: {
            const currentDate = moment().format();
            const startDate = moment(action.payload.startDate).format();
            const endDate = moment(action.payload.endDate).format();
            const scheduledEvents = state.scheduledEventList.scheduledEvents.map(
                scheduledEvent => {
                    if (
                        String(action.payload._id) ===
                        String(scheduledEvent._id)
                    ) {
                        return action.payload;
                    }
                    return scheduledEvent;
                }
            );
            const subEvents = state.subProjectScheduledEventList.scheduledEvents.map(
                subEvent => {
                    if (
                        String(subEvent.project) ===
                        String(action.payload.projectId._id)
                    ) {
                        subEvent.scheduledEvents = subEvent.scheduledEvents.map(
                            event => {
                                if (
                                    String(event._id) ===
                                    String(action.payload._id)
                                ) {
                                    event = action.payload;
                                }
                                return event;
                            }
                        );
                    }
                    return subEvent;
                }
            );

            const events = state.subProjectOngoingScheduledEvent.events.map(
                eventData => {
                    if (
                        String(eventData.project) ===
                        String(action.payload.projectId._id)
                    ) {
                        eventData.ongoingScheduledEvents = eventData.ongoingScheduledEvents.filter(
                            event => {
                                return (
                                    String(event._id) !==
                                    String(action.payload._id)
                                );
                            }
                        );
                        if (startDate <= currentDate && endDate > currentDate) {
                            eventData.ongoingScheduledEvents = [
                                action.payload,
                                ...eventData.ongoingScheduledEvents,
                            ];
                        }
                        eventData.count =
                            eventData.ongoingScheduledEvents.length;
                    }

                    return eventData;
                }
            );

            return Object.assign({}, state, {
                updatedScheduledEvent: {
                    requesting: false,
                    error: null,
                    success: true,
                    scheduledEvent: action.payload,
                },
                newScheduledEvent: {
                    requesting: false,
                    error: null,
                    success: true,
                    scheduledEvent: action.payload,
                },
                scheduledEventList: {
                    ...state.scheduledEventList,
                    scheduledEvents,
                },
                subProjectScheduledEventList: {
                    ...state.subProjectScheduledEventList,
                    scheduledEvents: subEvents,
                },
                subProjectOngoingScheduledEvent: {
                    ...state.subProjectOngoingScheduledEvent,
                    events,
                },
            });
        }

        case UPDATE_SCHEDULED_EVENT_FAILURE:
            return Object.assign({}, state, {
                ...state,
                updatedScheduledEvent: {
                    ...state.updatedScheduledEvent,
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_SCHEDULED_EVENT_REQUEST:
            return Object.assign({}, state, {
                ...state,
                updatedScheduledEvent: {
                    ...state.updatedScheduledEvent,
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case CREATE_SCHEDULED_EVENT_NOTE_REQUEST:
            return {
                ...state,
                newScheduledEventNote: {
                    ...state.newScheduledEventNote,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case CREATE_SCHEDULED_EVENT_NOTE_SUCCESS: {
            let scheduledEventInternalList = {
                ...state.scheduledEventInternalList,
            };
            let scheduledEventInvestigationList = {
                ...state.scheduledEventInvestigationList,
            };

            let existingPayload = false;
            if (action.payload.type === 'internal') {
                scheduledEventInternalList.scheduledEventNotes.map(note => {
                    if (String(note._id) === String(action.payload._id)) {
                        existingPayload = true;
                    }
                    return note;
                });
                const notePayload = existingPayload ? [] : [action.payload];
                scheduledEventInternalList = {
                    ...scheduledEventInternalList,
                    scheduledEventNotes: [
                        ...notePayload,
                        ...scheduledEventInternalList.scheduledEventNotes,
                    ],
                    count: existingPayload
                        ? scheduledEventInternalList.count
                        : scheduledEventInternalList.count + 1,
                };
            }

            if (action.payload.type === 'investigation') {
                scheduledEventInvestigationList.scheduledEventNotes.map(
                    note => {
                        if (String(note._id) === String(action.payload._id)) {
                            existingPayload = true;
                        }
                        return note;
                    }
                );
                const notePayload = existingPayload ? [] : [action.payload];
                scheduledEventInvestigationList = {
                    ...scheduledEventInvestigationList,
                    scheduledEventNotes: [
                        ...notePayload,
                        ...scheduledEventInvestigationList.scheduledEventNotes,
                    ],
                    count: existingPayload
                        ? scheduledEventInvestigationList.count
                        : scheduledEventInvestigationList.count + 1,
                };
            }

            return {
                ...state,
                newScheduledEventNote: {
                    requesting: false,
                    success: true,
                    error: null,
                    scheduledEventNotes: action.payload,
                },
                scheduledEventInternalList,
                scheduledEventInvestigationList,
            };
        }

        case CREATE_SCHEDULED_EVENT_NOTE_FAILURE:
            return {
                ...state,
                newScheduledEventNote: {
                    ...state.newScheduledEventNote,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_REQUEST:
            return {
                ...state,
                updateScheduledEventNoteInvestigation: {
                    ...state.updateScheduledEventNoteInvestigation,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_SUCCESS: {
            const scheduledEventNotes = state.scheduledEventInvestigationList.scheduledEventNotes.map(
                investigationNote => {
                    if (
                        String(investigationNote._id) ===
                        String(action.payload._id)
                    ) {
                        return action.payload;
                    }

                    return investigationNote;
                }
            );

            return {
                ...state,
                updateScheduledEventNoteInvestigation: {
                    requesting: false,
                    success: true,
                    error: null,
                    scheduledEventNote: action.payload,
                },
                scheduledEventInvestigationList: {
                    ...state.scheduledEventInvestigationList,
                    scheduledEventNotes,
                },
            };
        }

        case UPDATE_SCHEDULED_EVENT_NOTE_INVESTIGATION_FAILURE:
            return {
                ...state,
                updateScheduledEventNoteInvestigation: {
                    ...state.updateScheduledEventNoteInvestigation,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_REQUEST:
            return {
                ...state,
                updateScheduledEventNoteInternal: {
                    ...state.updateScheduledEventNoteInternal,
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_SUCCESS: {
            const scheduledEventNotes = state.scheduledEventInternalList.scheduledEventNotes.map(
                internalNote => {
                    if (
                        String(internalNote._id) === String(action.payload._id)
                    ) {
                        return action.payload;
                    }

                    return internalNote;
                }
            );
            return {
                ...state,
                updateScheduledEventNoteInternal: {
                    requesting: false,
                    success: true,
                    error: null,
                    scheduledEventNote: action.payload,
                },
                scheduledEventInternalList: {
                    ...state.scheduledEventInternalList,
                    scheduledEventNotes,
                },
            };
        }

        case UPDATE_SCHEDULED_EVENT_NOTE_INTERNAL_FAILURE:
            return {
                ...state,
                updateScheduledEventNoteInternal: {
                    ...state.updateScheduledEventNoteInternal,
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case DELETE_SCHEDULED_EVENT_NOTE_REQUEST:
            return {
                ...state,
                deleteScheduledEventNote: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case DELETE_SCHEDULED_EVENT_NOTE_SUCCESS: {
            let scheduledEventInternalList = {
                ...state.scheduledEventInternalList,
            };
            let scheduledEventInvestigationList = {
                ...state.scheduledEventInvestigationList,
            };

            let deleted = true;
            if (action.payload.type === 'internal') {
                scheduledEventInternalList = {
                    ...scheduledEventInternalList,
                    scheduledEventNotes: scheduledEventInternalList.scheduledEventNotes.filter(
                        internalNote => {
                            if (
                                String(internalNote._id) ===
                                String(action.payload._id)
                            ) {
                                deleted = false;
                            }
                            return (
                                String(internalNote._id) !==
                                String(action.payload._id)
                            );
                        }
                    ),
                    count: deleted
                        ? scheduledEventInternalList.count
                        : scheduledEventInternalList.count - 1,
                };
            }

            if (action.payload.type === 'investigation') {
                scheduledEventInvestigationList = {
                    ...scheduledEventInvestigationList,
                    scheduledEventNotes: scheduledEventInvestigationList.scheduledEventNotes.filter(
                        investigationNote => {
                            if (
                                String(investigationNote._id) ===
                                String(action.payload._id)
                            ) {
                                deleted = false;
                            }
                            return (
                                String(investigationNote._id) !==
                                String(action.payload._id)
                            );
                        }
                    ),
                    count: deleted
                        ? scheduledEventInvestigationList.count
                        : scheduledEventInvestigationList.count - 1,
                };
            }

            return {
                ...state,
                deleteScheduledEventNote: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                scheduledEventInternalList,
                scheduledEventInvestigationList,
            };
        }

        case DELETE_SCHEDULED_EVENT_NOTE_FAILURE:
            return {
                ...state,
                deleteScheduledEventNote: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        case FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_REQUEST:
            return {
                ...state,
                scheduledEventInvestigationList: {
                    ...state.scheduledEventInvestigationList,
                    error: null,
                    requesting: true,
                    success: false,
                },
            };

        case FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_SUCCESS:
            return {
                ...state,
                scheduledEventInvestigationList: {
                    error: null,
                    requesting: false,
                    success: true,
                    skip: action.payload.skip,
                    limit: action.payload.limit,
                    count: action.payload.count,
                    scheduledEventNotes: action.payload.data,
                },
            };

        case FETCH_SCHEDULED_EVENT_NOTES_INVESTIGATION_FAILURE:
            return {
                ...state,
                scheduledEventInvestigationList: {
                    ...state.scheduledEventInvestigationList,
                    error: action.payload,
                    requesting: false,
                    success: false,
                },
            };

        case FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_REQUEST:
            return {
                ...state,
                scheduledEventInternalList: {
                    ...state.scheduledEventInternalList,
                    error: null,
                    requesting: true,
                    success: false,
                },
            };

        case FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_SUCCESS:
            return {
                ...state,
                scheduledEventInternalList: {
                    error: null,
                    requesting: false,
                    success: true,
                    skip: action.payload.skip,
                    limit: action.payload.limit,
                    count: action.payload.count,
                    scheduledEventNotes: action.payload.data,
                },
            };

        case FETCH_SCHEDULED_EVENT_NOTES_INTERNAL_FAILURE:
            return {
                ...state,
                scheduledEventInternalList: {
                    ...state.scheduledEventInternalList,
                    error: action.payload,
                    requesting: false,
                    success: false,
                },
            };

        case RESOLVE_SCHEDULED_EVENT_REQUEST:
            return {
                ...state,
                resolveScheduledEvent: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            };

        case RESOLVE_SCHEDULED_EVENT_SUCCESS:
            return {
                ...state,
                resolveScheduledEvent: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                newScheduledEvent: {
                    ...state.newScheduledEvent,
                    scheduledEvent: action.payload,
                },
            };

        case RESOLVE_SCHEDULED_EVENT_FAILURE:
            return {
                ...state,
                resolveScheduledEvent: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            };

        default:
            return state;
    }
}
