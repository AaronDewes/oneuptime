import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormLoader } from '../basic/Loader';
import { deleteScheduledEventNote } from '../../actions/scheduledEvent';
import { closeModal } from '../../actions/modal';

class DeleteNoteModal extends Component {
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyBoard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyBoard);
    }

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return this.props.closeThisDialog();
            case 'Enter':
                return !this.props.deletingNote && this.handleDeleteNote();
            default:
                return false;
        }
    };

    handleDeleteNote = () => {
        const {
            data: { projectId, scheduledEventId, scheduledEventNoteId },
            closeModal,
            deleteScheduledEventNote,
            modalId,
            deleteError,
        } = this.props;

        deleteScheduledEventNote(
            projectId,
            scheduledEventId,
            scheduledEventNoteId
        ).then(() => {
            if (!deleteError) {
                return closeModal({ id: modalId });
            }
        });
    };

    render() {
        const { deletingNote } = this.props;

        return (
            <div className="ModalLayer-wash Box-root Flex-flex Flex-alignItems--flexStart Flex-justifyContent--center">
                <div
                    className="ModalLayer-contents"
                    tabIndex={-1}
                    style={{ marginTop: 40 }}
                >
                    <div className="bs-BIM">
                        <div className="bs-Modal bs-Modal--medium">
                            <div className="bs-Modal-header">
                                <div className="bs-Modal-header-copy">
                                    <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                        <span>Confirm Deletion</span>
                                    </span>
                                </div>
                            </div>
                            <div className="bs-Modal-content">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    Are you sure you want to delete this note ?
                                </span>
                            </div>
                            <div className="bs-Modal-footer">
                                <div className="bs-Modal-footer-actions">
                                    <button
                                        className="bs-Button bs-DeprecatedButton bs-Button--grey btn__modal"
                                        type="button"
                                        onClick={this.props.closeThisDialog}
                                        disabled={deletingNote}
                                    >
                                        <span>Cancel</span>
                                        <span className="cancel-btn__keycode">
                                            Esc
                                        </span>
                                    </button>
                                    <button
                                        id="deleteNote"
                                        className="bs-Button bs-DeprecatedButton bs-Button--red btn__modal"
                                        type="button"
                                        onClick={this.handleDeleteNote}
                                        disabled={deletingNote}
                                        autoFocus={true}
                                    >
                                        {!deletingNote && (
                                            <>
                                                <span>Delete</span>
                                                <span className="delete-btn__keycode">
                                                    <span className="keycode__icon keycode__icon--enter" />
                                                </span>
                                            </>
                                        )}
                                        {deletingNote && <FormLoader />}
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

DeleteNoteModal.displayName = 'DeleteNoteModal';

DeleteNoteModal.propTypes = {
    closeThisDialog: PropTypes.func.isRequired,
    data: PropTypes.object,
    deletingNote: PropTypes.bool,
    deleteScheduledEventNote: PropTypes.func,
    deleteError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    closeModal: PropTypes.func,
    modalId: PropTypes.string,
};

const mapStateToProps = state => {
    return {
        deletingNote: state.scheduledEvent.deleteScheduledEventNote.requesting,
        deleteError: state.scheduledEvent.deleteScheduledEventNote.error,
        modalId: state.modal.modals[0].id,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators({ deleteScheduledEventNote, closeModal }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DeleteNoteModal);
