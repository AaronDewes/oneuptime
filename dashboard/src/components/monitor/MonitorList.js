import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RenderIfUserInSubProject from '../basic/RenderIfUserInSubProject';
import MonitorDetail from './MonitorDetail';
import sortByName from '../../utils/sortByName';

export function MonitorList(props) {
    let monitorDetails = null;

    if (props.monitors && props.monitors.length > 0) {
        const monitors = sortByName(props.monitors);
        monitorDetails = monitors.map((monitor, i) => (
            <div id={`monitor${i}`} key={monitor._id}>
                <RenderIfUserInSubProject
                    subProjectId={monitor.projectId._id || monitor.projectId}
                >
                    <MonitorDetail
                        shouldRenderProjectType={props.shouldRenderProjectType}
                        projectName={props.projectName}
                        projectType={props.projectType}
                        componentId={props.componentId}
                        monitor={monitor}
                        index={monitor._id}
                        key={monitor._id}
                    />
                </RenderIfUserInSubProject>
            </div>
        ));
    }

    return monitorDetails;
}

MonitorList.displayName = 'MonitorList';

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

const mapStateToProps = state => ({
    currentProject: state.project.currentProject,
});

export default connect(mapStateToProps, mapDispatchToProps)(MonitorList);
