import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Fade from 'react-reveal/Fade';
import Dashboard from '../components/Dashboard';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS } from '../config';
import { getGitCredentials } from '../actions/credential';
import GitCredentialList from '../components/credential/GitCredentialList';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';
import TutorialBox from '../components/tutorial/TutorialBox';

class GitCredential extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    componentDidMount() {
        const { projectId, getGitCredentials } = this.props;

        if (SHOULD_LOG_ANALYTICS) {
            logEvent('Git Credential page Loaded');
        }

        // load all the Git Credentials
        getGitCredentials({ projectId });
    }

    render() {
        const {
            projectId,
            gitCredentials,
            getError,
            isRequesting,
            location: { pathname },
        } = this.props;

        return (
            <Dashboard>
                <Fade>
                    <BreadCrumbItem
                        route={getParentRoute(pathname)}
                        name="Project Settings"
                    />
                    <BreadCrumbItem route={pathname} name="Git Credentials" />
                    <div className="Margin-vertical--12">
                        <div>
                            <TutorialBox
                                type="gitCredentials"
                                currentProjectId={projectId}
                            />
                            <div
                                id="gitCredentialPage"
                                className="db-BackboneViewContainer"
                            >
                                <div className="react-settings-view react-view">
                                    <span>
                                        <GitCredentialList
                                            gitCredentials={gitCredentials}
                                            error={getError}
                                            projectId={projectId}
                                            isRequesting={isRequesting}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fade>
            </Dashboard>
        );
    }
}

GitCredential.displayName = 'Git Credential Page';

GitCredential.propTypes = {
    projectId: PropTypes.string,
    getGitCredentials: PropTypes.func,
    gitCredentials: PropTypes.array,
    getError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    isRequesting: PropTypes.bool,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
};

const mapStateToProps = state => {
    return {
        projectId:
        state.project.currentProject &&
            state.project.currentProject._id,
        gitCredentials: state.credential.gitCredentials,
        getError: state.credential.getCredential.error,
        isRequesting: state.credential.getCredential.requesting,
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators({ getGitCredentials }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GitCredential);
