import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'uuid... Remove this comment to see the full error message
import { v4 as uuidv4 } from 'uuid';

export class SwitchingModal extends React.Component {
    constructor(props: $TSFixMe) {
        super(props);
    }

    delay = (ms: $TSFixMe) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    componentDidMount() {
        this.delay(3000).then(o => o);
    }

    render() {
        return (
            <div className="ModalLayer-wash Box-root Flex-flex Flex-alignItems--flexStart Flex-justifyContent--center">
                <div
                    className="ModalLayer-contents"
                    tabIndex={-1}
                    style={{ marginTop: 71 }}
                >
                    <div className="Card-root Card-shadow--medium">
                        <div className="Box-root Padding-all--32">
                            <div className="Box-root Flex-flex Flex-alignItems--center Flex-direction--column Flex-justifyContent--flexStart">
                                <div className="Box-root Margin-bottom--12">
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
                                </div>
                                <div className="Box-root">
                                    <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                        <span>Switching projects…</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
SwitchingModal.displayName = 'ProjectSwitchingModal';

function mapValueToProps(value: $TSFixMe) {
    return function() {
        return { project: value };
    };
}

function mapDispatchToProps(dispatch: $TSFixMe) {
    return bindActionCreators({}, dispatch);
}

export default (value: $TSFixMe, props: $TSFixMe) => {
    return props.openModal({
        id: uuidv4(),
        content: connect(
            mapValueToProps(value),
            mapDispatchToProps
        )(SwitchingModal),
    });
};
