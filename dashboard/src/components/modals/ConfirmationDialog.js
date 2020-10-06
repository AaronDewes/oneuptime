import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PropTypes } from 'prop-types';
import { openModal, closeModal } from '../../actions/modal';
import DataPathHoC from '../DataPathHoC';
import SubProjectApiKey from './SubProjectApiKey';

class ConfirmationDialog extends Component {
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyBoard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyBoard);
    }
    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return document.getElementById('cancelResetKey').click();
            case 'Enter':
                return document.getElementById('confirmResetKey').click();
            default:
                return false;
        }
    };
    render() {
        const {
            data: {
                ConfirmationDialogId,
                SubProjectModalId,
                subProjectTitle,
                subProjectId,
                confirm,
            },
            openModal,
            closeModal,
        } = this.props;

        return (
            <div
                onKeyDown={this.handleKeyBoard}
                className="ModalLayer-wash Box-root Flex-flex Flex-alignItems--flexStart Flex-justifyContent--center"
            >
                <div
                    className="ModalLayer-contents"
                    tabIndex={-1}
                    style={{ marginTop: 40 }}
                >
                    <div className="bs-BIM">
                        <div className="bs-Modal bs-Modal--medium">
                            <div className="bs-Modal-header">
                                <div className="bs-Modal-header-copy">
                                    <span
                                        className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap"
                                        id="modalTitle"
                                    >
                                        Confirm API Reset
                                    </span>
                                </div>
                            </div>
                            <div className="bs-Modal-content">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    Resetting the API Key will break all your
                                    existing integrations with the API. Are you
                                    sure you want to continue?
                                </span>
                            </div>
                            <div className="bs-Modal-footer">
                                <div className="bs-Modal-footer-actions">
                                    <button
                                        id="cancelResetKey"
                                        className="bs-Button bs-DeprecatedButton bs-Button--grey btn__modal"
                                        type="button"
                                        onClick={() => {
                                            closeModal({
                                                id: ConfirmationDialogId,
                                            });
                                            return openModal({
                                                id: SubProjectModalId,
                                                content: DataPathHoC(
                                                    SubProjectApiKey,
                                                    {
                                                        subProjectModalId: SubProjectModalId,
                                                        subProjectId,
                                                        subProjectTitle,
                                                    }
                                                ),
                                            });
                                        }}
                                    >
                                        <span>Cancel</span>
                                        <span className="cancel-btn__keycode">
                                            Esc
                                        </span>
                                    </button>
                                    <button
                                        id="confirmResetKey"
                                        className="bs-Button bs-DeprecatedButton bs-Button--blue btn__modal"
                                        type="button"
                                        onClick={() => {
                                            confirm();
                                            closeModal({
                                                id: ConfirmationDialogId,
                                            });
                                            return openModal({
                                                id: SubProjectModalId,
                                                content: DataPathHoC(
                                                    SubProjectApiKey,
                                                    {
                                                        subProjectModalId: SubProjectModalId,
                                                        subProjectId,
                                                        subProjectTitle,
                                                        subProjectResetToken: true,
                                                    }
                                                ),
                                            });
                                        }}
                                    >
                                        <span>OK</span>
                                        <span className="create-btn__keycode">
                                            <span className="keycode__icon keycode__icon--enter" />
                                        </span>
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

ConfirmationDialog.displayName = 'ConfirmationDialog';

ConfirmationDialog.propTypes = {
    data: PropTypes.shape({
        ConfirmationDialogId: PropTypes.string,
        SubProjectModalId: PropTypes.string,
        subProjectTitle: PropTypes.string,
        subProjectId: PropTypes.string,
        confirm: PropTypes.func,
    }),
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ openModal, closeModal }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmationDialog);
