import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import MSTeamsList from './MSTeamsList';
import RenderIfAdmin from '../basic/RenderIfAdmin';
import MSTeamsButton from './MSTeamsButton';

class MSTeamsBox extends React.Component {
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
                                                <span>
                                                    Microsoft Teams Integration
                                                </span>
                                            </span>
                                            <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                <span>
                                                    Click{' '}
                                                    <a
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        href="https://github.com/Fyipe/feature-docs/blob/master/Webhooks.md#microsoft-teams"
                                                    >
                                                        here
                                                    </a>{' '}
                                                    to check documentation on
                                                    how to integrate Microsoft
                                                    Teams with Fyipe.
                                                </span>
                                            </span>
                                        </div>
                                        <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                                            <div className="Box-root">
                                                <RenderIfAdmin>
                                                    <MSTeamsButton
                                                        monitorId={
                                                            this.props.monitorId
                                                        }
                                                    />
                                                </RenderIfAdmin>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <MSTeamsList monitorId={this.props.monitorId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

MSTeamsBox.displayName = 'MSTeamsBox';

MSTeamsBox.propTypes = {
    monitorId: PropTypes.string,
};

export default withRouter(MSTeamsBox);
