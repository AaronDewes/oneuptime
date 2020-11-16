import React, { Component } from 'react';
import Select from '../../components/basic/react-select-fyipe';
import Dropdown, { MenuItem } from '@trendmicro/react-dropdown';
import PropTypes from 'prop-types';
import ShouldRender from '../basic/ShouldRender';
import { FormLoader } from '../basic/Loader';
import DataPathHoC from '../DataPathHoC';
import DeleteErrorTracker from '../modals/DeleteErrorTracker';
import { connect } from 'react-redux';
import ViewErrorTrackerKey from '../modals/ViewErrorTrackerKey';

class ErrorTrackerHeader extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            showFilters: false,
        };
    }
    render() {
        const {
            errorTracker,
            isDetails,
            errorTrackerIssue,
            viewMore,
            deleteErrorTracker,
            openModal,
            deleteModalId,
            editErrorTracker,
            trackerKeyModalId,
            resetErrorTrackerKey,
        } = this.props;
        let deleting = false;
        if (
            this.props.errorTrackerState &&
            this.props.errorTrackerState.deleteErrorTracker &&
            this.props.errorTrackerState.deleteErrorTracker === errorTracker._id
        ) {
            deleting = true;
        }
        return (
            <div>
                <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                    <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                            <span className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                <span
                                    style={{
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {`${errorTracker.name} (${
                                        errorTrackerIssue
                                            ? errorTrackerIssue
                                                  .errorTrackerIssues.length
                                            : 0
                                    })`}
                                </span>
                            </span>
                        </div>
                        <div className="Flex-flex">
                            {isDetails ? (
                                <div>
                                    <button
                                        id={`filter_${errorTracker.name}`}
                                        className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--filter"
                                        type="button"
                                        onClick={() =>
                                            this.setState(state => ({
                                                showFilters: !state.showFilters,
                                            }))
                                        }
                                    >
                                        <span>
                                            {this.state.showFilters
                                                ? 'Hide Filters'
                                                : 'Filter'}
                                        </span>
                                    </button>
                                    <button
                                        id={`key_${errorTracker.name}`}
                                        className={
                                            'bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--key'
                                        }
                                        type="button"
                                        onClick={() =>
                                            openModal({
                                                id: trackerKeyModalId,
                                                onClose: () => '',
                                                onConfirm: () =>
                                                    resetErrorTrackerKey(),
                                                content: DataPathHoC(
                                                    ViewErrorTrackerKey,
                                                    {
                                                        errorTracker,
                                                    }
                                                ),
                                            })
                                        }
                                    >
                                        <span>Tracker Key</span>
                                    </button>
                                    <button
                                        id={`edit_${errorTracker.name}`}
                                        className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--settings"
                                        type="button"
                                        onClick={editErrorTracker}
                                    >
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        id={`delete_${errorTracker.name}`}
                                        className={
                                            deleting
                                                ? 'bs-Button bs-Button--blue'
                                                : 'bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--delete'
                                        }
                                        type="button"
                                        disabled={deleting}
                                        onClick={() =>
                                            openModal({
                                                id: deleteModalId,
                                                onClose: () => '',
                                                onConfirm: () =>
                                                    deleteErrorTracker(),
                                                content: DataPathHoC(
                                                    DeleteErrorTracker,
                                                    {
                                                        errorTracker,
                                                    }
                                                ),
                                            })
                                        }
                                    >
                                        <ShouldRender if={!deleting}>
                                            <span>Delete</span>
                                        </ShouldRender>
                                        <ShouldRender if={deleting}>
                                            <FormLoader />
                                        </ShouldRender>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    id={`more-details-${errorTracker.name}`}
                                    className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--more"
                                    type="button"
                                    onClick={viewMore}
                                >
                                    <span>More</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="db-Trends-controls Margin-top--12">
                        <div className="Flex-flex">
                            <span className="Margin-all--8">
                                <Dropdown>
                                    <Dropdown.Toggle
                                        id="filterToggle"
                                        className="bs-Button bs-DeprecatedButton"
                                        title={'Sort By: Last Seen'}
                                    />
                                    <Dropdown.Menu>
                                        <MenuItem title="clear">
                                            Clear Filters
                                        </MenuItem>
                                        <MenuItem title="unacknowledged">
                                            Unacknowledged
                                        </MenuItem>
                                        <MenuItem title="unresolved">
                                            Unresolved
                                        </MenuItem>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </span>
                            <div
                                style={{
                                    height: '33px',
                                    margin: '5px 0px',
                                }}
                            >
                                <Select
                                    name="log_type_selector"
                                    placeholder="Filter Errors"
                                    className="db-select-pr"
                                    id="log_type_selector"
                                    style={{
                                        height: '33px',
                                    }}
                                    options={[
                                        {
                                            value: '',
                                            label: 'Unresolved Errors',
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <span>
                                A description for what error tracking is.
                                Here&#39;s a list of all errors being tracked
                                for this component.
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        errorTrackerState: state.errorTracker,
    };
};

ErrorTrackerHeader.displayName = 'ErrorTrackerHeader';
ErrorTrackerHeader.propTypes = {
    errorTracker: PropTypes.object,
    isDetails: PropTypes.bool,
    errorTrackerIssue: PropTypes.object,
    viewMore: PropTypes.func,
    errorTrackerState: PropTypes.object,
    deleteErrorTracker: PropTypes.func,
    openModal: PropTypes.func,
    deleteModalId: PropTypes.string,
    editErrorTracker: PropTypes.func,
    trackerKeyModalId: PropTypes.string,
    resetErrorTrackerKey: PropTypes.func,
};
export default connect(mapStateToProps)(ErrorTrackerHeader);
