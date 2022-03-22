import winston from 'winston';

import Slack from 'winston-slack-transport';

if (
    process.env.PORT &&
    process.env.SLACK_ERROR_LOG_WEBHOOK &&
    process.env.SLACK_ERROR_LOG_CHANNEL
) {
    
    winston.add(Slack, {
        webhook_url: process.env.SLACK_ERROR_LOG_WEBHOOK,
        channel: '#' + process.env.SLACK_ERROR_LOG_CHANNEL,
        username: 'Error Bot',
        handleExceptions: true,
    });
}

export default {
    log: (functionName: $TSFixMe, error: $TSFixMe) => {
        error = error && error.message ? error.message : error;
        winston.error(
            JSON.stringify(
                {
                    error: String(error),
                    functionName: String(functionName),
                    stack: new Error().stack,
                },
                
                0,
                2
            )
        );
    },
};
