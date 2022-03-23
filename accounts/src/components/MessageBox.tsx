import React from 'react';
import PropTypes from 'prop-types';

interface MessageBoxProps {
    title?: string;
    message?: string;
    children?: React.ReactNode;
}

export default function MessageBox(props: MessageBoxProps) {
    return (
        <div id="main-body" className="box css">
            <div className="inner">
                <div id="success-step" className="request-reset-step step">
                    <div className="title">
                        <h2 style={{ marginBottom: 0 }}>{props.title}</h2>
                    </div>
                    <p className="message">
                        {props.message}
                        {props.children}
                    </p>
                </div>
            </div>
        </div>
    );
}

MessageBox.displayName = 'MessageBox';

MessageBox.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    children: PropTypes.node,
};
