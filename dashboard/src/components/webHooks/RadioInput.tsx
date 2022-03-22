import React from 'react';
import PropTypes from 'prop-types';

import { Field } from 'redux-form';

export function RadioInput({
    id,
    details,
    value
}: $TSFixMe) {
    return (
        <div
            className="bs-Fieldset-field"
            style={{ width: '100%', alignItems: 'center' }}
        >
            <Field
                component="input"
                type="radio"
                name="endpointType"
                id={id}
                value={value}
                className="Margin-right--12"
            />
            <label htmlFor={id}>{details}</label>
        </div>
    );
}

RadioInput.displayName = 'RadioInput';

RadioInput.propTypes = {
    id: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default RadioInput;
