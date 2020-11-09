import React from 'react';

const loaderStyle = {
    backgroundColor: '#96d8ff',
};

export const FlatLoader = () => (
    <div className="ball-pulse">
        <div style={loaderStyle}></div>
        <div style={loaderStyle}></div>
        <div style={loaderStyle}></div>
    </div>
);

FlatLoader.displayName = 'FlatLoader';

export const FormLoader = () => (
    <div className="ball-beat">
        <div style={{ height: '8px', width: '8px' }}></div>
        <div style={{ height: '8px', width: '8px' }}></div>
        <div style={{ height: '8px', width: '8px' }}></div>
    </div>
);

FormLoader.displayName = 'FormLoader';

export const FormLoader2 = () => (
    <div className="ball-beat bs-size-btn">
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#000' }}
        ></div>
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#000' }}
        ></div>
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#000' }}
        ></div>
    </div>
);

FormLoader2.displayName = 'FormLoader2';

export const ListLoader = () => (
    <div
        className="ball-beat"
        style={{ textAlign: 'center', marginTop: '20px' }}
    >
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#4c4c4c' }}
        ></div>
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#4c4c4c' }}
        ></div>
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#4c4c4c' }}
        ></div>
    </div>
);

ListLoader.displayName = 'ListLoader';

export const TeamListLoader = () => (
    <div className="ball-beat" style={{ textAlign: 'center', width: '95px' }}>
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#4c4c4c' }}
        ></div>
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#4c4c4c' }}
        ></div>
        <div
            style={{ height: '8px', width: '8px', backgroundColor: '#4c4c4c' }}
        ></div>
    </div>
);

TeamListLoader.displayName = 'TeamListLoader';

// eslint-disable-next-line react/prop-types
export const Spinner = ({ style }) => (
    <div className="Spinner bs-SpinnerLegacy Spinner--color--white Box-root Flex-inlineFlex Flex-alignItems--center Flex-justifyContent--center">
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="Spinner-svg"
        >
            <ellipse
                cx={12}
                cy={12}
                rx={10}
                ry={10}
                className="Spinner-ellipse"
                style={{ ...style }}
            />
        </svg>
    </div>
);

Spinner.displayName = 'Spinner';

export const LargeSpinner = () => (
    <div className="Spinner bs-SpinnerLegacy Spinner--size--large Box-root Flex-inlineFlex Flex-alignItems--center Flex-justifyContent--center">
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="Spinner-svg"
        >
            <ellipse
                cx={12}
                cy={12}
                rx={10}
                ry={10}
                className="Spinner-ellipse"
            />
        </svg>
    </div>
);

LargeSpinner.displayName = 'LargeSpinner';

export const LoadingState = () => (
    <div className="Box-root Margin-bottom--12">
        <div className="bs-ContentSection Card-root Card-shadow--medium">
            <div className="Box-root">
                <div className="ContentState Box-root">
                    <div className="Box-root Padding-horizontal--20 Padding-vertical--48">
                        <div className="Box-root Flex-flex Flex-alignItems--center Flex-direction--column Flex-justifyContent--flexStart">
                            <div className="Box-root Margin-bottom--12">
                                <div className="Box-root">
                                    <div className="Spinner bs-SpinnerLegacy Spinner--size--large Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--center">
                                        <svg
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="Spinner-svg"
                                        >
                                            <ellipse
                                                cx={12}
                                                cy={12}
                                                rx={10}
                                                ry={10}
                                                className="Spinner-ellipse"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="Box-root">
                                <div className="Box-root">
                                    <span className="ContentState-title Text-align--center Text-color--secondary Text-display--block Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                        <span>Loading</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

LoadingState.displayName = 'LoadingState';
