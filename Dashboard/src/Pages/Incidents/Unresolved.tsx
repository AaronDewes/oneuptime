import Page from 'CommonUI/src/Components/Page/Page';
import React, { FunctionComponent, ReactElement } from 'react';
import PageComponentProps from '../PageComponentProps';
import RouteMap, { RouteUtil } from '../../Utils/RouteMap';
import PageMap from '../../Utils/PageMap';
import Route from 'Common/Types/API/Route';
import IncidentsTable from '../../Components/Incident/IncidentsTable';
import SideMenu from './SideMenu';
import DashboardNavigation from '../../Utils/Navigation';
const IncidentsPage: FunctionComponent<PageComponentProps> = (
    props: PageComponentProps
): ReactElement => {
    return (
        <Page
            title={'Incidents'}
            sideMenu={<SideMenu project={props.currentProject || undefined} />}
            breadcrumbLinks={[
                {
                    title: 'Project',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.HOME] as Route
                    ),
                },
                {
                    title: 'Incidents',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.INCIDENTS] as Route
                    ),
                },
                {
                    title: 'Active Incidents',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.UNRESOLVED_INCIDENTS] as Route
                    ),
                },
            ]}
        >
            <IncidentsTable
                viewPageRoute={RouteUtil.populateRouteParams(
                    RouteMap[PageMap.INCIDENTS] as Route
                )}
                query={{
                    projectId: DashboardNavigation.getProjectId()?.toString(),
                    currentIncidentState: {
                        isResolvedState: false,
                    },
                }}
                noItemsMessage="Nice work! No Active Incidents so far."
                title="Active Incidents"
                description="Here is a list of all the Active Incidents for this project."
            />
        </Page>
    );
};

export default IncidentsPage;
