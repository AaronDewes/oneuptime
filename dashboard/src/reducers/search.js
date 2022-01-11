import {
    POPULATE_SEARCH_SUCCESS,
    POPULATE_SEARCH_REQUEST,
    POPULATE_SEARCH_FAILURE,
    RESET_SEARCH_FIELDS,
    SHOW_SEARCH_BAR,
    CLOSE_SEARCH_BAR,
} from '../constants/search';

const initialState = {
    requesting: false,
    success: false,
    error: null,
    search: [],
    searchFieldVisible: false,
    searchFieldPosition: 0,
};

export default function search(state = initialState, action) {
    switch (action.type) {
        case SHOW_SEARCH_BAR:
            return Object.assign({}, state, {
                searchFieldVisible: true,
                searchFieldPosition: action.payload,
            });
        case CLOSE_SEARCH_BAR:
            return Object.assign({}, state, {
                searchFieldVisible: false,
            });
        case POPULATE_SEARCH_SUCCESS:
            return Object.assign({}, state, {
                search: action.payload,
                success: true,
                requesting: false,
                error: null,
            });
        case POPULATE_SEARCH_REQUEST:
            return Object.assign({}, state, {
                success: false,
                error: null,
                requesting: true,
            });
        case POPULATE_SEARCH_FAILURE:
            return Object.assign({}, state, {
                success: false,
                error: action.payload,
                requesting: false,
            });
        case RESET_SEARCH_FIELDS:
            return Object.assign({}, state, {
                search: [],
            });
        default:
            return state;
    }
}
