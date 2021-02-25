import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import ShouldRender from '../basic/ShouldRender';
import { LargeSpinner } from '../basic/Loader';
import {
    getContainerSecurity,
    getContainerSecurityLog,
    scanContainerSecuritySuccess,
    getContainerSecuritySuccess,
} from '../../actions/security';
import ContainerSecurityView from './ContainerSecurityView';
import ContainerSecurityDeleteBox from './ContainerSecurityDeleteBox';
import SecurityLog from './SecurityLog';
import { getDockerCredentials } from '../../actions/credential';
import BreadCrumbItem from '../breadCrumb/BreadCrumbItem';
import getParentRoute from '../../utils/getParentRoute';
import { API_URL } from '../../config';
import io from 'socket.io-client';

// Important: Below `/api` is also needed because `io` constructor strips out the path from the url.
const socket = io.connect(API_URL.replace('/api', ''), {
    path: '/api/socket.io',
});

class ContainerSecurityDetail extends Component {
    componentDidMount() {
        const {
            projectId,
            componentId,
            containerSecurityId,
            getContainerSecurity,
            getContainerSecurityLog,
            getDockerCredentials,
        } = this.props;

        // get a particular container security
        getContainerSecurity({
            projectId,
            componentId,
            containerSecurityId,
        });

        // get a container security log
        getContainerSecurityLog({
            projectId,
            componentId,
            containerSecurityId,
        });

        getDockerCredentials({ projectId });
    }

    render() {
        const {
            containerSecurity,
            projectId,
            componentId,
            containerSecurityId,
            isRequesting,
            getContainerError,
            containerSecurityLog,
            gettingSecurityLog,
            gettingCredentials,
            fetchCredentialError,
            fetchLogError,
            location: { pathname },
            components,
            scanContainerSecuritySuccess,
            getContainerSecuritySuccess,
        } = this.props;

        socket.on(`security_${containerSecurity._id}`, data => {
            getContainerSecuritySuccess(data);
        });

        socket.on(`securityLog_${containerSecurity._id}`, data => {
            scanContainerSecuritySuccess(data);
        });

        const componentName =
            components.length > 0 ? components[0].name : 'loading...';

        return (
            <div className="Box-root Margin-bottom--12">
                <BreadCrumbItem
                    route={getParentRoute(pathname, null, 'component')}
                    name={componentName}
                />
                <BreadCrumbItem
                    route={getParentRoute(
                        pathname,
                        null,
                        'containerSecurityId'
                    )}
                    name="Container Security"
                />
                <BreadCrumbItem
                    route={pathname}
                    name={containerSecurity.name || 'loading...'}
                    pageTitle="Container Detail"
                    containerType="Container Security"
                />
                <ShouldRender
                    if={
                        isRequesting && gettingSecurityLog && gettingCredentials
                    }
                >
                    <div style={{ textAlign: 'center' }}>
                        <LargeSpinner />
                    </div>
                </ShouldRender>
                <ShouldRender
                    if={
                        containerSecurity.name &&
                        !gettingSecurityLog &&
                        !gettingCredentials
                    }
                >
                    <ContainerSecurityView
                        projectId={projectId}
                        componentId={componentId}
                        containerSecurityId={containerSecurityId}
                        isRequesting={isRequesting}
                        containerSecurity={containerSecurity}
                    />
                </ShouldRender>
                <ShouldRender
                    if={
                        containerSecurity.name &&
                        !gettingSecurityLog &&
                        !gettingCredentials
                    }
                >
                    <SecurityLog
                        type="Container"
                        containerSecurityLog={containerSecurityLog}
                    />
                </ShouldRender>
                <ShouldRender
                    if={
                        containerSecurity.name &&
                        !gettingSecurityLog &&
                        !gettingCredentials
                    }
                >
                    <ContainerSecurityDeleteBox
                        projectId={projectId}
                        componentId={componentId}
                        containerSecurityId={containerSecurityId}
                    />
                </ShouldRender>
                <ShouldRender
                    if={
                        !isRequesting &&
                        !gettingSecurityLog &&
                        !gettingCredentials &&
                        (getContainerError ||
                            fetchLogError ||
                            fetchCredentialError)
                    }
                >
                    {getContainerError || fetchLogError || fetchCredentialError}
                </ShouldRender>
            </div>
        );
    }
}

ContainerSecurityDetail.displayName = 'Container Security Detail';

ContainerSecurityDetail.propTypes = {
    getContainerSecurity: PropTypes.func,
    projectId: PropTypes.string,
    componentId: PropTypes.string,
    containerSecurityId: PropTypes.string,
    containerSecurity: PropTypes.object,
    isRequesting: PropTypes.bool,
    getContainerError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    getContainerSecurityLog: PropTypes.func,
    containerSecurityLog: PropTypes.object,
    gettingSecurityLog: PropTypes.bool,
    getDockerCredentials: PropTypes.func,
    gettingCredentials: PropTypes.bool,
    fetchLogError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    fetchCredentialError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    components: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        })
    ),
    scanContainerSecuritySuccess: PropTypes.func,
    getContainerSecuritySuccess: PropTypes.func,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getContainerSecurity,
            getContainerSecurityLog,
            getDockerCredentials,
            scanContainerSecuritySuccess,
            getContainerSecuritySuccess,
        },
        dispatch
    );

const mapStateToProps = (state, ownProps) => {
    const { componentId, containerSecurityId } = ownProps.match.params;

    const components = [];
    // filter to get the actual component
    state.component.componentList.components.map(item =>
        item.components.map(component => {
            if (String(component._id) === String(componentId)) {
                components.push(component);
            }
            return component;
        })
    );

    return {
        projectId:
            state.project.currentProject && state.project.currentProject._id,
        componentId,
        containerSecurityId,
        containerSecurity: state.security.containerSecurity,
        isRequesting: state.security.getContainer.requesting,
        getContainerError: state.security.getContainer.error,
        containerSecurityLog: state.security.containerSecurityLog || {},
        gettingSecurityLog: state.security.getContainerSecurityLog.requesting,
        fetchLogError: state.security.getContainerSecurityLog.error,
        gettingCredentials: state.credential.getCredential.requesting,
        fetchCredentialError: state.credential.getCredential.error,
        components,
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ContainerSecurityDetail)
);
