import React from 'react';
import { reduxForm, Field } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ClickOutside from 'react-click-outside';
import { RenderField } from '../basic/RenderField';
import RenderCodeEditor from '../basic/RenderCodeEditor';
import { ValidateField, incidentNoteTemplateVariables } from '../../config';
import { closeModal } from '../../actions/modal';
import { FormLoader } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { RenderSelect } from '../basic/RenderSelect';
import {
    createIncidentNoteTemplate,
    fetchIncidentNoteTemplates,
    createIncidentNoteTemplateFailure,
} from '../../actions/incidentNoteTemplate';

class CreateIncidentNoteTemplate extends React.Component {
    state = {
        showVariables: false,
    };

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyBoard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyBoard);
    }

    handleKeyBoard = event => {
        switch (event.key) {
            case 'Escape':
                return this.closeAndClearError();
            case 'Enter':
                if (event.target.localName === 'body') {
                    return document
                        .getElementById('createIncidentNoteTemplate')
                        .click();
                }
                return false;
            default:
                return false;
        }
    };

    submit = values => {
        const {
            createIncidentNoteTemplate,
            currentProject,
            closeModal,
            fetchIncidentNoteTemplates,
        } = this.props;

        const projectId = currentProject._id;
        const {
            incidentState,
            incidentNote,
            name,
            customIncidentState,
        } = values;

        const data = {
            incidentNote: incidentNote.trim(),
            name,
            incidentState,
        };
        if (incidentState === 'Others') {
            data.incidentState = customIncidentState;
        }

        createIncidentNoteTemplate({
            projectId,
            data,
        }).then(() => {
            if (
                !this.props.creatingNoteTemplate &&
                !this.props.creatingNoteTemplateError
            ) {
                fetchIncidentNoteTemplates({ projectId, skip: 0, limit: 10 });
                closeModal();
            }
        });
    };

    closeAndClearError = () => {
        const { createIncidentNoteTemplateFailure, closeModal } = this.props;

        // clear error
        createIncidentNoteTemplateFailure(null);
        closeModal();
    };

    render() {
        const {
            handleSubmit,
            creatingNoteTemplate,
            creatingNoteTemplateError,
            formValues,
        } = this.props;
        const { showVariables } = this.state;

        return (
            <div
                className="ModalLayer-contents"
                tabIndex="-1"
                style={{ marginTop: '40px' }}
            >
                <div className="bs-BIM">
                    <div
                        className="bs-Modal bs-Modal--medium"
                        style={{ width: 570 }}
                    >
                        <ClickOutside onClickOutside={this.closeAndClearError}>
                            <div className="bs-Modal-header">
                                <div
                                    className="bs-Modal-header-copy"
                                    style={{
                                        marginBottom: '10px',
                                        marginTop: '10px',
                                    }}
                                >
                                    <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                        <span>
                                            Create New Incident Note Template
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <form
                                onSubmit={handleSubmit(this.submit)}
                                id="templateForm"
                            >
                                <div className="bs-Modal-content bs-u-paddingless">
                                    <div className="bs-Modal-block bs-u-paddingless">
                                        <div className="bs-Modal-content">
                                            <span className="bs-Fieldset">
                                                <fieldset
                                                    className="bs-Fieldset"
                                                    style={{ padding: 0 }}
                                                >
                                                    <div className="bs-Fieldset-rows">
                                                        <div className="bs-Fieldset-row">
                                                            <label className="bs-Fieldset-label">
                                                                Template Name
                                                            </label>
                                                            <div className="bs-Fieldset-fields">
                                                                <Field
                                                                    id="name"
                                                                    className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                    component={
                                                                        RenderField
                                                                    }
                                                                    name="name"
                                                                    validate={
                                                                        ValidateField.text
                                                                    }
                                                                    disabled={
                                                                        creatingNoteTemplate
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="bs-Fieldset-row">
                                                            <label className="bs-Fieldset-label">
                                                                Incident State
                                                            </label>
                                                            <div className="bs-Fieldset-fields">
                                                                <Field
                                                                    className="db-select-nw full-width"
                                                                    component={
                                                                        RenderSelect
                                                                    }
                                                                    id="incidentState"
                                                                    name="incidentState"
                                                                    options={[
                                                                        {
                                                                            value:
                                                                                'Investigation',
                                                                            label:
                                                                                'Investigation',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'Update',
                                                                            label:
                                                                                'Update',
                                                                        },
                                                                        {
                                                                            value:
                                                                                'Others',
                                                                            label:
                                                                                'Others',
                                                                        },
                                                                    ]}
                                                                    disabled={
                                                                        creatingNoteTemplate
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        {formValues &&
                                                            formValues.incidentState &&
                                                            formValues.incidentState ===
                                                                'Others' && (
                                                                <div className="bs-Fieldset-row">
                                                                    <label className="bs-Fieldset-label">
                                                                        Custom
                                                                        Incident
                                                                        State
                                                                    </label>
                                                                    <div className="bs-Fieldset-fields">
                                                                        <Field
                                                                            id="customIncidentState"
                                                                            className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                            component={
                                                                                RenderField
                                                                            }
                                                                            name="customIncidentState"
                                                                            validate={
                                                                                ValidateField.text
                                                                            }
                                                                            disabled={
                                                                                creatingNoteTemplate
                                                                            }
                                                                            style={{
                                                                                width:
                                                                                    '100%',
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Incident Note
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <div
                                                                style={{
                                                                    width:
                                                                        '100%',
                                                                }}
                                                            >
                                                                <Field
                                                                    className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                    component={
                                                                        RenderCodeEditor
                                                                    }
                                                                    id="incidentNote"
                                                                    name="incidentNote"
                                                                    mode="markdown"
                                                                    width="100%"
                                                                    height="150px"
                                                                    wrapEnabled={
                                                                        true
                                                                    }
                                                                    disabled={
                                                                        creatingNoteTemplate
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="bs-Fieldset-row"
                                                        style={{
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <label
                                                            className="bs-Fieldset-label Text-align--left"
                                                            htmlFor="isDefault"
                                                        ></label>
                                                        <div
                                                            className="bs-Fieldset-fields"
                                                            style={{
                                                                paddingTop:
                                                                    '15px',
                                                            }}
                                                        >
                                                            <div className="bs-Fieldset-field">
                                                                <label
                                                                    className="Checkbox"
                                                                    style={{
                                                                        marginRight:
                                                                            '12px',
                                                                    }}
                                                                    htmlFor="isDefault"
                                                                >
                                                                    <div>
                                                                        <ShouldRender
                                                                            if={
                                                                                !showVariables
                                                                            }
                                                                        >
                                                                            <div
                                                                                className="template-variable-1"
                                                                                style={{
                                                                                    display:
                                                                                        'block',
                                                                                }}
                                                                            >
                                                                                <button
                                                                                    onClick={() =>
                                                                                        this.setState(
                                                                                            {
                                                                                                showVariables: true,
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                    className="button-as-anchor"
                                                                                    type="button"
                                                                                >
                                                                                    Click
                                                                                    here
                                                                                    to
                                                                                    reveal
                                                                                    available
                                                                                    variables.
                                                                                </button>
                                                                            </div>
                                                                        </ShouldRender>
                                                                        <ShouldRender
                                                                            if={
                                                                                showVariables
                                                                            }
                                                                        >
                                                                            <ul
                                                                                className="template-variable-1"
                                                                                style={{
                                                                                    display:
                                                                                        'block',
                                                                                }}
                                                                            >
                                                                                {incidentNoteTemplateVariables.map(
                                                                                    (
                                                                                        variable,
                                                                                        index
                                                                                    ) => (
                                                                                        <li
                                                                                            key={
                                                                                                index
                                                                                            }
                                                                                            className="template-variables"
                                                                                            style={{
                                                                                                listStyleType:
                                                                                                    'disc',
                                                                                                listStylePosition:
                                                                                                    'inside',
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                variable.description
                                                                                            }
                                                                                        </li>
                                                                                    )
                                                                                )}
                                                                            </ul>
                                                                        </ShouldRender>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bs-Modal-footer">
                                    <div
                                        className="bs-Modal-footer-actions"
                                        style={{
                                            width: '100%',
                                            flexWrap: 'nowrap',
                                        }}
                                    >
                                        <ShouldRender
                                            if={creatingNoteTemplateError}
                                        >
                                            <div className="bs-Tail-copy">
                                                <div
                                                    className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart"
                                                    style={{
                                                        marginTop: '10px',
                                                    }}
                                                >
                                                    <div className="Box-root Margin-right--8">
                                                        <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                                                    </div>
                                                    <div className="Box-root">
                                                        <span
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            {
                                                                creatingNoteTemplateError
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </ShouldRender>
                                        <button
                                            className="bs-Button bs-DeprecatedButton btn__modal"
                                            type="button"
                                            onClick={this.closeAndClearError}
                                            style={{ height: '35px' }}
                                        >
                                            <span>Cancel</span>
                                            <span className="cancel-btn__keycode">
                                                Esc
                                            </span>
                                        </button>
                                        <button
                                            id="createIncidentNoteTemplate"
                                            className="bs-Button bs-DeprecatedButton bs-Button--blue btn__modal"
                                            disabled={creatingNoteTemplate}
                                            type="submit"
                                            style={{ height: '35px' }}
                                        >
                                            {!creatingNoteTemplate && (
                                                <>
                                                    <span>Create</span>
                                                    <span className="create-btn__keycode">
                                                        <span className="keycode__icon keycode__icon--enter" />
                                                    </span>
                                                </>
                                            )}
                                            {creatingNoteTemplate && (
                                                <FormLoader />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </ClickOutside>
                    </div>
                </div>
            </div>
        );
    }
}

CreateIncidentNoteTemplate.displayName = 'CreateIncidentNoteTemplate';
CreateIncidentNoteTemplate.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    currentProject: PropTypes.object.isRequired,
    creatingNoteTemplate: PropTypes.bool,
    creatingNoteTemplateError: PropTypes.oneOf([
        PropTypes.string,
        PropTypes.oneOfType([null, undefined]),
    ]),
    closeModal: PropTypes.func,
    createIncidentNoteTemplate: PropTypes.func,
    fetchIncidentNoteTemplates: PropTypes.func,
    createIncidentNoteTemplateFailure: PropTypes.func,
    formValues: PropTypes.object,
};

const CreateIncidentNoteTemplateForm = reduxForm({
    form: 'CreateIncidentNoteTemplateForm', // a unique identifier for this form
    enableReinitialize: true,
})(CreateIncidentNoteTemplate);

const mapStateToProps = state => {
    return {
        currentProject: state.project.currentProject,
        creatingNoteTemplate:
            state.incidentNoteTemplate.createNoteTemplate.requesting,
        creatingNoteTemplateError:
            state.incidentNoteTemplate.createNoteTemplate.error,
        formValues: state.form.CreateIncidentNoteTemplateForm
            ? state.form.CreateIncidentNoteTemplateForm.values
            : {},
        initialValues: { incidentState: 'Update' },
    };
};
const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            closeModal,
            createIncidentNoteTemplate,
            fetchIncidentNoteTemplates,
            createIncidentNoteTemplateFailure,
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateIncidentNoteTemplateForm);
