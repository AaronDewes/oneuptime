import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IssueLabel from './IssueLabel';
import ShouldRender from '../basic/ShouldRender';
import { reduxForm, Field } from 'redux-form';
import { RenderSelect } from '../basic/RenderSelect';
import paginate from '../../utils/paginate';

const SecurityLog = ({
    type,
    applicationSecurityLog,
    containerSecurityLog,
    levelToFilter,
}) => {
    const [page, setPage] = useState(1);

    const severityLevel = [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Low', value: 'low' },
    ];

    let applicationLogs = [];
    if (applicationSecurityLog && applicationSecurityLog.data) {
        const data = applicationSecurityLog.data;
        applicationLogs = data.advisories;

        if (levelToFilter) {
            applicationLogs = data.advisories.filter(
                advisory => advisory.severity === levelToFilter
            );
        }

        applicationLogs = paginate(applicationLogs, page);
    }

    let containerLogs = [];
    if (containerSecurityLog && containerSecurityLog.data) {
        const data = containerSecurityLog.data;
        containerLogs = data.vulnerabilityData;

        if (levelToFilter) {
            containerLogs = data.vulnerabilityData.filter(
                log => log.severity === levelToFilter
            );
        }

        containerLogs = paginate(containerLogs, page);
    }

    const prev = () => setPage(page - 1);
    const next = () => setPage(page + 1);

    return (
        <div
            id="securityLog"
            className="bs-ContentSection Card-root Card-shadow--medium Margin-bottom--12"
        >
            <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                    <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                        <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                            <span>{type} Security Issues</span>
                        </span>
                        <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <span>
                                Here&#39;s a log of your {type.toLowerCase()}{' '}
                                security issues.
                            </span>
                        </span>
                    </div>
                    <div>
                        <Field
                            className="db-select-nw"
                            component={RenderSelect}
                            name="severity"
                            id="severityFilter"
                            placeholder="Filter Issues"
                            style={{
                                height: '28px',
                            }}
                            onChange={() => setPage(1)}
                            options={[
                                {
                                    value: '',
                                    label: 'Filter Issues',
                                },
                                ...severityLevel.map(severity => ({
                                    value: severity.value,
                                    label: severity.label,
                                })),
                            ]}
                        />
                    </div>
                </div>
            </div>
            <div className="bs-ContentSection Card-root Card-shadow--medium">
                <div>
                    <div style={{ overflow: 'hidden', overflowX: 'auto' }}>
                        <table className="Table">
                            <thead className="Table-body">
                                <tr className="Table-row db-ListViewItem db-ListViewItem-header">
                                    <td
                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                        style={{
                                            height: '1px',
                                            // minWidth: '210px',
                                        }}
                                    >
                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                            <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                                <span>status</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td
                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                        style={{ height: '1px' }}
                                    >
                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                            <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                                <span>issues</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td
                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                        style={{ height: '1px' }}
                                    >
                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                            <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                                <span>resolve by</span>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </thead>
                            <tbody className="Table-body">
                                <ShouldRender if={applicationSecurityLog}>
                                    {applicationSecurityLog &&
                                    applicationLogs.data &&
                                    applicationLogs.data.length > 0 ? (
                                        applicationLogs.data.map(advisory => {
                                            return (
                                                <tr
                                                    className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink incidentListItem"
                                                    onClick={() => {}}
                                                    style={{
                                                        borderBottom:
                                                            '2px solid #f7f7f7',
                                                    }}
                                                    key={advisory.id}
                                                >
                                                    <td
                                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                        style={{
                                                            height: '1px',
                                                            maxWidth: '150px',
                                                            width: '200px',
                                                        }}
                                                    >
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            <IssueLabel
                                                                level={
                                                                    advisory.severity
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                        style={{
                                                            height: '1px',
                                                            minWidth: '250px',
                                                        }}
                                                    >
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                {advisory.module_name ||
                                                                    advisory.name}
                                                            </span>
                                                            <br />
                                                            <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                {advisory.via.map(
                                                                    v =>
                                                                        advisory.severity ===
                                                                        v.severity
                                                                            ? v.title
                                                                            : ''
                                                                ) ||
                                                                    advisory.overview}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                        style={{
                                                            height: '1px',
                                                            minWidth: '250px',
                                                        }}
                                                    >
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                {advisory.recommendation ||
                                                                    'No resolution available at this point in time'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '15px 10px 0px',
                                                }}
                                                colSpan="3"
                                            >
                                                No security issue detected for
                                                this application
                                            </td>
                                        </tr>
                                    )}
                                </ShouldRender>
                                <ShouldRender if={containerSecurityLog}>
                                    {containerSecurityLog &&
                                    containerLogs.data &&
                                    containerLogs.data.length > 0 ? (
                                        containerLogs.data.map(
                                            (vulnerability, index) => {
                                                return (
                                                    <tr
                                                        className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink incidentListItem"
                                                        onClick={() => {}}
                                                        style={{
                                                            borderBottom:
                                                                '2px solid #f7f7f7',
                                                        }}
                                                        key={
                                                            vulnerability.vulnerabilityId +
                                                            index
                                                        }
                                                    >
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                            style={{
                                                                height: '1px',
                                                                maxWidth:
                                                                    '150px',
                                                                width: '200px',
                                                            }}
                                                        >
                                                            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                                <IssueLabel
                                                                    level={
                                                                        vulnerability.severity
                                                                    }
                                                                />
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                            style={{
                                                                height: '1px',
                                                                minWidth:
                                                                    '250px',
                                                            }}
                                                        >
                                                            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                                <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                    {
                                                                        vulnerability.library
                                                                    }{' '}
                                                                    (v.
                                                                    {
                                                                        vulnerability.installedVersion
                                                                    }
                                                                    )
                                                                </span>
                                                                <br />
                                                                <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                    {vulnerability.title ||
                                                                        vulnerability.description}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                            style={{
                                                                height: '1px',
                                                                minWidth:
                                                                    '250px',
                                                            }}
                                                        >
                                                            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                                <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                    {vulnerability.fixedVersions &&
                                                                        'Upgrade to version'}{' '}
                                                                    {vulnerability.fixedVersions ||
                                                                        'No resolution available at this point in time'}{' '}
                                                                    {vulnerability.fixedVersions &&
                                                                        'or later'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '15px 10px 0px',
                                                }}
                                                colSpan="3"
                                            >
                                                No security issue detected for
                                                this container
                                            </td>
                                        </tr>
                                    )}
                                </ShouldRender>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--12">
                <ShouldRender if={applicationSecurityLog}>
                    <div className="bs-Tail-copy">
                        <div
                            className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart"
                            style={{
                                textAlign: 'center',
                                marginTop: '10px',
                            }}
                        >
                            <div className="Box-root">
                                <span className="Text-fontWeight--medium">
                                    {applicationLogs.count
                                        ? applicationLogs.count
                                        : 0}{' '}
                                    Security Issue
                                    {applicationLogs.count > 1
                                        ? 's'
                                        : !applicationLogs.count ||
                                          applicationLogs.count === 0
                                        ? 's'
                                        : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </ShouldRender>
                <ShouldRender if={containerSecurityLog}>
                    <div className="bs-Tail-copy">
                        <div
                            className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart"
                            style={{
                                textAlign: 'center',
                                marginTop: '10px',
                            }}
                        >
                            <div className="Box-root">
                                <span className="Text-fontWeight--medium">
                                    {containerLogs.count
                                        ? containerLogs.count
                                        : 0}{' '}
                                    Security Issue
                                    {containerLogs.count > 1
                                        ? 's'
                                        : !containerLogs.count ||
                                          containerLogs.count === 0
                                        ? 's'
                                        : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </ShouldRender>
                <div>
                    <ShouldRender if={applicationSecurityLog}>
                        <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                            <div className="Box-root Margin-right--8">
                                <button
                                    id="btnPrev"
                                    className={`Button bs-ButtonLegacy ${!applicationLogs.pre_page &&
                                        'Is--disabled'}`}
                                    disabled=""
                                    type="button"
                                    onClick={prev}
                                >
                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                            <span>Previous</span>
                                        </span>
                                    </div>
                                </button>
                            </div>
                            <div className="Box-root">
                                <button
                                    id="btnNext"
                                    className={`Button bs-ButtonLegacy ${!applicationLogs.next_page &&
                                        'Is--disabled'}`}
                                    disabled=""
                                    type="button"
                                    onClick={next}
                                >
                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                            <span>Next</span>
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </ShouldRender>
                    <ShouldRender if={containerSecurityLog}>
                        <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                            <div className="Box-root Margin-right--8">
                                <button
                                    id="btnPrev"
                                    className={`Button bs-ButtonLegacy ${!containerLogs.pre_page &&
                                        'Is--disabled'}`}
                                    disabled=""
                                    type="button"
                                    onClick={prev}
                                >
                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                            <span>Previous</span>
                                        </span>
                                    </div>
                                </button>
                            </div>
                            <div className="Box-root">
                                <button
                                    id="btnNext"
                                    className={`Button bs-ButtonLegacy ${!containerLogs.next_page &&
                                        'Is--disabled'}`}
                                    disabled=""
                                    type="button"
                                    onClick={next}
                                >
                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                            <span>Next</span>
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </ShouldRender>
                </div>
            </div>
        </div>
    );
};

SecurityLog.displayName = 'SecurityLog';

SecurityLog.propTypes = {
    type: PropTypes.string,
    applicationSecurityLog: PropTypes.object,
    levelToFilter: PropTypes.string,
    containerSecurityLog: PropTypes.object,
};

const mapStateToProps = state => {
    return {
        levelToFilter:
            state.form.Filter &&
            state.form.Filter.values &&
            state.form.Filter.values.severity,
    };
};

const NewApplicationSecurityForm = reduxForm({
    form: 'Filter',
    destroyOnUnmount: true,
    enableReinitialize: true,
})(SecurityLog);

export default connect(mapStateToProps)(NewApplicationSecurityForm);
