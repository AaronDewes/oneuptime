import React from 'react';

export class IncidentPrioritiesList extends React.Component {
    render() {
        return (
            <div
                id="incidentPrioritiesList"
                className="bs-ContentSection-content Box-root"
            >
                <div className="bs-ObjectList db-UserList">
                    <div style={{ overflow: 'auto hidden' }}>
                        <div className="bs-ObjectList-rows">
                            <header className="bs-ObjectList-row bs-ObjectList-row--header">
                                <div className="bs-ObjectList-cell">
                                    Name
                                </div>
                                <div className="bs-ObjectList-cell">
                                    Action
                                </div>
                            </header>
                            {this.props.incidentPrioritiesList.map(
                                incidentPriority=> 
                                <div className="bs-ObjectList-row db-UserListRow db-UserListRow--withName">
                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                    <div className="bs-ObjectList-cell-row bs-ObjectList-copy bs-is-highlighted"></div>
                                    <div className="bs-ObjectList-row db-UserListRow db-UserListRow--withNamebs-ObjectList-cell-row bs-is-muted">
                                        {incidentPriority.name}
                                    </div>
                                </div>
                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                    <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                        <div className="Box-root">
                                            <button
                                                className="Button bs-ButtonLegacy"
                                                type="button"
                                            >
                                                <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                    <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                        <span>Edit</span>
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                        <div
                                            className="Box-root Margin-left--8"
                                            id="deleteMonitorCategoryBtn"
                                        >
                                            <button
                                                className="Button bs-ButtonLegacy"
                                                type="button"
                                            >
                                                <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                    <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                        <span>Delete</span>
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
