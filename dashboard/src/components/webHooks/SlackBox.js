import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import SlackList from './SlackList';
import RenderIfAdmin from '../basic/RenderIfAdmin';
import SlackButton from './SlackButton';

class SlackBox extends React.Component {
    render() {
        return (
            <div className="Box-root Margin-vertical--12">
                <div className="db-RadarRulesLists-page">
                    <div className="Box-root Margin-bottom--12">
                        <div className="bs-ContentSection Card-root Card-shadow--medium">
                            <div className="Box-root">
                                <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                                    <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                            <span className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--a1 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                                <span>Slack Integration</span>
                                            </span>
                                            <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                <span>
                                                    Integrate Fyipe with your
                                                    Slack.
                                                </span>
                                            </span>
                                        </div>
                                        <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                                            <div className="Box-root">
                                                <RenderIfAdmin>
                                                    <SlackButton
                                                        monitorId={
                                                            this.props.monitorId
                                                        }
                                                    />
                                                </RenderIfAdmin>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <SlackList monitorId={this.props.monitorId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SlackBox.displayName = 'SlackBox';

SlackBox.propTypes = {
    monitorId: PropTypes.string,
};

export default withRouter(SlackBox);
