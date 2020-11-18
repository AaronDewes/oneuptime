/* eslint-disable no-console */
import React from 'react';
import * as moment from 'moment';
import Badge from '../common/Badge';
import PropTypes from 'prop-types';
import formatNumber from '../../utils/formatNumber';
import { history } from '../../store';
import ErrorEventUtil from '../../utils/ErrorEventUtil';
import ShouldRender from '../basic/ShouldRender';

function getComponentBadge(componentName) {
    return (
        <span className="Margin-right--8">
            <Badge>{componentName.substr(0, 1).toUpperCase()}</Badge>{' '}
            <span className="Padding-left--4">{componentName}</span>
        </span>
    );
}
getComponentBadge.displayName = 'getComponentBadge';

function viewMore(projectId, componentId, errorTrackerId, errorEventId) {
    return history.push(
        '/dashboard/project/' +
            projectId +
            '/' +
            componentId +
            '/error-trackers/' +
            errorTrackerId +
            '/events/' +
            errorEventId
    );
}
function isSelected(selectedErrorEvents, id) {
    return selectedErrorEvents.indexOf(id) > -1 ? true : false;
}
function ErrorTrackerIssue({
    projectId,
    componentId,
    errorTrackerIssue,
    errorTracker,
    selectErrorEvent,
    selectedErrorEvents,
}) {
    return (
        <tr className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink incidentListItem">
            <td
                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                style={{
                    height: '1px',
                }}
            >
                <div className="Padding-vertical--8 Flex-flex Flex-justifyContent--spaceBetween">
                    <div
                        style={{
                            height: '20px',
                            width: '10px',
                            backgroundColor: `${ErrorEventUtil.getExceptionColor(
                                errorTrackerIssue.type
                            )}`,
                            borderTopRightRadius: '5px',
                            borderBottomRightRadius: '5px',
                        }}
                    ></div>
                    <input
                        type="checkbox"
                        onChange={() => selectErrorEvent(errorTrackerIssue._id)}
                        checked={isSelected(
                            selectedErrorEvents,
                            errorTrackerIssue._id
                        )}
                    />
                </div>
            </td>
            <td
                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                style={{
                    height: '1px',
                    minWidth: '350px',
                }}
                onClick={() =>
                    viewMore(
                        projectId,
                        componentId,
                        errorTracker._id,
                        errorTrackerIssue.latestId
                    )
                }
            >
                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                    <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                        <div
                            className="Box-root Margin-right--16"
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <span className="Text-color--gray Flex-flex">
                                <ShouldRender if={errorTrackerIssue.ignored}>
                                    <img
                                        src="/dashboard/assets/img/mute.svg"
                                        alt=""
                                        style={{
                                            marginBottom: '-5px',
                                            height: '20px',
                                            width: '20px',
                                            marginRight: '10px',
                                        }}
                                    />
                                </ShouldRender>
                                <span className="Text-color--slate Text-fontSize--16 Padding-right--4">
                                    {errorTrackerIssue.name
                                        ? errorTrackerIssue.name
                                        : 'Unknown Error Event'}
                                </span>{' '}
                            </span>
                        </div>
                    </span>
                    <div>
                        <div
                            className="Box-root Flex"
                            style={{
                                paddingTop: '5px',
                            }}
                        >
                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                {errorTrackerIssue.description
                                    ? errorTrackerIssue.description.length > 100
                                        ? `${errorTrackerIssue.description.substr(
                                              0,
                                              100
                                          )} ...`
                                        : errorTrackerIssue.description
                                    : ''}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            className="Box-root Flex"
                            style={{
                                paddingTop: '5px',
                            }}
                        >
                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                <div
                                    className="Box-root Margin-right--16 Padding-right--12"
                                    style={{
                                        cursor: 'pointer',
                                    }}
                                >
                                    {getComponentBadge(
                                        errorTracker.componentId.name
                                    )}
                                    <img
                                        src="/dashboard/assets/img/time.svg"
                                        alt=""
                                        style={{
                                            marginBottom: '-5px',
                                            height: '15px',
                                            width: '15px',
                                        }}
                                    />
                                    <span className="Padding-left--8">
                                        {moment(
                                            errorTrackerIssue.latestOccurennce
                                        ).fromNow()}{' '}
                                        -{' '}
                                        {moment(
                                            errorTrackerIssue.earliestOccurennce
                                        ).fromNow()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
            <td
                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                style={{
                    height: '1px',
                }}
            >
                <div className="db-ListViewItem-link">
                    <div className="db-ListViewItem-cellContent  Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-justifyContent--center Flex-alignItems--center ">
                        <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            -
                        </span>
                    </div>
                </div>
            </td>
            <td
                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                style={{
                    height: '1px',
                }}
            >
                <div className="db-ListViewItem-link">
                    <div className="db-ListViewItem-cellContent  Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-justifyContent--center Flex-alignItems--center ">
                        <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            {formatNumber(
                                errorTrackerIssue.totalNumberOfEvents
                            )}
                        </span>
                    </div>
                </div>
            </td>
            <td
                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                style={{
                    height: '1px',
                }}
            >
                <div className="db-ListViewItem-link">
                    <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-justifyContent--center Flex-alignItems--center">
                        <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            0
                        </span>
                    </div>
                </div>
            </td>
            <td
                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                style={{
                    height: '1px',
                }}
            >
                <div className="db-ListViewItem-link">
                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8 Flex-flex Flex-justifyContent--center Flex-alignItems--center">
                        <img
                            src="/dashboard/assets/img/user.svg"
                            alt=""
                            style={{
                                marginBottom: '-5px',
                                height: '20px',
                                width: '20px',
                                marginRight: '10px',
                            }}
                        />
                        <img
                            src="/dashboard/assets/img/down.svg"
                            alt=""
                            style={{
                                marginBottom: '-5px',
                                height: '10px',
                                width: '10px',
                            }}
                        />
                    </div>
                </div>
            </td>
        </tr>
    );
}
ErrorTrackerIssue.propTypes = {
    errorTracker: PropTypes.object,
    errorTrackerIssue: PropTypes.object,
    projectId: PropTypes.string,
    componentId: PropTypes.string,
    selectErrorEvent: PropTypes.func,
    selectedErrorEvents: PropTypes.array,
};
ErrorTrackerIssue.displayName = 'ErrorTrackerIssue';
export default ErrorTrackerIssue;
