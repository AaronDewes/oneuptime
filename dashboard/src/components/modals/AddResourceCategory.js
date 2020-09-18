import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { bindActionCreators } from 'redux';
import ShouldRender from '../basic/ShouldRender';
import { Validate } from '../../config';
import { Spinner } from '../basic/Loader';
import { closeModal } from '../../actions/modal';
import { createResourceCategory } from '../../actions/resourceCategories';

function validate(values) {
    const errors = {};

    if (!Validate.text(values.name)) {
        errors.name = 'Resource Category name is required!';
    }
    return errors;
}

export class AddResourceCategoryForm extends React.Component {
    // eslint-disable-next-line
    constructor(props) {
        super(props);
    }

    submitForm = values => {
        this.props
            .createResourceCategory(this.props.projectId, values)
            .then(() => {
                return this.props.closeModal({
                    id: this.props.CreateResourceCategoryModalId,
                });
            });
    };

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return this.props.closeModal({
                    id: this.props.CreateResourceCategoryModalId,
                });
            default:
                return false;
        }
    };

    render() {
        const { handleSubmit } = this.props;
        return (
            <form onSubmit={handleSubmit(this.submitForm.bind(this))}>
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
                                        <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                            <span>
                                                Create New Resource Category
                                            </span>
                                        </span>
                                    </div>
                                    <div className="bs-Modal-messages">
                                        <ShouldRender
                                            if={
                                                this.props.resourceCategory
                                                    .error
                                            }
                                        >
                                            <p className="bs-Modal-message">
                                                {
                                                    this.props.resourceCategory
                                                        .error
                                                }
                                            </p>
                                        </ShouldRender>
                                    </div>
                                </div>
                                <div className="bs-Modal-body">
                                    <Field
                                        required={true}
                                        component="input"
                                        name="resourceCategoryName"
                                        placeholder="Resource Category Name"
                                        id="resourceCategoryName"
                                        className="bs-TextInput"
                                        style={{
                                            width: '90%',
                                            margin: '10px 0 10px 5%',
                                        }}
                                        disabled={
                                            this.props.resourceCategory
                                                .requesting
                                        }
                                    />
                                </div>
                                <div className="bs-Modal-footer">
                                    <div className="bs-Modal-footer-actions">
                                        <button
                                            className={`bs-Button bs-DeprecatedButton ${this
                                                .props.resourceCategory
                                                .requesting &&
                                                'bs-is-disabled'}`}
                                            type="button"
                                            onClick={() => {
                                                this.props.closeModal({
                                                    id: this.props
                                                        .CreateResourceCategoryModalId,
                                                });
                                            }}
                                            disabled={
                                                this.props.resourceCategory
                                                    .requesting
                                            }
                                        >
                                            <span>Cancel</span>
                                        </button>
                                        <button
                                            id="addResourceCategoryButton"
                                            className={`bs-Button bs-DeprecatedButton bs-Button--blue ${this
                                                .props.resourceCategory
                                                .requesting &&
                                                'bs-is-disabled'}`}
                                            type="save"
                                            disabled={
                                                this.props.resourceCategory
                                                    .requesting
                                            }
                                        >
                                            <ShouldRender
                                                if={
                                                    this.props.resourceCategory
                                                        .requesting
                                                }
                                            >
                                                <Spinner />
                                            </ShouldRender>

                                            <span>Add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

AddResourceCategoryForm.displayName = 'AddResourceCategoryForm';

const CreateAddResourceCategoryForm = reduxForm({
    form: 'AddResourceCategoryForm',
    validate,
})(AddResourceCategoryForm);

const mapStateToProps = state => {
    return {
        projectId:
            state.project.currentProject !== null &&
            state.project.currentProject._id,
        CreateResourceCategoryModalId: state.modal.modals[0].id,
        resourceCategory: state.resourceCategories.newResourceCategory,
    };
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ closeModal, createResourceCategory }, dispatch);
};

AddResourceCategoryForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    createResourceCategory: PropTypes.func.isRequired,
    CreateResourceCategoryModalId: PropTypes.string,
    resourceCategory: PropTypes.object,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateAddResourceCategoryForm);
