import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

export class RowData extends Component {
    render() {
        const { statusPage, projectId, subProjectId } = this.props;
        const monitorIds = statusPage.monitorIds;
        const gt = i => monitorIds && monitorIds.length > i;
        let monitors = gt(0) ? monitorIds[0].name : 'Not Yet Added';
        monitors += gt(1)
            ? ` and ${monitorIds.length - 1} other${gt(2) ? 's' : ''}`
            : '';
        const path = `/dashboard/project/${projectId}/sub-project/${subProjectId}/status-page/${statusPage._id}`;
        return (
            <tr
                className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink statusPageListItem"
                onClick={() => {
                    this.props.switchStatusPages(statusPage, path);
                }}
            >
                <td
                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                    style={{ height: '1px', minWidth: '270px' }}
                >
                    <div className="bs-ObjectList-cell bs-u-v-middle">
                        <div className="bs-ObjectList-cell-row bs-ObjectList-copy bs-is-highlighted">
                            {statusPage.name || 'Unknown'}
                        </div>
                        {statusPage.domains.length > 0 ? (
                            <div
                                id="domainSet"
                                className="bs-ObjectList-row db-UserListRow db-UserListRow--withNamebs-ObjectList-cell-row bs-is-muted"
                            >
                                {statusPage.domains[0].domain}
                            </div>
                        ) : (
                                <div
                                    id="domainNotSet"
                                    className="bs-ObjectList-row db-UserListRow db-UserListRow--withNamebs-ObjectList-cell-row bs-is-muted"
                                >
                                    Domain(s) not set yet
                                </div>
                            )}
                    </div>
                </td>
                <td
                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                    style={{ height: '1px', minWidth: '270px' }}
                >
                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                        <span className="db-ListViewItem-text Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <div className="Box-root Margin-right--16">
                                <span>
                                    {statusPage.description ||
                                        'No description added'}
                                </span>
                            </div>
                        </span>
                    </div>
                </td>
                <td
                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                    style={{ height: '1px', minWidth: '270px' }}
                >
                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                        <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <div className="Box-root Margin-right--16">
                                <span>{monitors}</span>
                            </div>
                        </span>
                    </div>
                </td>

                <td
                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                    style={{ height: '1px', minWidth: '270px' }}
                >
                    <div
                        className="db-ListViewItem-cellContent Box-root Padding-all--8 table-view-item-btn-cell"
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                        <span className="db-ListViewItem-text Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <div
                                className="Box-root"
                                style={{ marginRight: '4px' }}
                            >
                                <button
                                    className="Button"
                                    style={{ height: '48px' }}
                                    id="viewStatusPage"
                                >
                                    <span className="bs-Button">
                                        View Status Page
                                    </span>
                                </button>
                            </div>
                        </span>
                    </div>
                </td>
            </tr>
        );
    }
}

RowData.displayName = 'StatusPage RowData';

RowData.propTypes = {
    statusPage: PropTypes.object.isRequired,
    switchStatusPages: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    subProjectId: PropTypes.string.isRequired,
};

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(null, mapDispatchToProps)(RowData);
