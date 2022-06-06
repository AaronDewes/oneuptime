import React from 'react';
import PropTypes from 'prop-types';

function Badge({ children, color = 'green' }: $TSFixMe) {
    return (
        <div
            className={`Badge Badge--color--blue Box-background--${color} bg-${color}-700 Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2`}
        >
            <span
                className={`Badge-text bg-${color}-700 Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap`}
            >
                <span className="Text-color--white">{children}</span>
            </span>
        </div>
    );
}

Badge.displayName = 'Badge';

Badge.propTypes = {
    children: PropTypes.string,
    color: PropTypes.string,
};

export default Badge;
