import { OPEN_MODAL, CLOSE_MODAL } from '../constants/modal';

import Action from 'CommonUI/src/types/action';

const initialState: $TSFixMe = {
    modals: [],
    feedbackModalVisble: false,
};

export default (state = initialState, action: Action): void => {
    switch (action.type) {
        case OPEN_MODAL:
            return Object.assign({}, state, {
                modals: state.modals.concat(action.payload),
            });

        case CLOSE_MODAL:
            return Object.assign({}, state, {
                modals: state.modals.filter(
                    item => item.id !== action.payload.id
                ),
            });

        default:
            return state;
    }
};
