import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import ShouldRender from '../basic/ShouldRender';
import {
    fetchResourceCategories,
    deleteResourceCategory,
} from '../../actions/resourceCategories';
import AddResourceCategoryForm from '../modals/AddResourceCategory';
import RemoveResourceCategory from '../modals/RemoveResourceCategory';
import EditResourceCategory from '../modals/EditResourceCategory';
import { openModal, closeModal } from '../../actions/modal';
import DataPathHoC from '../DataPathHoC';
import uuid from 'uuid';
import { User } from '../../config';
import isOwnerOrAdmin from '../../utils/isOwnerOrAdmin';
import Unauthorised from '../modals/Unauthorised';

export class ResourceCategories extends Component {
    state = {
        CreateResourceCategoryModalId: uuid.v4(),
        EditResourceCategoryModalId: uuid.v4(),
        removeResourceCategoryModalId: uuid.v4(),
    };

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyboard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyboard);
    }

    handleKeyboard = e => {
        const { modalId } = this.props;
        const { CreateResourceCategoryModalId } = this.state;
        const userId = User.getUserId();

        switch (e.key) {
            case 'N':
            case 'n':
                if (modalId !== CreateResourceCategoryModalId) {
                    e.preventDefault(); // prevent entering the key automatically on the input field
                    return this.handleCreateResourceCategory(userId);
                }
                return true;
            default:
                return false;
        }
    };

    handleDeleteResourceCategory(_id) {
        this.props.deleteResourceCategory(_id, this.props.projectId);
    }
    prevClicked = () => {
        this.props.fetchResourceCategories(
            this.props.projectId,
            this.props.skip ? parseInt(this.props.skip, 10) - 10 : 10,
            10
        );
    };

    nextClicked = () => {
        this.props.fetchResourceCategories(
            this.props.projectId,
            this.props.skip ? parseInt(this.props.skip, 10) + 10 : 10,
            10
        );
    };

    handleCreateResourceCategory = userId => {
        const { openModal, currentProject } = this.props;
        isOwnerOrAdmin(userId, currentProject)
            ? openModal({
                  id: this.state.CreateResourceCategoryModalId,
                  content: AddResourceCategoryForm,
              })
            : openModal({
                  id: this.state.CreateResourceCategoryModalId,
                  content: Unauthorised,
              });
    };

    handleEdit = (userId, _id) => {
        const { openModal, currentProject } = this.props;
        isOwnerOrAdmin(userId, currentProject)
            ? openModal({
                  id: this.state.EditResourceCategoryModalId,
                  content: DataPathHoC(EditResourceCategory, {
                      resourceCategoryId: _id,
                  }),
              })
            : openModal({
                  id: this.state.CreateResourceCategoryModalId,
                  content: Unauthorised,
              });
    };

    handleDelete = (userId, _id) => {
        const { openModal, currentProject } = this.props;
        isOwnerOrAdmin(userId, currentProject)
            ? openModal({
                  id: this.state.removeResourceCategoryModalId,
                  onClose: () => '',
                  onConfirm: () => {
                      return new Promise(resolve => {
                          this.handleDeleteResourceCategory(_id);
                          resolve(true);
                      });
                  },
                  content: RemoveResourceCategory,
              })
            : openModal({
                  id: this.state.CreateResourceCategoryModalId,
                  content: Unauthorised,
              });
    };

    render() {
        const footerBorderTopStyle = { margin: 0, padding: 0 };
        let canNext =
            this.props.count >
            parseInt(this.props.skip) + parseInt(this.props.limit)
                ? true
                : false;
        let canPrev = parseInt(this.props.skip) <= 0 ? false : true;
        const { isRequesting, error, resourceCategories } = this.props;

        if (isRequesting || !resourceCategories) {
            canNext = false;
            canPrev = false;
        }

        const userId = User.getUserId();

        return (
            <div className="Box-root Margin-bottom--12">
                <div className="bs-ContentSection Card-root Card-shadow--medium">
                    <div className="Box-root">
                        <div className="bs-ContentSection-content Box-root Box-divider--surface-bottom-1 Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--16">
                            <div className="Box-root">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>Resource Categories</span>
                                </span>
                                <p>
                                    <span>
                                        {
                                            'Resource Categories lets you group resources by categories on Status Page.'
                                        }
                                    </span>
                                </p>
                            </div>
                            <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                                <div className="Box-root">
                                    <button
                                        onClick={() => {
                                            this.handleCreateResourceCategory(
                                                userId
                                            );
                                        }}
                                        className="Button bs-ButtonLegacy ActionIconParent"
                                        type="button"
                                    >
                                        <div className="bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                            <div className="Box-root Margin-right--8">
                                                <div className="SVGInline SVGInline--cleaned Button-icon ActionIcon ActionIcon--color--inherit Box-root Flex-flex"></div>
                                            </div>
                                            <span
                                                id="createResourceCategoryButton"
                                                className="bs-Button bs-FileUploadButton bs-Button--icon bs-Button--new keycode__wrapper"
                                            >
                                                <span>
                                                    Create Resource Category
                                                </span>
                                                <span className="new-btn__keycode">
                                                    N
                                                </span>
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div
                            id="resourceCategoryList"
                            className="bs-ContentSection-content Box-root"
                        >
                            <div className="bs-ObjectList db-UserList">
                                <div
                                    style={{
                                        overflow: 'hidden',
                                        overflowX: 'auto',
                                    }}
                                >
                                    <div className="bs-ObjectList-rows">
                                        <header className="bs-ObjectList-row bs-ObjectList-row--header">
                                            <div className="bs-ObjectList-cell">
                                                Resource category
                                            </div>
                                            <div className="bs-ObjectList-cell">
                                                Created
                                            </div>
                                            <div className="bs-ObjectList-cell">
                                                Action
                                            </div>
                                        </header>
                                        {resourceCategories.map(
                                            ({ createdAt, name, _id }) => (
                                                <div
                                                    key={_id}
                                                    className="bs-ObjectList-row db-UserListRow db-UserListRow--withName"
                                                >
                                                    <div className="bs-ObjectList-cell bs-u-v-middle">
                                                        <div className="bs-ObjectList-cell-row bs-ObjectList-copy bs-is-highlighted">
                                                            {this.props.name}
                                                        </div>
                                                        <div
                                                            id="resource-category-name"
                                                            className="bs-ObjectList-row db-UserListRow db-UserListRow--withNamebs-ObjectList-cell-row bs-is-muted"
                                                        >
                                                            {name}
                                                        </div>
                                                    </div>
                                                    <div className="bs-ObjectList-cell bs-u-v-middle">
                                                        <div className="bs-ObjectList-cell-row">
                                                            {moment(
                                                                createdAt
                                                            ).fromNow()}
                                                        </div>
                                                    </div>
                                                    <div className="bs-ObjectList-cell bs-u-v-middle">
                                                        <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                                            <div className="Box-root">
                                                                <button
                                                                    onClick={() => {
                                                                        this.handleEdit(
                                                                            userId,
                                                                            _id
                                                                        );
                                                                    }}
                                                                    className="Button bs-ButtonLegacy"
                                                                    type="button"
                                                                    id={`edit_${name}`}
                                                                >
                                                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                                            <span>
                                                                                Edit
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            </div>
                                                            <div
                                                                className="Box-root Margin-left--8"
                                                                id="deleteResourceCategoryBtn"
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        this.handleDelete(
                                                                            userId,
                                                                            _id
                                                                        );
                                                                    }}
                                                                    className="Button bs-ButtonLegacy"
                                                                    type="button"
                                                                    id={`delete_${name}`}
                                                                >
                                                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                                            <span>
                                                                                Delete
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                        <ShouldRender
                                            if={
                                                !(
                                                    (!resourceCategories ||
                                                        resourceCategories.length ===
                                                            0) &&
                                                    !isRequesting &&
                                                    !error
                                                )
                                            }
                                        >
                                            <div
                                                style={footerBorderTopStyle}
                                            ></div>
                                        </ShouldRender>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ShouldRender
                            if={
                                (!resourceCategories ||
                                    resourceCategories.length === 0) &&
                                !isRequesting &&
                                !error
                            }
                        >
                            <div
                                className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--center"
                                style={{
                                    textAlign: 'center',
                                    marginTop: '20px',
                                    padding: '0 10px',
                                }}
                            >
                                {(!resourceCategories ||
                                    resourceCategories.length === 0) &&
                                !isRequesting &&
                                !error
                                    ? 'You have no resource category at this time'
                                    : null}
                                {error ? error : null}
                            </div>
                        </ShouldRender>
                        <div className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween">
                            <div className="Box-root Flex-flex Flex-alignItems--center Padding-all--20">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                    <span>
                                        <span
                                            id="resourceCategoryCount"
                                            className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap"
                                        >
                                            {this.props.count
                                                ? this.props.count +
                                                  (this.props.count > 1
                                                      ? ' Resource Categories'
                                                      : ' Resource Category')
                                                : '0 Resource Category'}
                                        </span>
                                    </span>
                                </span>
                            </div>
                            <div className="Box-root Padding-horizontal--20 Padding-vertical--16">
                                <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                    <div className="Box-root Margin-right--8">
                                        <button
                                            onClick={() => this.prevClicked()}
                                            className={
                                                'Button bs-ButtonLegacy' +
                                                (canPrev ? '' : 'Is--disabled')
                                            }
                                            disabled={!canPrev}
                                            data-db-analytics-name="list_view.pagination.previous"
                                            type="button"
                                        >
                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                    <span>Previous</span>
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="Box-root">
                                        <button
                                            onClick={() => this.nextClicked()}
                                            className={
                                                'Button bs-ButtonLegacy' +
                                                (canNext ? '' : 'Is--disabled')
                                            }
                                            disabled={!canNext}
                                            data-db-analytics-name="list_view.pagination.next"
                                            type="button"
                                        >
                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                    <span>Next</span>
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ResourceCategories.displayName = 'ResourceCategories';

ResourceCategories.propTypes = {
    projectId: PropTypes.string,
    resourceCategories: PropTypes.array,
    isRequesting: PropTypes.bool,
    deleteResourceCategory: PropTypes.func.isRequired,
    fetchResourceCategories: PropTypes.func.isRequired,
    skip: PropTypes.number,
    count: PropTypes.number,
    limit: PropTypes.number,
    name: PropTypes.string,
    openModal: PropTypes.func.isRequired,
    error: PropTypes.object,
    currentProject: PropTypes.object,
    modalId: PropTypes.string,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            fetchResourceCategories,
            deleteResourceCategory,
            openModal,
            closeModal,
        },
        dispatch
    );

const mapStateToProps = state => ({
    projectId:
        state.project.currentProject !== null &&
        state.project.currentProject._id,
    resourceCategories:
        state.resourceCategories.resourceCategoryList.resourceCategories,
    skip: state.resourceCategories.resourceCategoryList.skip,
    limit: state.resourceCategories.resourceCategoryList.limit,
    count: state.resourceCategories.resourceCategoryList.count,
    isRequesting: state.resourceCategories.resourceCategoryList.requesting,
    currentProject: state.project.currentProject,
    modalId: state.modal.modals[0] ? state.modal.modals[0].id : '',
});

export default connect(mapStateToProps, mapDispatchToProps)(ResourceCategories);
