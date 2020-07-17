import pages from './pages';
import { IS_SAAS_SERVICE } from './config';

const {
    Settings,
    TeamMembers,
    TeamMemberProfile,
    StatusPage,
    StatusPages,
    Profile,
    OnCall,
    Monitor,
    Component,
    AlertLog,
    IncidentLog,
    Incident,
    Billing,
    Monitors,
    Schedule,
    Integrations,
    EmailTemplates,
    SmsTemplates,
    Reports,
    MonitorView,
    WebsiteMonitorIssues,
    Probe,
    ProfileBilling,
    ApplicationLog,
    ApplicationLogView,
    Container,
    Application,
    ApplicationDetail,
    ContainerDetail,
    GitCredential,
    DockerCredential,
    FyipeApi,
    ChangePasswordSetting,
    DeleteAccountPage,
} = pages;

export const groups = [
    {
        group: 'VisibleOnComponentDetail',
        visible: true,
        visibleOnComponentDetail: true,
        routes: [
            {
                title: 'Monitors',
                path: '/dashboard/project/:projectId/:componentId/monitoring',
                icon: 'monitor',
                component: Monitor,
                exact: true,
                visible: true,
                subRoutes: [
                    {
                        title: 'Monitor View',
                        path:
                            '/dashboard/project/:projectId/:componentId/monitoring/:monitorId',
                        icon: 'monitor',
                        visible: true,
                        subRoutes: [],
                        component: MonitorView,
                        exact: true,
                        index: 1,
                    },
                    {
                        title: 'Website Issues',
                        path:
                            '/dashboard/project/:projectId/:componentId/monitoring/:monitorId/issues/:issueId',
                        icon: 'info',
                        visible: true,
                        subRoutes: [],
                        component: WebsiteMonitorIssues,
                        index: 2,
                    },
                ],
                index: 2,
            },
            {
                title: 'Incident Log',
                path: '/dashboard/project/:projectId/:componentId/incident-log',
                icon: 'info',
                visible: true,
                component: IncidentLog,
                subRoutes: [
                    {
                        title: 'Incident',
                        path:
                            '/dashboard/project/:projectId/:componentId/incidents/:incidentId',
                        icon: 'info',
                        visible: true,
                        subRoutes: [],
                        component: Incident,
                        index: 1,
                    },
                ],
                index: 3,
            },
            {
                title: 'Logs',
                path:
                    '/dashboard/project/:projectId/:componentId/application-log',
                icon: 'appLog',
                visible: true,
                exact: true,
                component: ApplicationLog,
                index: 4,
                subRoutes: [
                    {
                        title: 'Application Log View',
                        path:
                            '/dashboard/project/:projectId/:componentId/application-logs/:applicationLogId',
                        icon: 'radar',
                        visible: true,
                        subRoutes: [],
                        component: ApplicationLogView,
                        index: 1,
                    },
                ],
            },
            {
                title: 'Security',
                path:
                    '/dashboard/project/:projectId/:componentId/security/container',
                icon: 'security',
                visible: true,
                component: Container,
                exact: true,
                subRoutes: [
                    {
                        title: 'Container',
                        path:
                            '/dashboard/project/:projectId/:componentId/security/container',
                        icon: 'security',
                        visible: true,
                        subRoute: [],
                        component: Container,
                        index: 1,
                        exact: true,
                    },
                    {
                        title: 'Container Detail',
                        path:
                            '/dashboard/project/:projectId/:componentId/security/container/:containerSecurityId',
                        icon: 'info',
                        visible: true,
                        subRoute: [],
                        index: 2,
                        component: ContainerDetail,
                        exact: true,
                    },
                    {
                        title: 'Application',
                        path:
                            '/dashboard/project/:projectId/:componentId/security/application',
                        icon: 'security',
                        visible: true,
                        component: Application,
                        index: 3,
                        subRoute: [],
                        exact: true,
                    },
                    {
                        title: 'Application Detail',
                        path:
                            '/dashboard/project/:projectId/:componentId/security/application/:applicationSecurityId',
                        icon: 'info',
                        visible: true,
                        component: ApplicationDetail,
                        index: 4,
                        subRoute: [],
                        exact: true,
                    },
                ],
                index: 5,
            },
            {
                title: 'Back to Dashboard',
                path: '/dashboard/project/:projectId/components',
                icon: 'back',
                component: Component,
                visible: true,
                subRoutes: [],
                index: 6,
            },
        ],
    },
    {
        group: 'Products',
        visible: true,
        routes: [
            {
                title: 'Components',
                path: '/dashboard/project/:projectId/components',
                icon: 'square',
                component: Component,
                visible: true,
                exact: true,
                subRoutes: [],
                index: 1,
            },
            {
                title: 'Status Pages',
                path: '/dashboard/project/:projectId/status-pages',
                icon: 'radar',
                visible: true,
                subRoutes: [
                    {
                        title: 'Status Page',
                        path:
                            '/dashboard/project/:projectId/sub-project/:subProjectId/status-page/:scheduleId',
                        icon: 'radar',
                        visible: true,
                        subRoutes: [],
                        component: StatusPage,
                        index: 1,
                    },
                ],
                component: StatusPages,
                index: 3,
            },
            {
                title: 'Call Schedules',
                path: '/dashboard/project/:projectId/on-call',
                icon: 'connect',
                visible: true,
                subRoutes: [
                    {
                        title: 'Alert Log',
                        path: '/dashboard/project/:projectId/alert-log',
                        icon: 'info',
                        visible: true,
                        subRoutes: [],
                        component: AlertLog,
                        index: 1,
                    },
                    {
                        title: 'Schedule',
                        path:
                            '/dashboard/project/:projectId/sub-project/:subProjectId/schedule/:scheduleId',
                        icon: 'radar',
                        visible: true,
                        subRoutes: [],
                        component: Schedule,
                        index: 1,
                    },
                ],
                component: OnCall,
                index: 4,
            },
            {
                title: 'Reports',
                path: '/dashboard/project/:projectId/reports',
                icon: 'report',
                visible: true,
                subRoutes: [],
                component: Reports,
                index: 5,
            },
        ],
    },
    {
        group: 'Settings',
        visible: true,
        routes: [
            {
                title: 'Team Members',
                path: '/dashboard/project/:projectId/team',
                icon: 'customers',
                visible: true,
                component: TeamMembers,
                subRoutes: [],
                index: 1,
            },
            {
                title: 'Project Settings',
                path: '/dashboard/project/:projectId/settings',
                icon: 'businessSettings',
                exact: true,
                visible: true,
                subRoutes: [
                    {
                        title: 'Billing',
                        path: '/dashboard/project/:projectId/settings/billing',
                        icon: 'radar',
                        visible: IS_SAAS_SERVICE,
                        subRoutes: [],
                        component: Billing,
                        index: 1,
                    },
                    {
                        title: 'Monitors',
                        path: '/dashboard/project/:projectId/settings/monitors',
                        icon: 'monitor',
                        visible: true,
                        subRoutes: [],
                        component: Monitors,
                        index: 2,
                    },
                    {
                        title: 'Integrations',
                        path:
                            '/dashboard/project/:projectId/settings/integrations',
                        icon: 'radar',
                        visible: true,
                        subRoutes: [],
                        component: Integrations,
                        index: 3,
                    },
                    {
                        title: 'Email',
                        path: '/dashboard/project/:projectId/settings/emails',
                        icon: 'email',
                        visible: true,
                        subRoutes: [],
                        component: EmailTemplates,
                        index: 4,
                    },
                    {
                        title: 'SMS',
                        path: '/dashboard/project/:projectId/settings/sms',
                        icon: 'sms',
                        visible: true,
                        subRoutes: [],
                        component: SmsTemplates,
                        index: 5,
                    },
                    {
                        title: 'Probe',
                        path: '/dashboard/project/:projectId/settings/probe',
                        icon: 'radar',
                        visible: true,
                        subRoutes: [],
                        component: Probe,
                        index: 6,
                    },
                    {
                        title: 'Git Credentials',
                        path:
                            '/dashboard/project/:projectId/settings/gitCredential',
                        icon: 'git',
                        visible: true,
                        subRoutes: [],
                        component: GitCredential,
                        index: 7,
                    },
                    {
                        title: 'Docker Credentials',
                        path:
                            '/dashboard/project/:projectId/settings/dockerCredential',
                        icon: 'docker',
                        visible: true,
                        subRoutes: [],
                        component: DockerCredential,
                        index: 8,
                    },
                    {
                        title: 'API',
                        path: '/dashboard/project/:projectId/settings/api',
                        icon: 'apis',
                        visible: true,
                        subRoutes: [],
                        component: FyipeApi,
                        index: 9,
                    },
                ],
                component: Settings,
                index: 2,
            },
        ],
    },
    {
        group: 'VisibleOnProfile',
        visible: true,
        visibleOnProfile: true,
        routes: [
            {
                title: 'Profile Settings',
                path: '/dashboard/profile/settings',
                icon: 'user',
                visible: true,
                component: Profile,
                subRoutes: [],
                index: 1,
            },
            {
                title: 'Change Password',
                path: '/dashboard/profile/changePassword',
                icon: 'password',
                visible: true,
                component: ChangePasswordSetting,
                subRoutes: [],
                index: 2,
            },
            {
                title: 'Billing',
                path: '/dashboard/profile/billing',
                icon: 'receipt',
                visible: IS_SAAS_SERVICE,
                component: ProfileBilling,
                subRoutes: [],
                index: 3,
            },
            {
                title: 'Advanced',
                path: '/dashboard/profile/advanced',
                icon: 'businessSettings',
                visible: true,
                component: DeleteAccountPage,
                subRoutes: [],
                index: 4,
            },
            {
                title: 'Team Member Profile',
                path: '/dashboard/profile/:memberId',
                icon: 'user',
                visible: true,
                component: TeamMemberProfile,
                subRoutes: [],
                index: 5,
            },
            {
                title: 'Back to Dashboard',
                path: '/dashboard/project/:projectId/components',
                icon: 'back',
                component: Component,
                visible: true,
                subRoutes: [],
                index: 6,
            },
        ],
    },
];

const joinFn = (acc = [], curr) => {
    return acc.concat(curr);
};

export const allRoutes = groups
    .map(function merge(group) {
        const { routes } = group;
        const newRoutes = [];
        for (const route of routes) {
            newRoutes.push(route);
        }
        const subRoutes = newRoutes
            .map(route => {
                const newSubRoutes = [];
                for (const subRoute of route.subRoutes) {
                    newSubRoutes.push(subRoute);
                }
                return newSubRoutes;
            })
            .reduce(joinFn);
        return newRoutes.concat(subRoutes);
    })
    .reduce(joinFn);

export const getGroups = () => groups;

export default {
    groups,
    allRoutes,
};
