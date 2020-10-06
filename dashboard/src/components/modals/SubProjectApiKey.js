import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuid from 'uuid';
import { FormLoader } from '../basic/Loader';
import { closeModal, openModal } from '../../actions/modal';
import {
    resetSubProjectToken,
    resetSubProjectKeyReset,
} from '../../actions/subProject';
import ShouldRender from '../basic/ShouldRender';
import DataPathHoC from '../DataPathHoC';
import ConfirmationDialog from './ConfirmationDialog';

class SubProjectApiKey extends Component {
    state = {
        hidden: true,
        confirmationModalId: uuid.v4(),
        oldApiKey: '',
    };

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyBoard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyBoard);
    }

    UNSAFE_componentWillReceiveProps() {
        const oldApiKey = this.props.subproject.apiKey;
        this.setState({ oldApiKey });
    }

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                this.props.resetSubProjectKeyReset();
                return this.props.closeThisDialog();
            case 'Enter':
                if (this.props.data.subProjectResetToken) {
                    this.props.resetSubProjectKeyReset();
                    return this.props.closeThisDialog();
                } else {
                    return document.getElementById('removeSubProject').click();
                }
            default:
                return false;
        }
    };

    resetSubProjectToken = () => {
        const { resetSubProjectToken, data } = this.props;
        resetSubProjectToken(data.subProjectId);
    };

    renderAPIKey = hidden => {
        const { subproject, subProjectResetToken } = this.props;
        return hidden && !subProjectResetToken.success ? (
            <span id="apiKey" className="value">
                Click here to reveal API key
            </span>
        ) : (
            <span
                id="apiKey"
                className={`value ${
                    subProjectResetToken.success ? 'Text-fontWeight--bold' : ''
                }`}
            >
                {subproject.apiKey}
            </span>
        );
    };

    render() {
        const {
            subProjectResetToken,
            closeModal,
            openModal,
            data,
            resetSubProjectKeyReset,
            subproject,
        } = this.props;
        const { hidden } = this.state;

        return (
            <div className="ModalLayer-wash Box-root Flex-flex Flex-alignItems--flexStart Flex-justifyContent--center">
                <div
                    className="ModalLayer-contents"
                    tabIndex={-1}
                    style={{ marginTop: 40 }}
                >
                    <div className="bs-BIM">
                        <div className="bs-Modal bs-Modal--large">
                            <div className="bs-Modal-header">
                                <div className="bs-Modal-header-copy">
                                    <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                        <span>
                                            API Key For Sub Project{' '}
                                            {data.subProjectTitle}
                                        </span>
                                    </span>
                                </div>
                                <div className="bs-Modal-messages">
                                    <ShouldRender
                                        if={subProjectResetToken.error}
                                    >
                                        <p className="bs-Modal-message">
                                            {subProjectResetToken.error}
                                        </p>
                                    </ShouldRender>
                                </div>
                            </div>
                            <div
                                className="bs-Modal-content Flex-flex Flex-direction--column"
                                style={{ textAlign: 'center' }}
                            >
                                <div className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-horizontal--8 Padding-vertical--2">
                                    <div>
                                        <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                            <fieldset className="bs-Fieldset">
                                                <div className="bs-Fieldset-rows">
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Project ID:
                                                        </label>
                                                        <div className="bs-Fieldset-fields Margin-top--6">
                                                            {subproject._id}
                                                        </div>
                                                    </div>
                                                    <ShouldRender
                                                        if={
                                                            subProjectResetToken.success
                                                        }
                                                    >
                                                        <div className="bs-Fieldset-row">
                                                            <label className="bs-Fieldset-label">
                                                                Old API Key:
                                                            </label>
                                                            <div className="bs-Fieldset-fields Margin-top--6">
                                                                {
                                                                    this.state
                                                                        .oldApiKey
                                                                }
                                                            </div>
                                                        </div>
                                                    </ShouldRender>
                                                    <div className="bs-Fieldset-row">
                                                        <ShouldRender
                                                            if={
                                                                !subProjectResetToken.success
                                                            }
                                                        >
                                                            <label className="bs-Fieldset-label">
                                                                API Key:
                                                            </label>
                                                        </ShouldRender>
                                                        <ShouldRender
                                                            if={
                                                                subProjectResetToken.success
                                                            }
                                                        >
                                                            <label className="bs-Fieldset-label">
                                                                New API Key:
                                                            </label>
                                                        </ShouldRender>

                                                        <div
                                                            className="bs-Fieldset-fields Margin-top--6 pointer"
                                                            onClick={() =>
                                                                this.setState(
                                                                    state => ({
                                                                        hidden: !state.hidden,
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            {this.renderAPIKey(
                                                                hidden
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bs-Modal-footer">
                                <div className="bs-Modal-footer-actions">
                                    {data.subProjectResetToken ? (
                                        <button
                                            className="bs-Button bs-DeprecatedButton bs-Button--grey btn__modal"
                                            type="button"
                                            onClick={() => {
                                                resetSubProjectKeyReset();
                                                return closeModal({
                                                    id: data.subProjectModalId,
                                                });
                                            }}
                                        >
                                            <span>Close</span>
                                            <span className="cancel-btn__keycode">
                                                Esc
                                            </span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="bs-Button bs-DeprecatedButton bs-Button--grey btn__modal"
                                                type="button"
                                                onClick={() => {
                                                    resetSubProjectKeyReset();
                                                    return closeModal({
                                                        id:
                                                            data.subProjectModalId,
                                                    });
                                                }}
                                            >
                                                <span>Cancel</span>
                                                <span className="cancel-btn__keycode">
                                                    Esc
                                                </span>
                                            </button>
                                            <button
                                                id="removeSubProject"
                                                className="bs-Button bs-DeprecatedButton bs-Button--red btn__modal"
                                                type="button"
                                                onClick={() => {
                                                    openModal({
                                                        id: this.state
                                                            .confirmationModalId,
                                                        content: DataPathHoC(
                                                            ConfirmationDialog,
                                                            {
                                                                ConfirmationDialogId: this
                                                                    .state
                                                                    .confirmationModalId,
                                                                SubProjectModalId:
                                                                    data.subProjectModalId,
                                                                subProjectId:
                                                                    data.subProjectId,
                                                                subProjectTitle:
                                                                    data.subProjectTitle,
                                                                confirm: this
                                                                    .resetSubProjectToken,
                                                            }
                                                        ),
                                                    });
                                                    return closeModal({
                                                        id:
                                                            data.subProjectModalId,
                                                    });
                                                }}
                                                disabled={
                                                    subProjectResetToken.requesting
                                                }
                                                autoFocus={true}
                                            >
                                                {!subProjectResetToken.requesting && (
                                                    <>
                                                        <span>
                                                            Reset API Key
                                                        </span>
                                                        <span className="delete-btn__keycode">
                                                            <span className="keycode__icon keycode__icon--enter" />
                                                        </span>
                                                    </>
                                                )}
                                                {subProjectResetToken.requesting && (
                                                    <FormLoader />
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SubProjectApiKey.displayName = 'SubProjectApiKeyModal';

const mapStateToProps = (state, props) => {
    let subproject =
        state.subProject &&
        state.subProject.subProjects &&
        state.subProject.subProjects.subProjects
            ? state.subProject.subProjects.subProjects
            : {};
    if (
        subproject &&
        subproject.length &&
        props.data &&
        props.data.subProjectId
    ) {
        subproject = subproject.find(
            obj => obj._id === props.data.subProjectId
        );
    }

    return {
        subproject: subproject && subproject._id ? subproject : {},
        subProjectResetToken: state.subProject.resetToken,
    };
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            closeModal,
            openModal,
            resetSubProjectToken,
            resetSubProjectKeyReset,
        },
        dispatch
    );
};

SubProjectApiKey.propTypes = {
    closeModal: PropTypes.func,
    closeThisDialog: PropTypes.func.isRequired,
    data: PropTypes.object,
    resetSubProjectKeyReset: PropTypes.func,
    resetSubProjectToken: PropTypes.func,
    subProjectResetToken: PropTypes.object,
    subproject: PropTypes.object,
    openModal: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectApiKey);
