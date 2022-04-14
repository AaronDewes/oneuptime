import React, { Component } from 'react';

import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { FormLoader } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { blockUser } from '../../actions/user';
import UserBlockModal from './UserBlockModal';
import { openModal, closeModal } from 'CommonUI/actions/modal';

export class UserBlockBox extends Component<ComponentProps>{
    public static displayName = '';
    public static propTypes = {};

    constructor(props: $TSFixMe) {
        super(props);
        this.state = { blockModalId: uuidv4() };
    }

    handleClick = () => {

        const { blockUser, userId } = this.props;

        const { blockModalId } = this.state;


        this.props.openModal({
            id: blockModalId,
            onConfirm: () => {
                return blockUser(userId);
            },
            content: UserBlockModal,
        });
    };

    handleKeyBoard = (e: $TSFixMe) => {
        switch (e.key) {
            case 'Escape':

                return this.props.closeModal({ id: this.state.blockModalId });
            default:
                return false;
        }
    };

    override render() {

        const { isRequesting } = this.props;

        return (
            <div
                onKeyDown={this.handleKeyBoard}
                className="Box-root Margin-bottom--12"
            >
                <div className="bs-ContentSection Card-root Card-shadow--medium">
                    <div className="Box-root">
                        <div className="bs-ContentSection-content Box-root Box-divider--surface-bottom-1 Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--16">
                            <div className="Box-root">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>Block This User</span>
                                </span>
                                <p>
                                    <span>
                                        Click the button to block this project.
                                    </span>
                                </p>
                            </div>
                            <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--0 Padding-vertical--12">
                                <span className="db-SettingsForm-footerMessage"></span>
                                <div>
                                    <button
                                        id="block"
                                        className="bs-Button bs-Button--red Box-background--red"
                                        disabled={isRequesting}
                                        onClick={this.handleClick}
                                    >
                                        <ShouldRender if={!isRequesting}>
                                            <span>Block</span>
                                        </ShouldRender>
                                        <ShouldRender if={isRequesting}>
                                            <FormLoader />
                                        </ShouldRender>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


UserBlockBox.displayName = 'UserBlockBox';

const mapDispatchToProps: Function = (dispatch: Dispatch) => bindActionCreators({ blockUser, openModal, closeModal }, dispatch);

const mapStateToProps: Function = (state: RootState) => {
    const userId = state.user.user.user ? state.user.user.user._id : null;

    return {
        userId,
        isRequesting:
            state.user &&
            state.user.blockUser &&
            state.user.blockUser.requesting,
    };
};


UserBlockBox.propTypes = {
    isRequesting: PropTypes.oneOf([null, undefined, true, false]),
    blockUser: PropTypes.func.isRequired,
    closeModal: PropTypes.func,
    openModal: PropTypes.func.isRequired,
    userId: PropTypes.string,
};


UserBlockBox.contextTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(UserBlockBox);
