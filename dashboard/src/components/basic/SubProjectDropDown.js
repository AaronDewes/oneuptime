import React, { useEffect, useRef, useState } from 'react';
import { PropTypes } from 'prop-types';

const DropDownMenu = ({ options, value, updateState, ready }) => {
    const [open, setOpen] = useState(false);
    const container = useRef(null);

    const handleClickOutside = event => {
        if (container.current && !container.current.contains(event.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            // clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });

    const onClick = val => {
        setOpen(false);
        updateState(val);
    };

    const sectionStyle = {
        display: 'inline-block',
        padding: '10px 15px 0px',
        fontWeight: 500,
        color: '#6b7c93',
    };

    const menuStyle = {
        padding: '10px 25px',
    };

    return (
        <div
            className="ddm-container"
            ref={container}
            style={{ minWidth: 250, fontSize: 15 }}
        >
            <button
                type="button"
                className="bs-Button bs-DeprecatedButton ddm-button"
                onClick={() => setOpen(!open)}
                style={{ minWidth: 250 }}
            >
                <div id="projectFilterToggle">{value}</div>
                <div className="caret-icon--down"></div>
            </button>
            {open && ready && (
                <div className="ddm-dropdown-wrapper" style={{ minWidth: 300 }}>
                    <div className="ddm-dropdown-menu">
                        <section>
                            <span style={sectionStyle}>Main Project</span>
                            <span
                                key={options[0]?.value}
                                className="ddm-dropdown-menu__item"
                                onClick={() => onClick(options[0]?.value)}
                                style={menuStyle}
                            >
                                {options[0]?.label}
                            </span>
                        </section>
                        {options && options.length > 1 && (
                            <section>
                                <span style={sectionStyle}>Sub Projects</span>
                                {options.map((data, index) =>
                                    index === 0 ? null : (
                                        <span
                                            key={data.value}
                                            className="ddm-dropdown-menu__item"
                                            onClick={() => onClick(data.value)}
                                            style={menuStyle}
                                        >
                                            {data.label}
                                        </span>
                                    )
                                )}
                            </section>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

DropDownMenu.displayName = 'DropDownMenu';

DropDownMenu.propTypes = {
    options: PropTypes.array,
    value: PropTypes.string,
    updateState: PropTypes.func,
    ready: PropTypes.bool,
};

export default DropDownMenu;
