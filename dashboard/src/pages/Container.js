import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import Fade from 'react-reveal/Fade';
import ContainerSecurityForm from '../components/security/ContainerSecurityForm';
import ContainerSecurity from '../components/security/ContainerSecurity';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS, REALTIME_URL } from '../config';
import {
    getContainerSecurities,
    getContainerSecurityLogs,
    scanContainerSecuritySuccess,
    getContainerSecuritySuccess,
} from '../actions/security';
import { fetchComponent } from '../actions/component';
import { LargeSpinner, ListLoader } from '../components/basic/Loader';
import ShouldRender from '../components/basic/ShouldRender';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';
import io from 'socket.io-client';
import sortByName from '../utils/sortByName';
import { history } from '../store';

// Important: Below `/realtime` is also needed because `io` constructor strips out the path from the url.
// '/realtime' is set as socket io namespace, so remove
const socket = io.connect(REALTIME_URL.replace('/realtime', ''), {
    path: '/realtime/socket.io',
    transports: ['websocket', 'polling'],
});

class Container extends Component {
    state = {
        showContainerSecurityForm: false,
        page: 1,
    };

    prevClicked = (projectId, componentId, skip, limit) => {
        this.props
            .getContainerSecurities({
                projectId,
                componentId,
                skip: (skip || 0) > (limit || 5) ? skip - limit : 0,
                limit,
                fetchingPage: true,
            })
            .then(() => {
                this.setState(prevState => {
                    return {
                        page:
                            prevState.page === 1
                                ? prevState.page
                                : prevState.page - 1,
                    };
                });
            });
    };

    nextClicked = (projectId, componentId, skip, limit) => {
        this.props
            .getContainerSecurities({
                projectId,
                componentId,
                skip: skip + limit,
                limit,
                fetchingPage: true,
            })
            .then(() => {
                this.setState(prevState => {
                    return {
                        page: prevState.page + 1,
                    };
                });
            });
    };

