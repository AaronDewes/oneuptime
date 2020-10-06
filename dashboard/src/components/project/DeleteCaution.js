import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { Validate } from '../../config';
import ShouldRender from '../basic/ShouldRender';
import { Spinner } from '../basic/Loader';

function validate(values) {
    const errors = {};

    if (!Validate.text(values.projectName)) {
        errors.name = 'Project Name is required!';
    }

    return errors;
}

class DeleteCaution extends Component {
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyBoard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyBoard);
    }

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return this.props.hide();
            case 'Enter':
                if (e.target.localName !== 'textarea') {
                    return document.getElementById('btnDeleteProject').click();
                }
                return;
            default:
                return false;
        }
    };

    render() {
        const { hide, requesting, deleteProject, handleSubmit } = this.props;

        return (
            <form
                id="delete-project-form"
                onSubmit={handleSubmit(deleteProject.bind(this))}
            >
                <div className="bs-Modal bs-Modal--medium">
                    <div className="bs-Modal-header">
                        <div className="bs-Modal-header-copy">
                            <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                <span>Delete Project</span>
                            </span>
                        </div>
                    </div>
                    <div className="bs-Modal-content">
                        <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                            Are you sure you want to delete this project?
                        </span>
                        <br />
                        <br />
                        <div>
                            <Field
                                required={true}
                                component="textarea"
                                name="feedback"
                                placeholder="Please tell us why you want to delete this project"
                                id="feedback"
                                className="bs-TextArea bs-TextArea--x-tall"
                            />
                        </div>
                    </div>
                    <div className="bs-Modal-footer">
                        <div className="bs-Modal-footer-actions">
                            <button
                                className={`bs-Button btn__modal ${requesting &&
                                    'bs-is-disabled'}`}
                                type="button"
                                onClick={hide}
                                disabled={requesting}
                            >
                                <span>Cancel</span>
                                <span className="cancel-btn__keycode">Esc</span>
                            </button>
                            <button
                                className={`bs-Button bs-Button--red Box-background--red btn__modal ${requesting &&
                                    'bs-is-disabled'}`}
                                disabled={requesting}
                                type="submit"
                                autoFocus={true}
                                id="btnDeleteProject"
                            >
                                <ShouldRender if={requesting}>
                                    <Spinner />
                                </ShouldRender>
                                <span>DELETE PERMANENTLY</span>
                                <span className="delete-btn__keycode">
                                    <span className="keycode__icon keycode__icon--enter" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

DeleteCaution.displayName = 'DeleteCaution';

DeleteCaution.propTypes = {
    hide: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
    requesting: PropTypes.bool,
    handleSubmit: PropTypes.func,
};

export default reduxForm({
    form: 'DeleteCautionForm',
    validate,
})(DeleteCaution);
