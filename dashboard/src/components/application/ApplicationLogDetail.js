import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { history } from '../../store';
import ShouldRender from '../basic/ShouldRender';
import { openModal, closeModal } from '../../actions/modal';
import uuid from 'uuid';
import { SHOULD_LOG_ANALYTICS } from '../../config';
import { logEvent } from 'amplitude-js';
import { bindActionCreators } from 'redux';
import { deleteApplicationLog } from '../../actions/applicationLog';
import {
    fetchLogs,
    resetApplicationLogKey,
    editApplicationLogSwitch,
    fetchStats,
} from '../../actions/applicationLog';
import { setStartDate, setEndDate } from '../../actions/dateTime';
import ApplicationLogDetailView from './ApplicationLogDetailView';
import * as moment from 'moment';
import ApplicationLogHeader from './ApplicationLogHeader';
import NewApplicationLog from './NewApplicationLog';

class ApplicationLogDetail extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            deleting: false,
            deleteModalId: uuid.v4(),
            openApplicationLogKeyModalId: uuid.v4(),
            logType: { value: '', label: 'All Logs' },
            filter: '',
        };
    }
    deleteApplicationLog = () => {
        const promise = this.props.deleteApplicationLog(
            this.props.currentProject._id,
            this.props.componentId,
            this.props.index
        );
        history.push(
            `/dashboard/project/${this.props.currentProject._id}/${this.props.componentId}/application-log`
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > COMPONENT > APPLICATION LOG > APPLICATION LOG DELETED',
                {
                    ProjectId: this.props.currentProject._id,
                    applicationLogId: this.props.index,
                }
            );
        }
        return promise;
    };
    resetApplicationLogKey = () => {
        return this.props
            .resetApplicationLogKey(
                this.props.currentProject._id,
                this.props.componentId,
                this.props.index
            )
            .then(() => {
                this.props.closeModal({
                    id: this.state.openApplicationLogKeyModalId,
                });
                if (SHOULD_LOG_ANALYTICS) {
                    logEvent(
                        'EVENT: DASHBOARD > COMPONENTS > APPLICATION LOG > APPLICATION LOG DETAILS > RESET APPLICATION LOG KEY',
                        {
                            applicationLogId: this.props.index,
                        }
                    );
                }
            });
    };
    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return this.props.closeModal({ id: this.state.deleteModalId });
            default:
                return false;
        }
    };
    handleDateTimeChange = (startDate, endDate) => {
        const {
            setStartDate,
            setEndDate,
            fetchLogs,
            applicationLog,
            currentProject,
            componentId,
        } = this.props;
        if (startDate && endDate) {
            startDate = moment(startDate);
            endDate = moment(endDate);
            setStartDate(startDate);
            setEndDate(endDate);
            fetchLogs(
                currentProject._id,
                componentId,
                applicationLog._id,
                0,
                10,
                startDate.clone().utc(),
                endDate.clone().utc()
            );
        }
    };
    handleLogTypeChange = logType => {
        this.setState({ logType });
    };
    handleLogFilterChange = filter => {
        this.setState({ filter });
    };
    editApplicationLog = () => {
        const { applicationLog } = this.props;
        this.props.editApplicationLogSwitch(applicationLog._id);
        // This is crashing
        // if (SHOULD_LOG_ANALYTICS) {
        //     logEvent(
        //         'EVENT: DASHBOARD > PROJECT > COMPONENT > APPLICATION LOG > EDIT APPLICATION LOG CLICKED',
        //         {}
        //     );
        // }
    };
    viewMore = () => {
        const { currentProject, componentId, applicationLog } = this.props;
        history.push(
            '/dashboard/project/' +
                currentProject._id +
                '/' +
                componentId +
                '/application-logs/' +
                applicationLog._id
        );
    };
    componentDidMount() {
        const {
            fetchStats,
            currentProject,
            applicationLog,
            componentId,
        } = this.props;
        fetchStats(currentProject._id, componentId, applicationLog._id);
    }
    render() {
        const {
            deleting,
            deleteModalId,
            openApplicationLogKeyModalId,
        } = this.state;
        const {
            applicationLog,
            componentId,
            currentProject,
            isDetails,
            stats,
        } = this.props;

        if (currentProject) {
            document.title = currentProject.name + ' Dashboard';
        }
        const logOptions = [
            { value: '', label: 'All Logs' },
            { value: 'warning', label: 'Warning' },
            { value: 'info', label: 'Info' },
            { value: 'error', label: 'Error' },
        ];
        if (applicationLog) {
            return (
                <div>
                    <div
                        className="Box-root Card-shadow--medium"
                        style={{ marginTop: '10px', marginBottom: '10px' }}
                        tabIndex="0"
                    >
                        <ShouldRender if={!applicationLog.editMode}>
                            <ApplicationLogHeader
                                applicationLog={applicationLog}
                                isDetails={this.props.isDetails}
                                openModal={this.props.openModal}
                                openApplicationLogKeyModalId={
                                    openApplicationLogKeyModalId
                                }
                                editApplicationLog={this.editApplicationLog}
                                deleteModalId={deleteModalId}
                                deleteApplicationLog={this.deleteApplicationLog}
                                deleting={deleting}
                                viewMore={this.viewMore}
                                resetApplicationLogKey={
                                    this.resetApplicationLogKey
                                }
                                stats={stats}
                            />
                        </ShouldRender>
                        <ShouldRender if={applicationLog.editMode}>
                            <NewApplicationLog
                                edit={applicationLog.editMode}
                                applicationLog={applicationLog}
                                index={applicationLog._id}
                                componentId={componentId}
                            />
                        </ShouldRender>

                        <ShouldRender if={!isDetails}>
                            <ApplicationLogDetailView
                                logValue={this.state.logType}
                                filter={this.state.filter}
                                applicationLog={applicationLog}
                                logOptions={logOptions}
                                componentId={componentId}
                                projectId={currentProject._id}
                                handleLogTypeChange={this.handleLogTypeChange}
                                handleLogFilterChange={
                                    this.handleLogFilterChange
                                }
                                handleDateTimeChange={this.handleDateTimeChange}
                                isDetails={isDetails}
                            />
                        </ShouldRender>
                    </div>
                    <ShouldRender if={this.props.isDetails}>
                        <div
                            className="Box-root Card-shadow--medium"
                            style={{
                                marginTop: '10px',
                                marginBottom: '10px',
                                paddingBottom: '10px',
                            }}
                            tabIndex="0"
                        >
                            <ApplicationLogDetailView
                                logValue={this.state.logType}
                                filter={this.state.filter}
                                applicationLog={applicationLog}
                                logOptions={logOptions}
                                componentId={componentId}
                                projectId={currentProject._id}
                                handleLogTypeChange={this.handleLogTypeChange}
                                handleLogFilterChange={
                                    this.handleLogFilterChange
                                }
                                handleDateTimeChange={this.handleDateTimeChange}
                                isDetails={isDetails}
                            />
                        </div>
                    </ShouldRender>
                </div>
            );
        } else {
            return null;
        }
    }
}
ApplicationLogDetail.displayName = 'ApplicationLogDetail';

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            openModal,
            closeModal,
            deleteApplicationLog,
            fetchLogs,
            resetApplicationLogKey,
            setStartDate,
            setEndDate,
            editApplicationLogSwitch,
            fetchStats,
        },
        dispatch
    );
};
function mapStateToProps(state, ownProps) {
    const applicationLogs =
        state.applicationLog.applicationLogsList.applicationLogs;
    const applicationLogFromRedux = applicationLogs.filter(
        applicationLog => applicationLog._id === ownProps.index
    );
    const stats = state.applicationLog.stats[ownProps.index];
    return {
        currentProject: state.project.currentProject,
        startDate: state.dateTime.dates.startDate,
        endDate: state.dateTime.dates.endDate,
        applicationLog: applicationLogFromRedux[0],
        editMode: applicationLogFromRedux[0].editMode,
        stats,
    };
}

ApplicationLogDetail.propTypes = {
    componentId: PropTypes.string,
    index: PropTypes.string,
    applicationLog: PropTypes.object,
    currentProject: PropTypes.object,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    resetApplicationLogKey: PropTypes.func,
    deleteApplicationLog: PropTypes.func,
    setStartDate: PropTypes.func,
    setEndDate: PropTypes.func,
    isDetails: PropTypes.bool,
    editApplicationLogSwitch: PropTypes.func,
    fetchStats: PropTypes.func,
    stats: PropTypes.object,
    fetchLogs: PropTypes.func,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ApplicationLogDetail);