    componentDidMount() {
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('Container Security page Loaded');
        }
        const {
            projectId,
            componentId,
            getContainerSecurities,
            getContainerSecurityLogs,
            componentSlug,
            fetchComponent,
        } = this.props;
        if (projectId && componentSlug) {
            fetchComponent(projectId, componentSlug);
        }
        if (projectId && componentId) {
            // load container security logs
            getContainerSecurityLogs({ projectId, componentId });

            // load container security
            getContainerSecurities({
                projectId,
                componentId,
                skip: 0,
                limit: 5,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.projectId !== this.props.projectId ||
            prevProps.componentId !== this.props.componentId
        ) {
            const {
                projectId,
                componentId,
                getContainerSecurities,
                getContainerSecurityLogs,
            } = this.props;
            if (projectId && componentId) {
                // load container security logs
                getContainerSecurityLogs({ projectId, componentId });

                // load container security
                getContainerSecurities({
                    projectId,
                    componentId,
                    skip: 0,
                    limit: 5,
                });
            }
        }
        if (
            prevProps.projectId !== this.props.projectId ||
            prevProps.componentSlug !== this.props.componentSlug
        ) {
            const { projectId, fetchComponent, componentSlug } = this.props;
            if (projectId) {
                fetchComponent(projectId, componentSlug);
            }
        }
    }

    toggleForm = () =>
        this.setState(prevState => ({
            showContainerSecurityForm: !prevState.showContainerSecurityForm,
        }));

    render() {
        const {
            componentId,
            componentSlug,
            projectId,
            containerSecurities: securities,
            gettingContainerSecurities,
            gettingSecurityLogs,
            location: { pathname },
            component,
            scanContainerSecuritySuccess,
            getContainerSecuritySuccess,
            currentProject,
            switchToProjectViewerNav,
            skip,
            limit,
            count,
            fetchingPage,
            numberOfPage,
            error,
        } = this.props;

        const page = this.state.page;
        const canNext =
            securities && count && count > skip + limit ? true : false;
        const canPrev = securities && skip <= 0 ? false : true;
        const numberOfPages = numberOfPage
            ? numberOfPage
            : Math.ceil(parseInt(count) / limit);

        socket.on(`createContainerSecurity-${componentId}`, data => {
            history.push(
                `/dashboard/project/${this.props.slug}/component/${componentSlug}/security/container/${data.slug}`
            );
        });

        const containerSecurities = securities ? sortByName(securities) : [];
        containerSecurities.length > 0 &&
            containerSecurities.map(containerSecurity => {
                socket.on(`security_${containerSecurity._id}`, data => {
                    getContainerSecuritySuccess(data);
                });

                socket.on(`securityLog_${containerSecurity._id}`, data => {
                    scanContainerSecuritySuccess(data);
                });

                return containerSecurity;
            });

        const componentName = component ? component.name : '';
        const projectName = currentProject ? currentProject.name : '';

        const isEmpty = containerSecurities.length === 0;
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
                    route={getParentRoute(pathname, null, 'component')}
                    name={componentName}
                />
                <BreadCrumbItem
                    route={pathname}
                    name="Container Security"
                    pageTitle="Container"
                    addBtn={!isEmpty}
                    btnText="Create Container Security"
                    toggleForm={this.toggleForm}
                />
                <div className="Margin-vertical--12">
                    <div>
                        <div className="db-BackboneViewContainer">
                            <div className="react-settings-view react-view">
                                <ShouldRender
                                    if={
                                        gettingContainerSecurities &&
                                        gettingSecurityLogs
                                    }
                                >
                                    <div
                                        id="largeSpinner"
                                        style={{ textAlign: 'center' }}
                                    >
                                        <LargeSpinner />
                                    </div>
                                </ShouldRender>
                                <ShouldRender
                                    if={
                                        !gettingContainerSecurities &&
                                        !gettingSecurityLogs
                                    }
                                >
                                    {!this.state.showContainerSecurityForm &&
                                        !isEmpty &&
                                        containerSecurities.map(
                                            containerSecurity => {
                                                return (
                                                    <span
                                                        key={
                                                            containerSecurity._id
                                                        }
                                                    >
                                                        <div>
                                                            <div>
                                                                <ContainerSecurity
                                                                    name={
                                                                        containerSecurity.name
                                                                    }
                                                                    dockerRegistryUrl={
                                                                        containerSecurity.dockerRegistryUrl
                                                                    }
                                                                    imagePath={
                                                                        containerSecurity.imagePath
                                                                    }
                                                                    containerSecurityId={
                                                                        containerSecurity._id
                                                                    }
                                                                    containerSecuritySlug={
                                                                        containerSecurity.slug
                                                                    }
                                                                    projectId={
                                                                        projectId
                                                                    }
                                                                    componentId={
                                                                        componentId
                                                                    }
                                                                    componentSlug={
                                                                        componentSlug
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </span>
                                                );
                                            }
                                        )}
                                </ShouldRender>
                                <span>
                                    <div>
                                        <div>
                                            <ShouldRender
                                                if={
                                                    this.state
                                                        .showContainerSecurityForm ||
                                                    isEmpty
                                                }
                                            >
                                                <ContainerSecurityForm
                                                    componentId={componentId}
                                                    projectId={projectId}
                                                    toggleForm={this.toggleForm}
                                                    showCancelBtn={!isEmpty}
                                                />
                                            </ShouldRender>
                                        </div>
                                    </div>
                                </span>
                                <ShouldRender
                                    if={
                                        !gettingContainerSecurities &&
                                        !gettingSecurityLogs &&
                                        !this.state.showContainerSecurityForm &&
                                        !isEmpty
                                    }
                                >
                                    <div
                                        className="Box-root Card-shadow--medium"
                                        tabIndex="0"
                                    >
                                        <div className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween">
                                            <div className="Box-root Flex-flex Flex-alignItems--center Padding-all--20">
                                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                    <span>
                                                        <span
                                                            id={`containersecurity_count`}
                                                            className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap"
                                                        >
                                                            <ShouldRender
                                                                if={
                                                                    numberOfPages >
                                                                    0
                                                                }
                                                            >
                                                                Page{' '}
                                                                {page
                                                                    ? page
                                                                    : 1}{' '}
                                                                of{' '}
                                                                {numberOfPages}{' '}
                                                                (
                                                                <ShouldRender
                                                                    if={
                                                                        securities
                                                                    }
                                                                >
                                                                    <span id="numberOfContainerSecurities">
                                                                        {count}
                                                                    </span>{' '}
                                                                    {count > 1
                                                                        ? 'total container securities'
                                                                        : 'Container security'}{' '}
                                                                </ShouldRender>
                                                                )
                                                            </ShouldRender>
                                                            <ShouldRender
                                                                if={
                                                                    !(
                                                                        numberOfPages >
                                                                        0
                                                                    )
                                                                }
                                                            >
                                                                <span id="numberOfContainerSecurities">
                                                                    {count}{' '}
                                                                    {count > 1
                                                                        ? 'total container securities'
                                                                        : 'Container security'}
                                                                </span>
                                                            </ShouldRender>
                                                        </span>
                                                    </span>
                                                </span>
                                            </div>
                                            {fetchingPage ? (
                                                <ListLoader />
                                            ) : null}
                                            {error ? (
                                                <div
                                                    style={{
                                                        color: 'red',
                                                    }}
                                                >
                                                    {error}
                                                </div>
                                            ) : null}
                                            <div className="Box-root Padding-horizontal--20 Padding-vertical--16">
                                                <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                                    <div className="Box-root Margin-right--8">
                                                        <button
                                                            id="btnPrev"
                                                            onClick={() =>
                                                                this.prevClicked(
                                                                    projectId,
                                                                    componentId,
                                                                    skip,
                                                                    limit
                                                                )
                                                            }
                                                            className={
                                                                'Button bs-ButtonLegacy' +
                                                                (canPrev
                                                                    ? ''
                                                                    : 'Is--disabled')
                                                            }
                                                            disabled={!canPrev}
                                                            data-db-analytics-name="list_view.pagination.previous"
                                                            type="button"
                                                        >
                                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                                    <span>
                                                                        Previous
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                    <div className="Box-root">
                                                        <button
                                                            id="btnNext"
                                                            onClick={() =>
                                                                this.nextClicked(
                                                                    projectId,
                                                                    componentId,
                                                                    skip,
                                                                    limit
                                                                )
                                                            }
                                                            className={
                                                                'Button bs-ButtonLegacy' +
                                                                (canNext
                                                                    ? ''
                                                                    : 'Is--disabled')
                                                            }
                                                            disabled={!canNext}
                                                            data-db-analytics-name="list_view.pagination.next"
                                                            type="button"
                                                        >
                                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                                    <span>
                                                                        Next
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ShouldRender>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>
        );
    }
}

Container.displayName = 'Container Security Page';

Container.propTypes = {
    projectId: PropTypes.string,
    componentId: PropTypes.string,
    componentSlug: PropTypes.string,
    fetchComponent: PropTypes.func,
    slug: PropTypes.string,
    containerSecurities: PropTypes.array,
    getContainerSecurities: PropTypes.func,
    getContainerSecurityLogs: PropTypes.func,
    gettingSecurityLogs: PropTypes.bool,
    gettingContainerSecurities: PropTypes.bool,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    component: PropTypes.object,
    scanContainerSecuritySuccess: PropTypes.func,
    getContainerSecuritySuccess: PropTypes.func,
    currentProject: PropTypes.object.isRequired,
    switchToProjectViewerNav: PropTypes.bool,
    skip: PropTypes.number,
    limit: PropTypes.number,
    count: PropTypes.number,
    fetchingPage: PropTypes.bool,
    numberOfPage: PropTypes.number,
    error: PropTypes.oneOf([
        PropTypes.string,
        PropTypes.oneOfType([null, undefined]),
    ]),
};

const mapStateToProps = (state, ownProps) => {
    // ids from url
    const { componentSlug } = ownProps.match.params;

    return {
        projectId:
            state.project.currentProject && state.project.currentProject._id,
        componentId:
            state.component.currentComponent.component &&
            state.component.currentComponent.component._id,
        slug: state.project.currentProject && state.project.currentProject.slug,
        containerSecurities: state.security.containerSecurities.securities,
        gettingSecurityLogs: state.security.getContainerSecurityLog.requesting,
        gettingContainerSecurities: state.security.getContainer.requesting,
        component:
            state.component && state.component.currentComponent.component,
        componentSlug,
        currentProject: state.project.currentProject,
        switchToProjectViewerNav: state.project.switchToProjectViewerNav,
        skip: state.security.containerSecurities.skip,
        limit: state.security.containerSecurities.limit,
        count: state.security.containerSecurities.count,
        fetchingPage: state.security.containerSecurities.fetchingPage,
        error: state.security.getContainer.error,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getContainerSecurities,
            getContainerSecurityLogs,
            scanContainerSecuritySuccess,
            getContainerSecuritySuccess,
            fetchComponent,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(Container);
