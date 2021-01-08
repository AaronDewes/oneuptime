import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { history } from '../../store';

function HTD1() {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px', minWidth: '270px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                    <span>Team Member</span>
                </span>
            </div>
        </td>
    );
}

function HTD2() {
    return (
        <td
            className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-align--right Text-color--dark Text-display--block Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                    <span>Monitor</span>
                </span>
            </div>
        </td>
    );
}
function HTD3() {
    return (
        <td
            id="placeholder-left"
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{
                height: '1px',
                maxWidth: '48px',
                minWidth: '48px',
                width: '48px',
            }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
            </div>
        </td>
    );
}
function HTD4() {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                    <span>Alert via</span>
                </span>
            </div>
        </td>
    );
}

function HTD5() {
    return (
        <td
            id="placeholder-right"
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{
                height: '1px',
                maxWidth: '48px',
                minWidth: '48px',
                width: '48px',
            }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
            </div>
        </td>
    );
}

function HTD6() {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                    <span>Alert Sent</span>
                </span>
            </div>
        </td>
    );
}

function HTD7() {
    return (
        <td
            id="overflow"
            type="action"
            className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-align--right Text-color--dark Text-display--block Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
            </div>
        </td>
    );
}

function HTD9() {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                    <span>Event Type</span>
                </span>
            </div>
        </td>
    );
}

function HTD8() {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                    <span>Alert Status</span>
                </span>
            </div>
        </td>
    );
}

function TD1({ text, alertId }) {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
            style={{ height: '1px', minWidth: '270px' }}
        >
            <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                    {alertId ? (
                        <div
                            className="Box-root Margin-right--16"
                            style={{
                                cursor: 'pointer',
                            }}
                            onClick={e => {
                                e.stopPropagation();
                                history.push('/dashboard/profile/' + alertId);
                            }}
                        >
                            <img
                                src="/dashboard/assets/img/profile-user.svg"
                                className="userIcon"
                                alt=""
                                style={{ marginBottom: '-5px' }}
                            />
                            <span>{text}</span>
                        </div>
                    ) : (
                        <div className="Box-root Margin-right--16">
                            <img
                                src="/dashboard/assets/img/profile-user.svg"
                                className="userIcon"
                                alt=""
                            />
                            <span>{text}</span>
                        </div>
                    )}
                </span>
            </div>
        </td>
    );
}

TD1.propTypes = {
    text: PropTypes.any,
    alertId: PropTypes.any,
};

function TD2({ text }) {
    return (
        <td
            className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <span className="db-ListViewItem-link">
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                        <div className="Box-root">
                            <span>{text}</span>
                        </div>
                    </span>
                </div>
            </span>
        </td>
    );
}

TD2.propTypes = {
    text: PropTypes.any,
};

function TD3() {
    return (
        <td
            aria-hidden="true"
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{
                height: '1px',
                maxWidth: '48px',
                minWidth: '48px',
                width: '48px',
            }}
        >
            <span className="db-ListViewItem-link">
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    ⁣
                </div>
            </span>
        </td>
    );
}
function TD4({ text }) {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <span className="db-ListViewItem-link">
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                        <div className="Box-root Flex-flex">
                            <div className="Box-root Flex-flex">
                                <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                    <div
                                        className="Box-root Flex-flex Flex-alignItems--center"
                                        style={{ height: '100%' }}
                                    >
                                        <div className="Badge Badge--color--green Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                            <span className="Badge-text Text-color--green Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap">
                                                <span>{text}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </span>
                </div>
            </span>
        </td>
    );
}

TD4.propTypes = {
    text: PropTypes.any,
};

function TD5() {
    return (
        <td
            aria-hidden="true"
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{
                height: '1px',
                maxWidth: '48px',
                minWidth: '48px',
                width: '48px',
            }}
        >
            <span className="db-ListViewItem-link">
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    ⁣
                </div>
            </span>
        </td>
    );
}

function TD6({ text }) {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <span className="db-ListViewItem-link">
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                        <span>{moment(text).format('lll')}</span>
                    </span>
                </div>
            </span>
        </td>
    );
}

