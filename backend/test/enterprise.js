try {
    require('./enterpriseUser.test');
    require('./enterpriseProject.test');
    require('./enterpriseComponent.test');
    require('./enterpriseMonitor.test');
    require('./enterpriseAlert.test');
    require('./enterpriseTeam.test');
    // require('./enterpriseDisableSignup.test');
    // require('./enterpriseIncidentAlerts.test');
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
}
