// fetches a list of records from the endpoint
const fetchList = (z: $TSFixMe, bundle: $TSFixMe) => {
    const options = {
        url: `${bundle.authData.serverUrl}/zapier/incidents`,
    };
    return z
        .request(options)
        .then((response: $TSFixMe) => JSON.parse(response.content));
};

export default {
    key: 'incidents',
    noun: 'incidents',
    display: {
        label: 'List of Incidents',
        description: 'List of incidents for dropdown',
        hidden: true,
    },

    operation: {
        // since this is a "hidden" trigger, there aren't any inputFields needed
        perform: fetchList,
        // the folowing is a "hint" to the Zap Editor that this trigger returns data "in pages", and
        //   that the UI should display an option to "load next page" to the human.
        canPaginate: false,
    },
};
