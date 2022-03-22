import React from 'react';
import PropTypes from 'prop-types';

const ProcessedDescription = text => {
    if (!text || typeof text !== 'string') return text;

    const tempArr = text.split(/\[Learn more\]/i);
    return (
        <a
            href={tempArr[1]?.replace(/^\(|\)|\.$/gi, '')}
            rel="noopener noreferrer"
            target="_blank"
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                    <span>
                        {tempArr && tempArr[0]}{' '}
                        {tempArr && tempArr[1] ? <b>Learn more.</b> : null}
                    </span>
                </span>
            </div>
        </a>
    );
};

ProcessedDescription.displayName = 'ProcessedDescription';

const WebsiteIssuesList = ({ issues }) => {
    return (
        <div>
            <table id="websiteIssuesList" className="Table">
                <thead className="Table-body">
                    <tr className="Table-row db-ListViewItem db-ListViewItem-header">
                        <td
                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                            style={{ height: '1px', minWidth: '210px' }}
                        >
                            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                    <span>Title</span>
                                </span>
                            </div>
                        </td>
                        <td
                            className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                            style={{ height: '1px' }}
                        >
                            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                <span className="db-ListViewItem-text Text-align--left Text-color--dark Text-display--block Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                    <span>Description</span>
                                </span>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody className="Table-body">
                    {issues && issues.length > 0 ? (
                        issues.map((issue, i) => {
                            return (
                                <tr
                                    id={`website_issues_${i}`}
                                    key={i}
                                    className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink websiteIssuesListItem"
                                >
                                    <td
                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                        style={{
                                            height: '1px',
                                            width: '30%',
                                        }}
                                    >
                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                            <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                {issue.title}{' '}
                                                {issue.displayValue
                                                    ? `(${issue.displayValue})`
                                                    : null}
                                            </span>
                                        </div>
                                    </td>
                                    <td
                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                        style={{ height: '1px', width: '70%' }}
                                    >
                                        {ProcessedDescription(
                                            issue.description
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr></tr>
                    )}
                </tbody>
            </table>

            <div
                style={{
                    textAlign: 'center',
                    marginTop: '10px',
                    padding: '10px 20px 20px',
                }}
            >
                {!issues || !issues.length
                    ? "We don't have any issues yet"
                    : null}
            </div>
        </div>
    );
};

WebsiteIssuesList.displayName = 'IncidentTimelineList';

WebsiteIssuesList.propTypes = {
    issues: PropTypes.array,
};

export default WebsiteIssuesList;