TD6.propTypes = {
    text: PropTypes.any,
};

function TD7({ text }) {
    return (
        <td
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{ height: '1px' }}
        >
            <span className="db-ListViewItem-link">
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                        <div className="Box-root Flex-flex">
                            <div className="Box-root Flex-flex">
                                <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                    <div
                                        className="Box-root Flex-flex Flex-alignItems--center"
                                        style={{ height: '100%' }}
                                    >
                                        <div
                                            className={`Badge ${
                                                text === 'Success'
                                                    ? 'Badge--color--green'
                                                    : 'Badge--color--red'
                                            } Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2`}
                                        >
                                            <span
                                                className={`Badge-text ${
                                                    text === 'Success'
                                                        ? 'Text-color--green'
                                                        : 'Text-color--red'
                                                } Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap`}
                                            >
                                                <span>{text}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </span>
                </div>
            </span>
        </td>
    );
}

TD7.propTypes = {
    text: PropTypes.any,
};

function TD8({ text }) {
    console.log('checking text: ', text);
    const incidentStatusColor = {
        identified: 'green',
        acknowledged: 'yellow',
        resolved: 'red',
    };
    const isIncidentStatus = Object.keys(incidentStatusColor).includes(text);

    return (
        <td
            aria-hidden="true"
            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
            style={{
                height: '1px',
            }}
        >
            <div className="db-ListViewItem-link">
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                        {isIncidentStatus ? (
                            <div
                                className={`Badge Badge--color--${incidentStatusColor[text]} Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2`}
                            >
                                <span
                                    className={`Badge-text Text-color--${incidentStatusColor[text]} Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap`}
                                >
                                    {text}
                                </span>
                            </div>
                        ) : (
                            <span className="Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap">
                                {text}
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </td>
    );
}

TD8.propTypes = {
    text: PropTypes.string,
};

function AlertTableHeader() {
    return (
        <tr className="Table-row db-ListViewItem db-ListViewItem-header">
            <HTD1 />
            <HTD2 />
            <HTD3 />
            <HTD4 />
            <HTD5 />
            <HTD6 />
            <HTD9 />
            <HTD8 />
        </tr>
    );
}

function AlertTableRows({ alerts }) {
    return alerts.length > 0
        ? alerts.map((alert, index) => (
              <tr
                  key={`alert ${index}`}
                  className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink"
              >
                  <TD1
                      text={alert.userId ? alert.userId.name : null}
                      alertId={
                          alert.userId && alert.userId._id
                              ? alert.userId._id
                              : null
                      }
                  />
                  <TD2 text={alert.monitorId ? alert.monitorId.name : null} />
                  <TD3 />
                  <TD4 text={alert.alertVia} />
                  <TD5 />
                  <TD6 text={alert.createdAt} />
                  <TD8 text={alert.eventType} />
                  <TD7 text={alert.alertStatus || alert.errorMessage} />
              </tr>
          ))
        : null;
}

HTD1.displayName = 'HTD1';
HTD2.displayName = 'HTD2';
HTD3.displayName = 'HTD3';
HTD4.displayName = 'HTD4';
HTD5.displayName = 'HTD5';
HTD6.displayName = 'HTD6';
HTD7.displayName = 'HTD7';
HTD8.displayName = 'HTD8';
HTD9.displayName = 'HTD8';
TD1.displayName = 'TD1';
TD2.displayName = 'TD2';
TD3.displayName = 'TD3';
TD4.displayName = 'TD4';
TD5.displayName = 'TD5';
TD6.displayName = 'TD6';
TD7.displayName = 'TD7';
AlertTableHeader.displayName = 'AlertTableHeader';

export {
    HTD1,
    HTD2,
    HTD3,
    HTD4,
    HTD5,
    HTD6,
    HTD7,
    HTD9,
    TD1,
    TD2,
    TD3,
    TD4,
    TD5,
    TD6,
    TD8,
    AlertTableHeader,
    AlertTableRows,
};
