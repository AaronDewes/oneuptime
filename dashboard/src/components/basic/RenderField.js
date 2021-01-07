import React from 'react';
import PropTypes from 'prop-types';

const RenderField = ({
    input,
    placeholder,
    type,
    meta,
    className,
    id,
    disabled,
    initialValue,
    style,
    required,
    autoFocus,
    parentStyle = {},
}) => (
    <span style={{ width: '100%', ...parentStyle }}>
        <span>
            <input
                {...input}
                type={type}
                placeholder={placeholder}
                className={className}
                id={id}
                disabled={disabled || false}
                defaultValue={initialValue}
                style={style || {}}
                required={required}
                autoFocus={autoFocus}
            />
        </span>
        <br />
        {meta.error && meta.touched && (
            <div
                className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart"
                style={{ ...style, marginTop: '5px', alignItems: 'center' }}
            >
                <div
                    className="Box-root Margin-right--8"
                    style={{ marginTop: '2px' }}
                >
                    <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                </div>
                <div className="Box-root">
                    <span id="field-error" style={{ color: 'red' }}>
                        {typeof meta.error === 'object'
                            ? meta.error.domain
                            : meta.error}
                    </span>
                </div>
            </div>
        )}
    </span>
);

RenderField.displayName = 'RenderField';

RenderField.propTypes = {
    initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    input: PropTypes.object.isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    meta: PropTypes.object.isRequired,
    rows: PropTypes.string,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    required: PropTypes.bool,
    autoFocus: PropTypes.bool,
    parentStyle: PropTypes.object,
};

RenderField.defaultProps = {
    required: false,
    autoFocus: false,
};

export { RenderField };
