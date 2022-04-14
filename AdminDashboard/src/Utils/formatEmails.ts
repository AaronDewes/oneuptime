/**
 * format comma separated emails string
 *
 * @param {string} emails comma separated emails
 * @return {string} properly formatted emails
 */
const formatEmails: Function = (emails: $TSFixMe): void => {
    if (typeof emails !== 'string') {
        return;
    }
    // remove white spaces and replace the first and last commas, if available
    const trimmedEmailsList = emails.replace(/\s/g, '').replace(/^,*|,*$/g, '');
    // replace multiple commas with a single comma
    const formattedEmails = trimmedEmailsList.replace(/,{2,}/g, ',');

    return formattedEmails;
};

export default formatEmails;
