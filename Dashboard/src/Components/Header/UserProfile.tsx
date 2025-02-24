import React, { FunctionComponent, ReactElement, useState } from 'react';
import IconProp from 'Common/Types/Icon/IconProp';
import Route from 'Common/Types/API/Route';
import RouteMap, { RouteUtil } from '../../Utils/RouteMap';
import PageMap from '../../Utils/PageMap';
import BlankProfilePic from 'CommonUI/src/Images/users/blank-profile.svg';
import HeaderIconDropdownButton from 'CommonUI/src/Components/Header/HeaderIconDropdownButton';
import IconDropdownItem from 'CommonUI/src/Components/Header/IconDropdown/IconDropdownItem';
import IconDropdownMenu from 'CommonUI/src/Components/Header/IconDropdown/IconDropdownMenu';
import Navigation from 'CommonUI/src/Utils/Navigation';
import { ADMIN_DASHBOARD_URL } from 'CommonUI/src/Config';
import User from 'CommonUI/src/Utils/User';

export interface ComponentProps {
    onClickUserProfile: () => void;
}

const DashboardUserProfile: FunctionComponent<ComponentProps> = (
    props: ComponentProps
): ReactElement => {
    const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

    return (
        <>
            <HeaderIconDropdownButton
                iconImageUrl={BlankProfilePic}
                name="User Profile"
                showDropdown={isDropdownVisible}
                onClick={() => {
                    setIsDropdownVisible(true);
                }}
            >
                <IconDropdownMenu>
                    <IconDropdownItem
                        title="Profile"
                        onClick={() => {
                            setIsDropdownVisible(false);
                            props.onClickUserProfile();
                        }}
                        icon={IconProp.User}
                    />

                    {User.isMasterAdmin() ? (
                        <IconDropdownItem
                            title="Admin Settings"
                            onClick={() => {
                                setIsDropdownVisible(false);
                                Navigation.navigate(ADMIN_DASHBOARD_URL);
                            }}
                            icon={IconProp.Settings}
                        />
                    ) : (
                        <></>
                    )}

                    <IconDropdownItem
                        title="Log out"
                        onClick={() => {
                            setIsDropdownVisible(false);
                        }}
                        url={RouteUtil.populateRouteParams(
                            RouteMap[PageMap.LOGOUT] as Route
                        )}
                        icon={IconProp.Logout}
                    />
                </IconDropdownMenu>
            </HeaderIconDropdownButton>
        </>
    );
};

export default DashboardUserProfile;
