import React from 'react';
import { PropTypes } from 'prop-types';
import Fade from 'react-reveal/Fade';
import Dashboard from '../components/Dashboard';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import DeleteAccountBox from '../components/profileSettings/DeleteAccountBox';

const DeleteAccountPage = props => {
    const {
        location: { pathname },
    } = props;

    return (
        <Dashboard>
            <Fade>
                <BreadCrumbItem route={pathname} name="Advanced" />
                <div>
                    <div>
                        <div className="db-BackboneViewContainer">
                            <div className="react-settings-view react-view">
                                <span data-reactroot="">
                                    <div>
                                        <div>
                                            <div className="Box-root Margin-bottom--12">
                                                <DeleteAccountBox />
                                            </div>
                                        </div>
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>
        </Dashboard>
    );
};

DeleteAccountPage.displayName = 'DeleteAccountPage';

DeleteAccountPage.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
};

export default DeleteAccountPage;
