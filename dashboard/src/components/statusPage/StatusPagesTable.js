import { v4 as uuidv4 } from 'uuid';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { history } from '../../store';
import PropTypes from 'prop-types';
import {
    switchStatusPage,
    fetchSubProjectStatusPages,
    fetchProjectStatusPage,
    paginate,
} from '../../actions/statusPage';
import { openModal, closeModal } from '../../actions/modal';
import Badge from '../common/Badge';
import StatuspageProjectBox from './StatuspageProjectBox';
import RenderIfUserInSubProject from '../basic/RenderIfUserInSubProject';
import ShouldRender from '../basic/ShouldRender';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS } from '../../config';

class StatusPagesTable extends Component {
    constructor(props) {
        super(props);
        this.state = { statusPageModalId: uuidv4() };
    }

    componentDidMount() {
        if (this.props.projectId) {
            this.props
                .fetchSubProjectStatusPages(this.props.projectId)
                .then(res => {
                    if (res.data.length > 0) {
                        res.data.forEach(proj => {
                            this.setState({ [proj._id]: 1 });
                        });
                    }
                });
        }
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'PAGE VIEW: DASHBOARD > PROJECT > STATUS PAGES > STATUS PAGE'
            );
        }
    }

    componentDidUpdate() {
        if (!this.state[this.props.projectId]) {
            this.props.subProjectStatusPages.forEach(proj => {
                this.setState({ [proj._id]: 1 });
            });
        }
    }

    switchStatusPages = (statusPage, path) => {
        this.props.switchStatusPage(statusPage);
        history.push(path);
    };

    prevClicked = (projectId, skip, limit) => {
        const { fetchProjectStatusPage, paginate } = this.props;

        fetchProjectStatusPage(
            projectId,
            false,
            (skip || 0) > (limit || 10) ? skip - limit : 0,
            10
        );
        this.setState({ [projectId]: this.state[projectId] - 1 });
        paginate('prev');
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > STATUS PAGES > FETCH PREV STATUS PAGE'
            );
        }
    };

    nextClicked = (projectId, skip, limit) => {
        const { fetchProjectStatusPage, paginate } = this.props;
        fetchProjectStatusPage(projectId, false, skip + limit, 10);
        this.setState({ [projectId]: this.state[projectId] + 1 });
        paginate('next');
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > STATUS PAGES > FETCH NEXT STATUS PAGE'
            );
        }
    };

    render() {
        const {
            subProjects,
            isRequesting,
            subProjectStatusPages,
            currentProject,
        } = this.props;
        const currentProjectId = currentProject ? currentProject._id : null;
        // SubProject StatusPages List
        const allStatusPages =
            subProjects &&
            subProjects.map((subProject, i) => {
                const subProjectStatusPage = subProjectStatusPages.find(
                    subProjectStatusPage =>
                        subProjectStatusPage._id === subProject._id
                );
                let { skip, limit } = subProjectStatusPage;
                const { count } = subProjectStatusPage;
                skip = parseInt(skip);
                limit = parseInt(limit);
                const statusPages = subProjectStatusPage.statusPages;
                let canPaginateForward =
                    statusPages && count && count > skip + limit ? true : false;
                let canPaginateBackward =
                    statusPages && skip <= 0 ? false : true;

                if (subProjectStatusPage && (isRequesting || !statusPages)) {
                    canPaginateForward = false;
                    canPaginateBackward = false;
                }
                return subProjectStatusPage &&
                    subProjectStatusPage.statusPages ? (
                    <RenderIfUserInSubProject
                        subProjectId={subProjectStatusPage._id}
                        key={i}
                    >
                        <div
                            id={'statusPageTable_' + i}
                            className="bs-BIM"
                            key={i}
                        >
                            <div className="Box-root Margin-bottom--12">
                                <div className="bs-ContentSection Card-root Card-shadow--medium">
                                    <ShouldRender if={subProjects.length > 0}>
                                        <div className="Box-root Padding-top--20 Padding-left--20">
                                            <Badge color={'blue'}>
                                                {subProject.name}
                                            </Badge>
                                        </div>
                                    </ShouldRender>
                                    <StatuspageProjectBox
                                        switchStatusPages={
                                            this.switchStatusPages
                                        }
                                        subProjectStatusPage={
                                            subProjectStatusPage
                                        }
                                        statusPages={statusPages}
                                        canPaginateBackward={
                                            canPaginateBackward
                                        }
                                        canPaginateForward={canPaginateForward}
                                        skip={skip}
                                        limit={limit}
                                        subProjectName={subProject.name}
                                        currentProjectId={currentProjectId}
                                        statusPageModalId={
                                            this.state.statusPageModalId
                                        }
                                        openModal={this.props.openModal}
                                        statusPage={this.props.statusPage}
                                        prevClicked={this.prevClicked}
                                        nextClicked={this.nextClicked}
                                        allStatusPageLength={
                                            subProjectStatusPages.length
                                        }
                                        modalList={this.props.modalList}
                                        project={currentProject}
                                        pages={
                                            this.state[subProjectStatusPage._id]
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </RenderIfUserInSubProject>
                ) : (
                    false
                );
            });

        // Add Project Statuspages to All Statuspages List
        let projectStatusPage = subProjectStatusPages.find(
            subProjectStatusPage =>
                subProjectStatusPage._id === currentProjectId
        );
        let { skip, limit } = projectStatusPage;
        const { count } = projectStatusPage;
        skip = parseInt(skip);
        limit = parseInt(limit);
        const statusPages = projectStatusPage.statusPages;
        let canPaginateForward =
            statusPages && count && count > skip + limit ? true : false;
        let canPaginateBackward = statusPages && skip <= 0 ? false : true;

        if (projectStatusPage && (isRequesting || !statusPages)) {
            canPaginateForward = false;
            canPaginateBackward = false;
        }
        projectStatusPage =
            projectStatusPage && projectStatusPage.statusPages ? (
                <RenderIfUserInSubProject
                    subProjectId={projectStatusPage._id}
                    key={() => uuidv4()}
                >
                    <div id="statusPageTable" className="bs-BIM">
                        <div className="Box-root Margin-bottom--12">
                            <div className="bs-ContentSection Card-root Card-shadow--medium">
                                <ShouldRender if={subProjects.length > 0}>
                                    <div className="Box-root Padding-top--20 Padding-left--20">
                                        <Badge color={'red'}>Project</Badge>
                                    </div>
                                </ShouldRender>
                                <StatuspageProjectBox
                                    switchStatusPages={this.switchStatusPages}
                                    subProjectStatusPage={projectStatusPage}
                                    statusPages={statusPages}
                                    canPaginateBackward={canPaginateBackward}
                                    canPaginateForward={canPaginateForward}
                                    skip={skip}
                                    limit={limit}
                                    subProjectName={
                                        currentProject
                                            ? currentProject.name
                                            : null
                                    }
                                    currentProjectId={currentProjectId}
                                    statusPageModalId={
                                        this.state.statusPageModalId
                                    }
                                    openModal={this.props.openModal}
                                    statusPage={this.props.statusPage}
                                    prevClicked={this.prevClicked}
                                    nextClicked={this.nextClicked}
                                    subProjects={subProjects}
                                    allStatusPageLength={
                                        subProjectStatusPages.length
                                    }
                                    modalList={this.props.modalList}
                                    project={currentProject}
                                    pages={this.state[projectStatusPage._id]}
                                    switchToProjectViewerNav={
                                        this.props.switchToProjectViewerNav
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </RenderIfUserInSubProject>
            ) : (
                false
            );

        allStatusPages && allStatusPages.unshift(projectStatusPage);

        return allStatusPages;
    }
}

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            openModal,
            closeModal,
            switchStatusPage,
            fetchSubProjectStatusPages,
            paginate,
            fetchProjectStatusPage,
        },
        dispatch
    );

