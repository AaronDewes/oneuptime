import { combineReducers } from 'redux';
import component from './component';
import monitor from './monitor';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import alert from './alert';
import team from './team';
import modal from './modal';
import project from './project';
import schedule from './schedule';
import changePassword from './changePassword';
import statusPage from './statusPage';
import incident from './incident';
import report from './report';
import invoice from './invoice';
import profileSettings from './profile';
import feedback from './feedback';
import notifications from './notifications';
import slack from './slack';
import webHooks from './webHook';
import subProject from './subProject';
import emailTemplates from './emailTemplates';
import smsTemplates from './smsTemplates';
import subscriber from './subscriber';
import scheduledEvent from './scheduledEvent';
import resourceCategories from './resourceCategories';
import card from './card';
import page from './page';
import probe from './probe';
import version from './version';
import tutorial from './tutorial';
import dateTime from './dateTime';
import applicationLog from './applicationLog';
import security from './security';
import credential from './credential';
import msTeams from './msteams';
import slackWebhooks from './slackWebhooks';
import incidentPriorities from './incidentPriorities';
import incidentBasicSettings from './incidentBasicSettings';
import errorTracker from './errorTracker';
import incidentCommunicationSla from './incidentCommunicationSla';
import monitorSla from './monitorSla';
const appReducer = combineReducers({
    routing: routerReducer,
    form: formReducer,
    team,
    alert,
    modal,
    project,
    changePassword,
    component,
    monitor,
    resourceCategories,
    schedule,
    statusPage,
    incident,
    invoice,
    profileSettings,
    feedback,
    notifications,
    slack,
    slackWebhooks,
    webHooks,
    report,
    subProject,
    emailTemplates,
    smsTemplates,
    subscriber,
    scheduledEvent,
    card,
    page,
    probe,
    version,
    tutorial,
    dateTime,
    applicationLog,
    security,
    credential,
    msTeams,
    incidentPriorities,
    incidentBasicSettings,
    errorTracker,
    incidentSla: incidentCommunicationSla,
    monitorSla,
});

export default (state, action) => {
    if (action.type === 'CLEAR_STORE') {
        state = undefined;
    }
    return appReducer(state, action);
};
