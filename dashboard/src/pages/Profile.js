import React from 'react';
import Zoom from 'react-reveal/Zoom';
import Dashboard from '../components/Dashboard';
import ProfileSetting from '../components/profileSettings/Profile';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import BreadCrumbs from '../components/breadCrumb/BreadCrumbs';
import { PropTypes } from 'prop-types';

const Profile = props => {
    const {
        location: { pathname },
    } = props;

    return (
        <Dashboard>
            <Zoom>
                <div className="db-World-contentPane Box-root Padding-bottom--48">
                    <BreadCrumbItem route={pathname} name="Profile Settings" />
                    <BreadCrumbs styles="breadCrumbContainer Card-shadow--medium db-mb" />
                    <div>
                        <div>
                            <div className="db-BackboneViewContainer">
                                <div className="react-settings-view react-view">
                                    <span data-reactroot="">
                                        <div>
                                            <div>
                                                <div className="Margin-vertical--12">
                                                    <ProfileSetting />
                                                </div>
                                            </div>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Zoom>
        </Dashboard>
    );
};

Profile.displayName = 'Profile';

Profile.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
};

export default Profile;
