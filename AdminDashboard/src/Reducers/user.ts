import {
    FETCH_USERS_REQUEST,
    FETCH_USERS_SUCCESS,
    FETCH_USERS_FAILURE,
    FETCH_USERS_RESET,
    FETCH_USER_REQUEST,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILURE,
    FETCH_USER_RESET,
    ADD_USER_REQUEST,
    ADD_USER_SUCCESS,
    ADD_USER_FAILURE,
    ADD_USER_RESET,
    UPDATE_USER_SETTING_REQUEST,
    UPDATE_USER_SETTING_SUCCESS,
    UPDATE_USER_SETTING_FAILURE,
    UPDATE_USER_SETTING_RESET,
    DELETE_USER_FAILED,
    DELETE_USER_REQUEST,
    DELETE_USER_RESET,
    DELETE_USER_SUCCESS,
    RESTORE_USER_FAILED,
    RESTORE_USER_REQUEST,
    RESTORE_USER_RESET,
    RESTORE_USER_SUCCESS,
    BLOCK_USER_FAILED,
    BLOCK_USER_REQUEST,
    BLOCK_USER_RESET,
    BLOCK_USER_SUCCESS,
    UNBLOCK_USER_FAILED,
    UNBLOCK_USER_REQUEST,
    UNBLOCK_USER_RESET,
    UNBLOCK_USER_SUCCESS,
    ADD_USER_NOTE_REQUEST,
    ADD_USER_NOTE_RESET,
    ADD_USER_NOTE_SUCCESS,
    ADD_USER_NOTE_FAILURE,
    SEARCH_USERS_REQUEST,
    SEARCH_USERS_RESET,
    SEARCH_USERS_SUCCESS,
    SEARCH_USERS_FAILURE,
    UPDATE_TWO_FACTOR_AUTH_REQUEST,
    UPDATE_TWO_FACTOR_AUTH_SUCCESS,
    UPDATE_TWO_FACTOR_AUTH_FAILURE,
    SET_TWO_FACTOR_AUTH,
    FETCH_USER_LOGIN_HISTORY_FAILURE,
    FETCH_USER_LOGIN_HISTORY_SUCCESS,
    FETCH_USER_LOGIN_HISTORY_REQUEST,
    ENABLE_ADMIN_MODE_SUCCESS,
    ENABLE_ADMIN_MODE_REQUEST,
    ENABLE_ADMIN_MODE_FAILED,
    ENABLE_ADMIN_MODE_RESET,
    DISABLE_ADMIN_MODE_SUCCESS,
    DISABLE_ADMIN_MODE_REQUEST,
    DISABLE_ADMIN_MODE_FAILED,
    DISABLE_ADMIN_MODE_RESET,
} from '../constants/user';

import Action from 'CommonUI/src/types/action';

const INITIAL_STATE: $TSFixMe = {
    users: {
        error: null,
        requesting: false,
        success: false,
        users: [],
        count: null,
        limit: null,
        skip: null,
    },
    user: {
        error: null,
        requesting: false,
        success: false,
        user: null,
    },
    addUser: {
        error: null,
        requesting: false,
        success: false,
    },
    userSetting: {
        error: null,
        requesting: false,
        success: false,
        data: {},
    },
    deleteUser: {
        error: null,
        requesting: false,
        success: false,
    },
    restoreUser: {
        error: null,
        requesting: false,
        success: false,
    },
    blockUser: {
        error: null,
        requesting: false,
        success: false,
    },
    enableAdminMode: {
        error: null,
        requesting: false,
        success: false,
    },
    unblockUser: {
        error: null,
        requesting: false,
        success: false,
    },
    newUserNote: {
        requesting: false,
        error: null,
        success: false,
    },
    searchUsers: {
        requesting: false,
        error: null,
        success: false,
    },
    twoFactorAuthSetting: {
        error: null,
        requesting: false,
        success: false,
        data: {},
    },
    loginHistory: {
        error: null,
        requesting: false,
        success: false,
        history: {},
        limit: null,
        skip: null,
    },
};