function mapStateToProps(state) {
    const currentProject = state.project.currentProject;
    const currentProjectId = currentProject && currentProject._id;
    const statusPages = state.statusPage.subProjectStatusPages;

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

    // find project statuspages or assign default value
    let projectStatusPage = statusPages.find(
        statusPage => statusPage._id === currentProject._id
    );
    projectStatusPage = projectStatusPage
        ? projectStatusPage
        : {
              _id: currentProjectId,
              statusPages: [],
              count: 0,
              skip: 0,
              limit: 10,
          };

    // find subproject statuspages or assign default value
    const subProjectStatusPages = subProjects.map(subProject => {
        const statusPage = statusPages.find(
            statusPage => statusPage._id === subProject._id
        );
        return statusPage
            ? statusPage
            : {
                  _id: subProject._id,
                  statusPages: [],
                  count: 0,
                  skip: 0,
                  limit: 10,
              };
    });
    subProjectStatusPages.unshift(projectStatusPage);
    const searchValues = state.form.search && state.form.search.values;
    return {
        currentProject,
        subProjectStatusPages,
        statusPage: state.statusPage,
        isRequesting: state.statusPage.requesting,
        subProjects,
        modalList: state.modal.modals,
        switchToProjectViewerNav: state.project.switchToProjectViewerNav,
        searchValues,
    };
}

StatusPagesTable.propTypes = {
    subProjectStatusPages: PropTypes.array.isRequired,
    currentProject: PropTypes.object.isRequired,
    statusPage: PropTypes.object.isRequired,
    switchStatusPage: PropTypes.func.isRequired,
    fetchSubProjectStatusPages: PropTypes.func.isRequired,
    fetchProjectStatusPage: PropTypes.func.isRequired,
    paginate: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    isRequesting: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf([null, undefined]),
    ]),
    openModal: PropTypes.func.isRequired,
    subProjects: PropTypes.array.isRequired,
    modalList: PropTypes.array,
    switchToProjectViewerNav: PropTypes.bool,
};

StatusPagesTable.displayName = 'StatusPagesTable';

export default connect(mapStateToProps, mapDispatchToProps)(StatusPagesTable);
