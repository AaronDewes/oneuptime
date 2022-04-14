import React from 'react';

import { withRouter } from 'react-router-dom';
import { ListLoader } from '../basic/Loader';

class ZapierBox extends Component<ComponentProps> {
    state = {
        isLoading: true,
    };

    override componentDidMount() {
        const embededZapierTemplates = 7;
        const zapierEmbededWidget:string = `https://zapier.com/apps/embed/widget.js?services=oneuptime&limit=${embededZapierTemplates}&html_id=zapierId`;
        const script = document.createElement('script');

        script.async = true;
        script.src = zapierEmbededWidget;

        document.body.appendChild(script);
        this.setState({ isLoading: false });
    }

    override render() {
        const { isLoading } = this.state;

        return (
            <div className="Box-root Margin-vertical--12">
                <div className="db-RadarRulesLists-page">
                    <div className="Box-root Margin-bottom--12">
                        <div className="bs-ContentSection Card-root Card-shadow--medium">
                            <div className="Box-root">
                                <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                                    <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                            <span className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                                <span>Zapier Integration</span>
                                            </span>
                                            <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                <span>
                                                    Zapier templates you can use
                                                    to connect your app.
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="Box-root Margin-vertical--12 Padding-horizontal--20 Padding-vertical--16">
                                    {isLoading && <ListLoader />}
                                    <div id="zapierId"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


ZapierBox.displayName = 'ZapierBox';

export default withRouter(ZapierBox);
