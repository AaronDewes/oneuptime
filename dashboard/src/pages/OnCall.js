import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Fade from 'react-reveal/Fade';
import {
    fetchProjectSchedule,
    fetchSubProjectSchedules,
    createSchedule,
    paginate,
} from '../actions/schedule';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { openModal, closeModal } from '../actions/modal';
import ScheduleProjectBox from '../components/schedule/ScheduleProjectBox';
import RenderIfUserInSubProject from '../components/basic/RenderIfUserInSubProject';
import ShouldRender from '../components/basic/ShouldRender';
import TutorialBox from '../components/tutorial/TutorialBox';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS } from '../config';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import { LoadingState } from '../components/basic/Loader';

export class OnCall extends Component {
    constructor(props) {
        super(props);
        this.state = { scheduleModalId: uuidv4() };
    }

    ready() {
        const { fetchSubProjectSchedules, currentProjectId } = this.props;
        fetchSubProjectSchedules(currentProjectId);
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('PAGE VIEW: DASHBOARD > PROJECT > CALL SCHEDULE LIST');
        }
    }

    componentDidMount() {
        if (this.props.currentProjectId) {
            this.ready();
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps?.currentProject?._id !== this.props?.currentProject?._id
        ) {
            this.ready();
        }
    }

    componentWillUnmount() {
        this.props.paginate('reset');
    }

    prevClicked = (subProjectId, skip, limit) => {
        const { fetchProjectSchedule, paginate } = this.props;

        fetchProjectSchedule(
            subProjectId,
            (skip || 0) > (limit || 10) ? skip - limit : 0,
            10
        );
        this.setState({ [subProjectId]: this.state[subProjectId] - 1 });
        paginate('prev');
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: CALL SCHEDULE > PREVIOUS PAGE');
        }
    };

    nextClicked = (subProjectId, skip, limit) => {
        const { fetchProjectSchedule, paginate } = this.props;

        fetchProjectSchedule(subProjectId, skip + limit, 10);
        this.setState({
            [subProjectId]: !this.state[subProjectId]
                ? 2
                : this.state[subProjectId] + 1,
        });
        paginate('next');
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: CALL SCHEDULE > NEXT PAGE');
        }
    };

    createSchedule = subProjectId => {
        const { createSchedule, history } = this.props;

        createSchedule(subProjectId, { name: 'Unnamed' }).then(({ data }) => {
            history.push(
                `/dashboard/project/${this.props.currentProject.slug}/schedule/${data[0].slug}`
            );
        });

        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: NEW CALL SCHEDULE CREATED');
        }
    };

    handleKeyBoard = e => {
        const schedulesPerPage = 10;
        const { subProjectSchedules, pages } = this.props;
        const canPaginateForward = subProjectSchedules.data
            ? subProjectSchedules.data.length >=
              (pages.counter + 1) * schedulesPerPage
            : null;
        const canPaginateBackward = pages.counter > 1;
        switch (e.key) {
            case 'ArrowRight':
                return canPaginateForward && this.props.paginate('next');
            case 'ArrowLeft':
                return canPaginateBackward && this.props.paginate('prev');
            default:
                return false;
        }
    };

    render() {
        const {
            isRequesting,
            subProjectSchedules,
            subProjects,
            currentProject,
            switchToProjectViewerNav,
            location: { pathname },
            currentProjectId,
        } = this.props;

        // Add Project Schedules to All Schedules List
        let projectSchedule =
            subProjectSchedules &&
            subProjectSchedules.find(
                subProjectSchedule =>
                    subProjectSchedule._id === currentProjectId
            );
        let { skip, limit } = projectSchedule || {};
        const { count } = projectSchedule || {};
        skip = parseInt(skip);
        limit = parseInt(limit);
        const schedules = projectSchedule ? projectSchedule.schedules : [];
        let canPaginateForward =
            projectSchedule && count && count > skip + limit ? true : false;
        let canPaginateBackward = projectSchedule && skip <= 0 ? false : true;
        const numberOfSchedules = schedules.length;

        if (projectSchedule && (isRequesting || !schedules)) {
            canPaginateForward = false;
            canPaginateBackward = false;
        }

        projectSchedule =
            projectSchedule && projectSchedule.schedules ? (
                <RenderIfUserInSubProject
                    subProjectId={currentProjectId}
                    key={() => uuidv4()}
                >
                    <div className="bs-BIM">
                        <div className="Box-root Margin-bottom--12">
                            <div className="bs-ContentSection Card-root Card-shadow--medium">
                                <ScheduleProjectBox
                                    projectId={currentProjectId}
                                    currentProject={currentProject}
                                    schedules={schedules}
                                    isRequesting={isRequesting}
                                    count={count}
                                    skip={skip}
                                    limit={limit}
                                    numberOfSchedules={numberOfSchedules}
                                    subProjectSchedule={projectSchedule}
                                    subProjectName={
                                        subProjects &&
                                        subProjects.find(
                                            obj => obj._id === currentProjectId
                                        )?.name
                                    }
                                    scheduleModalId={this.state.scheduleModalId}
                                    openModal={this.props.openModal}
                                    subProject={
                                        subProjects &&
                                        subProjects.find(
                                            obj => obj._id === currentProjectId
                                        )
                                    }
                                    prevClicked={this.prevClicked}
                                    nextClicked={this.nextClicked}
                                    canPaginateBackward={canPaginateBackward}
                                    canPaginateForward={canPaginateForward}
                                    subProjects={subProjects}
                                    allScheduleLength={
                                        subProjectSchedules.length
                                    }
                                    modalList={this.props.modalList}
                                    page={this.state[currentProjectId]}
                                />
                            </div>
                        </div>
                    </div>
                </RenderIfUserInSubProject>
            ) : (
                false
            );

        const allSchedules = projectSchedule && [projectSchedule];
        const projectName = currentProject ? currentProject.name : '';
        const projectId = currentProjectId;
        return (
            <Fade>
                <BreadCrumbItem
                    route="/"
                    name={projectName}
                    projectId={projectId}
                    slug={currentProject ? currentProject.slug : null}
                    switchToProjectViewerNav={switchToProjectViewerNav}
                />
                <BreadCrumbItem route={pathname} name="On-Call Duty" />
                <div
                    id="onCallSchedulePage"
                    tabIndex="0"
                    onKeyDown={this.handleKeyBoard}
                >
                    <div>
                        <div>
                            <ShouldRender
                                if={this.props.tutorialStat.callSchedule.show}
                            >
                                <TutorialBox
                                    type="call-schedule"
                                    currentProjectId={
                                        this.props.currentProjectId
                                    }
                                />
                            </ShouldRender>

                            {!this.props.isRequesting && allSchedules}
                        </div>
                    </div>
                </div>
                <ShouldRender if={this.props.isRequesting}>
                    <LoadingState />
                </ShouldRender>
            </Fade>
        );
    }
}

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            openModal,
            closeModal,
            fetchProjectSchedule,
            createSchedule,
            paginate,
            fetchSubProjectSchedules,
        },
        dispatch
    );

