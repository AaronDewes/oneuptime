import React, { Component } from 'react';
import DataPathHoC from '../DataPathHoC';
import ViewApplicationLogKey from '../modals/ViewApplicationLogKey';
import DeleteApplicationLog from '../modals/DeleteApplicationLog';
import PropTypes from 'prop-types';
import ShouldRender from '../basic/ShouldRender';
import { ListLoader, FormLoader } from '../basic/Loader';

class ApplicationLogHeader extends Component {
    render() {
        const {
            applicationLog,
            isDetails,
            openModal,
            openApplicationLogKeyModalId,
            editApplicationLog,
            deleteModalId,
            deleteApplicationLog,
            deleting,
            viewMore,
            resetApplicationLogKey,
            stats,
            handleLogTypeChange,
            logOptions,
        } = this.props;
        return (
            <div>
                <div className="db-Trends-header">
                    <div className="db-Trends-title">
                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                            <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                                <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                    <span
                                        id="application-content-header"
                                        className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap"
                                    >
                                        <span
                                            id={`application-log-title-${applicationLog.name}`}
                                        >
                                            {applicationLog.name}
                                        </span>
                                    </span>
                                </div>
                                <div className="db-Trends-control Flex-justifyContent--flexEnd Flex-flex">
                                    <div>
                                        {isDetails ? (
                                            <div>
                                                <button
                                                    id={`key_${applicationLog.name}`}
                                                    className={
                                                        'bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--key'
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        openModal({
                                                            id: openApplicationLogKeyModalId,
                                                            onClose: () => '',
                                                            onConfirm: () =>
                                                                resetApplicationLogKey(),
                                                            content: DataPathHoC(
                                                                ViewApplicationLogKey,
                                                                {
                                                                    applicationLog,
                                                                }
                                                            ),
                                                        })
                                                    }
                                                >
                                                    <span>
                                                        Application Log Key
                                                    </span>
                                                </button>
                                                <button
                                                    id={`edit_${applicationLog.name}`}
                                                    className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--settings"
                                                    type="button"
                                                    onClick={editApplicationLog}
                                                >
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    id={`delete_${applicationLog.name}`}
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
                                                                deleteApplicationLog(),
                                                            content: DataPathHoC(
                                                                DeleteApplicationLog,
                                                                {
                                                                    applicationLog,
                                                                }
                                                            ),
                                                        })
                                                    }
                                                >
                                                    <ShouldRender
                                                        if={!deleting}
                                                    >
                                                        <span>Delete</span>
                                                    </ShouldRender>
                                                    <ShouldRender if={deleting}>
                                                        <FormLoader />
                                                    </ShouldRender>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                id={`more-details-${applicationLog.name}`}
                                                className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--more"
                                                type="button"
                                                onClick={viewMore}
                                            >
                                                <span>More</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ShouldRender if={!stats || stats.requesting}>
                    <ListLoader />
                </ShouldRender>
                <ShouldRender if={stats && !stats.requesting}>
                    <div
                        className="db-TrendRow db-ListViewItem-header db-Trends-header"
                        style={{ cursor: 'pointer' }}
                    >
                        <div
                            onClick={() => handleLogTypeChange(logOptions[0])}
                            className="db-Trend-colInformation"
                        >
                            <div className="db-Trend-rowTitle" title="All Logs">
                                <div className="db-Trend-title Flex-flex Flex-justifyContent--center">
                                    <span className="chart-font">All Logs</span>
                                </div>
                            </div>
                            <div className="db-Trend-row">
                                <div className="db-Trend-col db-Trend-colValue Flex-flex Flex-justifyContent--center">
                                    <span>
                                        {' '}
                                        <span className="chart-font">
                                            {stats && stats.stats
                                                ? stats.stats.all
                                                : 0}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={() => handleLogTypeChange(logOptions[1])}
                            className="db-Trend-colInformation"
                        >
                            <div
                                className="db-Trend-rowTitle"
                                title="Error Logs"
                            >
                                <div className="db-Trend-title Flex-flex Flex-justifyContent--center">
                                    <span className="chart-font">
                                        Error Logs
                                    </span>
                                </div>
                            </div>
                            <div className="db-Trend-row">
                                <div className="db-Trend-col db-Trend-colValue Flex-flex Flex-justifyContent--center">
                                    <span>
                                        {' '}
                                        <span className="chart-font">
                                            {stats && stats.stats
                                                ? stats.stats.error
                                                : 0}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={() => handleLogTypeChange(logOptions[2])}
                            className="db-Trend-colInformation"
                        >
                            <div
                                className="db-Trend-rowTitle"
                                title="Warning Logs"
                            >
                                <div className="db-Trend-title Flex-flex Flex-justifyContent--center">
                                    <span className="chart-font">
                                        Warning Logs
                                    </span>
                                </div>
                            </div>
                            <div className="db-Trend-row">
                                <div className="db-Trend-col db-Trend-colValue Flex-flex Flex-justifyContent--center">
                                    <span>
                                        {' '}
                                        <span className="chart-font">
                                            {stats && stats.stats
                                                ? stats.stats.warning
                                                : 0}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={() => handleLogTypeChange(logOptions[3])}
                            className="db-Trend-colInformation"
                        >
                            <div
                                className="db-Trend-rowTitle"
                                title="Info Logs"
                            >
                                <div className="db-Trend-title Flex-flex Flex-justifyContent--center">
                                    <span className="chart-font">
                                        Info Logs
                                    </span>
                                </div>
                            </div>
                            <div className="db-Trend-row">
                                <div className="db-Trend-col db-Trend-colValue Flex-flex Flex-justifyContent--center">
                                    <span>
                                        {' '}
                                        <span className="chart-font">
                                            {stats && stats.stats
                                                ? stats.stats.info
                                                : 0}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ShouldRender>
            </div>
        );
    }
}

ApplicationLogHeader.displayName = 'ApplicationLogHeader';

ApplicationLogHeader.propTypes = {
    openApplicationLogKeyModalId: PropTypes.string,
    applicationLog: PropTypes.object,
    openModal: PropTypes.func,
    editApplicationLog: PropTypes.func,
    deleteApplicationLog: PropTypes.func,
    isDetails: PropTypes.bool,
    deleteModalId: PropTypes.string,
    deleting: PropTypes.bool,
    viewMore: PropTypes.func,
    resetApplicationLogKey: PropTypes.func,
    stats: PropTypes.object,
    handleLogTypeChange: PropTypes.func,
    logOptions: PropTypes.array,
};

export default ApplicationLogHeader;
