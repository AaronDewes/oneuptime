import React, { FunctionComponent, ReactElement, useEffect } from 'react';

import Page from 'CommonUI/src/Components/Page/Page';
import Route from 'Common/Types/API/Route';
import RouteMap, { RouteUtil } from '../../Utils/RouteMap';
import PageMap from '../../Utils/PageMap';
import PageLoader from 'CommonUI/src/Components/Loader/PageLoader';
import UserUtil from 'CommonUI/src/Utils/User';
import Navigation from 'CommonUI/src/Utils/Navigation';
import { ACCOUNTS_URL } from 'CommonUI/src/Config';
import UiAnalytics from 'CommonUI/src/Utils/Analytics';

const Logout: FunctionComponent = (): ReactElement => {
    useEffect(() => {
        UiAnalytics.logout();
        UserUtil.logout();
        Navigation.navigate(ACCOUNTS_URL);
    }, []);

    return (
        <Page
            title={'Logout'}
            breadcrumbLinks={[
                {
                    title: 'Admin Dashboard',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.INIT] as Route
                    ),
                },
                {
                    title: 'Logout',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.LOGOUT] as Route
                    ),
                },
            ]}
        >
            <PageLoader isVisible={true} />
        </Page>
    );
};

export default Logout;