const mapStateToProps = state => {
    let subProjects = state.subProject.subProjects.subProjects;
    // sort subprojects names for display in alphabetical order
    const subProjectNames =
        subProjects && subProjects.map(subProject => subProject.name);
    subProjectNames && subProjectNames.sort();
    subProjects =
        subProjectNames &&
        subProjectNames.map(name =>
            subProjects.find(subProject => subProject.name === name)
        );
    const projectId = state.subProject.activeSubProject;
    const currentProjectId = projectId;
    const schedules = state.schedule.subProjectSchedules;

    // find project schedules or assign default value
    let projectSchedule = schedules.find(
        schedule => schedule._id === currentProjectId
    );
    projectSchedule = projectSchedule
        ? projectSchedule
        : {
              _id: currentProjectId,
              schedules: [],
              count: 0,
              skip: 0,
              limit: 10,
          };

    // find subproject schedules or assign default value
    const subProjectSchedules =
        subProjects &&
        subProjects.map(subProject => {
            const schedule = schedules.find(
                schedule => schedule._id === subProject._id
            );
            return schedule
                ? schedule
                : {
                      _id: subProject._id,
                      schedules: [],
                      count: 0,
                      skip: 0,
                      limit: 10,
                  };
        });

    subProjectSchedules && subProjectSchedules.unshift(projectSchedule);

    // try to get custom project tutorial by project ID
    const projectCustomTutorial = state.tutorial[projectId];

    // set a default show to true for the tutorials to display
    const tutorialStat = {
        callSchedule: { show: true },
    };
    // loop through each of the tutorial stat, if they have a value based on the project id, replace it with it
    for (const key in tutorialStat) {
        if (projectCustomTutorial && projectCustomTutorial[key]) {
            tutorialStat[key].show = projectCustomTutorial[key].show;
        }
    }

    return {
        currentProjectId,
        subProjectSchedules,
        isRequesting: state.schedule.schedules.requesting,
        pages: state.schedule.pages,
        projectId,
        subProjects,
        currentProject: state.project.currentProject,
        tutorialStat,
        modalList: state.modal.modals,
        switchToProjectViewerNav: state.project.switchToProjectViewerNav,
    };
};

OnCall.propTypes = {
    subProjectSchedules: PropTypes.array.isRequired,
    subProjects: PropTypes.array.isRequired,
    fetchProjectSchedule: PropTypes.func.isRequired,
    fetchSubProjectSchedules: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    currentProjectId: PropTypes.string.isRequired,
    isRequesting: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf([null, undefined]),
    ]),
    paginate: PropTypes.func.isRequired,
    createSchedule: PropTypes.func.isRequired,
    pages: PropTypes.object.isRequired,
    openModal: PropTypes.func.isRequired,
    currentProject: PropTypes.object.isRequired,
    tutorialStat: PropTypes.object,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    modalList: PropTypes.array,
    switchToProjectViewerNav: PropTypes.bool,
};

OnCall.displayName = 'OnCall';

export default connect(mapStateToProps, mapDispatchToProps)(OnCall);
