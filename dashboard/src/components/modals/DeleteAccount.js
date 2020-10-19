import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { FormLoader } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { SHOULD_LOG_ANALYTICS, Validate } from '../../config';
import { logEvent } from '../../analytics';
import { bindActionCreators } from 'redux';
import { deleteAccount } from '../../actions/profile';
import { logoutUser } from '../../actions/logout';
import { teamLoading, subProjectTeamLoading } from '../../actions/team';
import { trim } from 'lodash';

function validate(values) {
    const errors = {};

    if (!Validate.text(values.name)) {
        errors.name = 'This field cannot be empty';
    }
    return errors;
}

class DeleteAccount extends Component {
    state = {
        deleteMyAccount: false,
        toggle: false,
    };

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
                return document.getElementById('btn_confirm_delete').click();
            default:
                return false;
        }
    };

    ownProjects = userId => {
        const { projects } = this.props;
        return projects.filter(project => {
            return project.users.find(
                user =>
                    user.userId === userId &&
                    user.role === 'Owner' &&
                    project.users.length > 1
            );
        });
    };

    projectsWithoutMultipleOwners = userId => {
        const projects = this.ownProjects(userId);
        return projects.filter(project => {
            const otherOwner = project.users.find(
                user => user.userId !== userId && user.role === 'Owner'
            );
            return otherOwner ? false : true;
        });
    };

    renderOwnProjects = userId => {
        const projects = this.projectsWithoutMultipleOwners(userId);
        return projects.map(project => {
            return <li key={project._id}>{project.name}</li>;
        });
    };

    onChange = event => {
        const { value } = event.target;
        const deleteMyAccount =
            trim(value.toUpperCase()) === 'DELETE MY ACCOUNT' ? true : false;
        this.setState({ deleteMyAccount });
    };

    submitForm = values => {
        const userId = this.props.profileSettings.data.id;
        values.deleteMyAccount = values.deleteMyAccount.toUpperCase();
        const promise = this.props.deleteAccount(userId, values);
        this.props.logoutUser();
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > PROFILE > ACCOUNT DELETED', {
                userId,
            });
        }
        return promise;
    };

    render() {
        const deleting = this.props.deleteAccountSetting.requesting;
        const { profileSettings, handleSubmit } = this.props;
        const userId = profileSettings.data.id;
        const shouldRender =
            this.projectsWithoutMultipleOwners(userId).length > 0;
        const { deleteMyAccount } = this.state;

        return (
            <div className="ModalLayer-wash Box-root Flex-flex Flex-alignItems--flexStart Flex-justifyContent--center">
                <div
                    className="ModalLayer-contents"
                    tabIndex={-1}
                    style={{ marginTop: 40 }}
                >
                    <div className="bs-BIM">
                        <div className="bs-Modal bs-Modal--medium">
                            {!this.state.toggle ? (
                                <div>
                                    <div className="bs-Modal-header">
                                        <div className="bs-Modal-header-copy">
                                            <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                                <span>Delete Account</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bs-Modal-content">
                                        <div>
                                            <div className="icon_display-msg">
                                                <div className="clear_times"></div>
                                                <div>
                                                    We will stop monitoring your
                                                    resources.
                                                </div>
                                            </div>
                                            <div className="icon_display-msg">
                                                <div className="clear_times"></div>
                                                <div>
                                                    Your customers, users and
                                                    team will lose access to the
                                                    status page.
                                                </div>
                                            </div>
                                            <div className="icon_display-msg">
                                                <div className="clear_times"></div>
                                                <div>
                                                    Your team will NOT be
                                                    alerted during downtime.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bs-Modal-footer">
                                        <div className="bs-Modal-footer-actions">
                                            <CancelBtn
                                                closeThisDialog={
                                                    this.props.closeThisDialog
                                                }
                                            />
                                            <button
                                                id="btn_confirm_delete"
                                                className="bs-Button bs-DeprecatedButton bs-Button--red btn__modal"
                                                type="submit"
                                                autoFocus={true}
                                                onClick={() =>
                                                    this.setState({
                                                        toggle: true,
                                                    })
                                                }
                                            >
                                                <span>Proceed</span>
                                                <span className="delete-btn__keycode">
                                                    <span className="keycode__icon keycode__icon--enter" />
                                                </span>
                                                )
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(this.submitForm)}>
                                    <div className="bs-Modal-header">
                                        <div className="bs-Modal-header-copy">
                                            <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                                <span>Confirm Deletion</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bs-Modal-content">
                                        <ShouldRender if={shouldRender}>
                                            <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                                You are the owner of the
                                                following projects, you need to
                                                make someone else the owner of
                                                these projects before you can
                                                delete your account.
                                            </span>
                                            <div className="bs-Fieldset-row">
                                                <ul>
                                                    {this.renderOwnProjects(
                                                        userId
                                                    )}
                                                </ul>
                                            </div>
                                        </ShouldRender>
                                        <ShouldRender if={!shouldRender}>
                                            <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                                Deleting your account will
                                                delete all the projects ownened
                                                by you. If you are a member of
                                                any projects, you will
                                                automaitally be removed from
                                                those projects. Please type
                                                exactly - &#34;DELETE MY
                                                ACCOUNT&#34; in the textbox
                                                below to delete your account.
                                            </span>
                                            <Field
                                                required={true}
                                                component="input"
                                                name="deleteMyAccount"
                                                placeholder="DELETE MY ACCOUNT"
                                                id="deleteMyAccount"
                                                className="bs-TextInput"
                                                style={{
                                                    width: '100%',
                                                    margin: '10px 0 10px 0',
                                                    textTransform: 'uppercase',
                                                }}
                                                onChange={this.onChange}
                                                disabled={deleting}
                                                autoComplete="off"
                                            />
                                        </ShouldRender>
                                    </div>
                                    <div className="bs-Modal-footer">
                                        <div className="bs-Modal-footer-actions">
                                            <CancelBtn
                                                closeThisDialog={
                                                    this.props.closeThisDialog
                                                }
                                            />
                                            <ShouldRender
                                                if={
                                                    !shouldRender &&
                                                    deleteMyAccount
                                                }
                                            >
                                                <button
                                                    id="btn_confirm_delete"
                                                    className="bs-Button bs-DeprecatedButton bs-Button--red btn__modal"
                                                    type="submit"
                                                    disabled={deleting}
                                                    autoFocus={true}
                                                >
                                                    {!deleting && (
                                                        <>
                                                            <span>Delete</span>
                                                            <span className="delete-btn__keycode">
                                                                <span className="keycode__icon keycode__icon--enter" />
                                                            </span>
                                                        </>
                                                    )}
                                                    {deleting && <FormLoader />}
                                                </button>
                                            </ShouldRender>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DeleteAccount.displayName = 'DeleteAccount';

const DeleteAccountForm = reduxForm({
    form: 'DeleteAccount',
    validate,
})(DeleteAccount);

DeleteAccount.propTypes = {
    closeThisDialog: PropTypes.func.isRequired,
    deleteAccountSetting: PropTypes.shape({ requesting: PropTypes.bool }),
    profileSettings: PropTypes.shape({
        data: PropTypes.shape({ id: PropTypes.string }),
    }),
    currentProject: PropTypes.shape({ _id: PropTypes.string }),
    deleteAccount: PropTypes.func,
    logoutUser: PropTypes.func,
    projects: PropTypes.array,
    handleSubmit: PropTypes.func,
};

const mapStateToProps = state => {
    return {
        deleteAccountSetting: state.profileSettings.deleteAccount,
        profileSettings: state.profileSettings.profileSetting,
        currentProject: state.project.currentProject,
        projects: state.project.projects.projects,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        { deleteAccount, logoutUser, teamLoading, subProjectTeamLoading },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(DeleteAccountForm);

function CancelBtn(props) {
    return (
        <button
            className="bs-Button bs-DeprecatedButton bs-Button--grey btn__modal"
            type="button"
            onClick={props.closeThisDialog}
        >
            <span>Cancel</span>
            <span className="cancel-btn__keycode">Esc</span>
        </button>
    );
}