export default function user(state = INITIAL_STATE, action: Action): void {
    switch (action.type) {
        // fetch users list
        case FETCH_USERS_REQUEST:
            return Object.assign({}, state, {
                users: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case FETCH_USERS_SUCCESS:
            return Object.assign({}, state, {
                users: {
                    requesting: false,
                    error: null,
                    success: true,
                    users: action.payload.data,
                    count: action.payload.count,
                    limit: action.payload.limit,
                    skip: action.payload.skip,
                },
            });

        case FETCH_USERS_FAILURE:
            return Object.assign({}, state, {
                users: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case FETCH_USERS_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        // fetch a user
        case FETCH_USER_REQUEST:
            return Object.assign({}, state, {
                user: {
                    requesting: true,
                    error: null,
                    success: false,
                    user: state.user.user,
                },
            });

        case FETCH_USER_SUCCESS:
            return Object.assign({}, state, {
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
            });

        case FETCH_USER_FAILURE:
            return Object.assign({}, state, {
                user: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                    user: state.user.user,
                },
            });

        case FETCH_USER_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        case ADD_USER_SUCCESS:
            return Object.assign({}, state, {
                users: {
                    ...state.users,
                    users:
                        state.users.users && state.users.users.length < 10
                            ? [action.payload, ...state.users.users]
                            : [
                                  action.payload,
                                  ...state.users.users.slice(0, -1),
                              ],

                    count: state.users.count + 1,
                },
                addUser: {
                    error: null,
                    requesting: false,
                    success: true,
                },
            });

        case ADD_USER_REQUEST:
            return Object.assign({}, state, {
                addUser: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case ADD_USER_FAILURE:
            return Object.assign({}, state, {
                addUser: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case ADD_USER_RESET:
            return Object.assign({}, state, {
                addUser: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });

        //update user setting
        case UPDATE_USER_SETTING_REQUEST:
            return Object.assign({}, state, {
                userSetting: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case UPDATE_USER_SETTING_SUCCESS:
            return Object.assign({}, state, {
                userSetting: {
                    requesting: false,
                    error: null,
                    success: true,
                    data: action.payload,
                },
                users: {
                    requesting: false,
                    error: null,
                    success: true,
                    users: state.users.users.map((user: $TSFixMe) => {
                        return user._id === action.payload._id
                            ? action.payload
                            : user;
                    }),
                    count: action.payload.count,
                    limit: action.payload.limit,
                    skip: action.payload.skip,
                },
            });

        case UPDATE_USER_SETTING_FAILURE:
            return Object.assign({}, state, {
                userSetting: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case UPDATE_USER_SETTING_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        case DELETE_USER_SUCCESS:
            return Object.assign({}, state, {
                deleteUser: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
            });

        case DELETE_USER_REQUEST:
            return Object.assign({}, state, {
                deleteUser: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case DELETE_USER_FAILED:
            return Object.assign({}, state, {
                deleteUser: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case DELETE_USER_RESET:
            return Object.assign({}, state, {
                deleteUser: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });

        case RESTORE_USER_SUCCESS:
            return Object.assign({}, state, {
                restoreUser: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
            });

        case RESTORE_USER_REQUEST:
            return Object.assign({}, state, {
                restoreUser: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case RESTORE_USER_FAILED:
            return Object.assign({}, state, {
                restoreUser: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case RESTORE_USER_RESET:
            return Object.assign({}, state, {
                restoreUser: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });

        case BLOCK_USER_SUCCESS:
            return Object.assign({}, state, {
                blockUser: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
            });

        case BLOCK_USER_REQUEST:
            return Object.assign({}, state, {
                blockUser: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case BLOCK_USER_FAILED:
            return Object.assign({}, state, {
                blockUser: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case BLOCK_USER_RESET:
            return Object.assign({}, state, {
                blockUser: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });

        case ENABLE_ADMIN_MODE_SUCCESS:
            return Object.assign({}, state, {
                enableAdminMode: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
            });

        case ENABLE_ADMIN_MODE_REQUEST:
            return Object.assign({}, state, {
                enableAdminMode: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case ENABLE_ADMIN_MODE_FAILED:
            return Object.assign({}, state, {
                enableAdminMode: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case ENABLE_ADMIN_MODE_RESET:
            return Object.assign({}, state, {
                enableAdminMode: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });

        case DISABLE_ADMIN_MODE_SUCCESS:
            return Object.assign({}, state, {
                disableAdminMode: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
            });

        case DISABLE_ADMIN_MODE_REQUEST:
            return Object.assign({}, state, {
                disableAdminMode: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case DISABLE_ADMIN_MODE_FAILED:
            return Object.assign({}, state, {
                disableAdminMode: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case DISABLE_ADMIN_MODE_RESET:
            return Object.assign({}, state, {
                disableAdminMode: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });

        case UNBLOCK_USER_SUCCESS:
            return Object.assign({}, state, {
                unblockUser: {
                    requesting: false,
                    success: true,
                    error: null,
                },
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
            });

        case UNBLOCK_USER_REQUEST:
            return Object.assign({}, state, {
                unblockUser: {
                    requesting: true,
                    success: false,
                    error: null,
                },
            });

        case UNBLOCK_USER_FAILED:
            return Object.assign({}, state, {
                unblockUser: {
                    requesting: false,
                    success: false,
                    error: action.payload,
                },
            });

        case UNBLOCK_USER_RESET:
            return Object.assign({}, state, {
                unblockUser: {
                    requesting: false,
                    success: false,
                    error: null,
                },
            });
        // add user admin notes
        case ADD_USER_NOTE_REQUEST:
            return Object.assign({}, state, {
                newUserNote: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case ADD_USER_NOTE_SUCCESS:
            return Object.assign({}, state, {
                users: {
                    requesting: false,
                    error: null,
                    success: true,
                    users: state.users.users.map((user: $TSFixMe) => {
                        if (user._id === action.payload._id) {
                            user = action.payload;
                        }
                        return user;
                    }),
                    count: state.users.count,
                    limit: state.users.limit,
                    skip: state.users.skip,
                },
                user: {
                    requesting: false,
                    error: null,
                    success: true,
                    user: action.payload,
                },
                newUserNote: {
                    requesting: false,
                    error: null,
                    success: true,
                },
            });

        case ADD_USER_NOTE_FAILURE:
            return Object.assign({}, state, {
                newUserNote: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case ADD_USER_NOTE_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        // search users list
        case SEARCH_USERS_REQUEST:
            return Object.assign({}, state, {
                searchUsers: {
                    requesting: true,
                    error: null,
                    success: false,
                },
            });

        case SEARCH_USERS_SUCCESS:
            return Object.assign({}, state, {
                users: {
                    requesting: false,
                    error: null,
                    success: true,
                    users: action.payload.data,
                    count: action.payload.count,
                    limit: action.payload.limit,
                    skip: action.payload.skip,
                },
                searchUsers: {
                    requesting: false,
                    error: null,
                    success: true,
                },
            });

        case SEARCH_USERS_FAILURE:
            return Object.assign({}, state, {
                searchUsers: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        case SEARCH_USERS_RESET:
            return Object.assign({}, state, {
                ...INITIAL_STATE,
            });

        //update user's two factor auth settings
        case UPDATE_TWO_FACTOR_AUTH_REQUEST:
            return Object.assign({}, state, {
                twoFactorAuthSetting: {
                    requesting: true,
                    error: null,
                    success: false,
                    data: state.twoFactorAuthSetting.data,
                },
            });

        case UPDATE_TWO_FACTOR_AUTH_SUCCESS:
            return Object.assign({}, state, {
                user: {
                    ...INITIAL_STATE.user,
                    user: action.payload,
                },
                twoFactorAuthSetting: {
                    requesting: false,
                    error: null,
                    success: false,
                    data: state.twoFactorAuthSetting.data,
                },
            });

        case UPDATE_TWO_FACTOR_AUTH_FAILURE:
            return Object.assign({}, state, {
                twoFactorAuthSetting: {
                    requesting: false,
                    error: action.payload,
                    success: false,
                    data: state.twoFactorAuthSetting.data,
                },
            });

        case SET_TWO_FACTOR_AUTH:
            return Object.assign({}, state, {
                user: {
                    ...state.user,
                    twoFactorAuthEnabled: action.payload,
                },
            });
        case FETCH_USER_LOGIN_HISTORY_REQUEST:
            return Object.assign({}, state, {
                loginHistory: {
                    ...state.loginHistory,
                    requesting: true,
                    error: null,
                    success: false,
                },
            });
        case FETCH_USER_LOGIN_HISTORY_SUCCESS:
            return Object.assign({}, state, {
                loginHistory: {
                    requesting: false,
                    error: null,
                    success: true,
                    history: action.payload,
                },
            });

        case FETCH_USER_LOGIN_HISTORY_FAILURE:
            return Object.assign({}, state, {
                loginHistory: {
                    ...state.loginHistory,
                    requesting: false,
                    error: action.payload,
                    success: false,
                },
            });

        default:
            return state;
    }
}
