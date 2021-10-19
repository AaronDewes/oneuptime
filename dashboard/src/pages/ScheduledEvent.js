import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fade from 'react-reveal/Fade';
import { connect } from 'react-redux';
import ScheduledEventBox from '../components/scheduledEvent/ScheduledEvent';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import ShouldRender from '../components/basic/ShouldRender';
import { LoadingState } from '../components/basic/Loader';

class ScheduledEvent extends Component {
    render() {
        const {
            location: { pathname },
            currentProject,
            switchToProjectViewerNav,
        } = this.props;
        const projectName = currentProject ? currentProject.name : '';
        const projectId = currentProject ? currentProject._id : '';
        return (
            <Fade>
                <BreadCrumbItem
                    route="/"
                    name={projectName}
                    projectId={projectId}
                    slug={currentProject ? currentProject.slug : null}
                    switchToProjectViewerNav={switchToProjectViewerNav}
                />
                <BreadCrumbItem
                    route={pathname}
                    name="Scheduled Maintenance Event"
                    pageTitle="Scheduled Event Detail"
                    containerType="Scheduled Maintenance Event"
                />
                <div id="scheduleEventsPage">
                    <ScheduledEventBox projectId={this.props.projectId} />
                </div>
                <ShouldRender if={this.props.requesting}>
                    <LoadingState />
                </ShouldRender>
            </Fade>
        );
    }
}

ScheduledEvent.displayName = 'ScheduledEvent';

const mapStateToProps = state => {
    return {
        projectId: state.subProject.activeSubProject,
        requesting: state.scheduledEvent.scheduledEventList.requesting,
        currentProject: state.project.currentProject,
        switchToProjectViewerNav: state.project.switchToProjectViewerNav,
    };
};

ScheduledEvent.propTypes = {
    projectId: PropTypes.string,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    requesting: PropTypes.bool,
    currentProject: PropTypes.object.isRequired,
    switchToProjectViewerNav: PropTypes.bool,
};

export default connect(mapStateToProps)(ScheduledEvent);
