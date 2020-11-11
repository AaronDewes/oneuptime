import React, { Component } from 'react';
import Dropdown, { MenuItem } from '@trendmicro/react-dropdown';
import Badge from '../common/Badge';
// import PropTypes from 'prop-types';

class ErrorEventDetail extends Component {
    render() {
        return (
            <div className="bs-BIM">
                <div className="Box-root Margin-bottom--12">
                    <div className="bs-ContentSection Card-root Card-shadow--medium">
                        <div className="Box-root">
                            <div>
                                <div className="db-Trends-header">
                                    <div className="db-Trends-title">
                                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                            <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                                                <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                                    <span
                                                        id="application-content-header"
                                                        className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap"
                                                    >
                                                        <span
                                                            id={`application-log-title-`}
                                                        >
                                                            Type Error
                                                        </span>
                                                    </span>
                                                    <div className="Flex-flex Flex-alignItems--center">
                                                        <div
                                                            style={{
                                                                height: '12px',
                                                                width: '12px',
                                                                backgroundColor:
                                                                    'red',
                                                                borderRadius:
                                                                    '50%',
                                                            }}
                                                        ></div>{' '}
                                                        <span className="Text-fontSize--12 Margin-left--4">
                                                            Cannot set property
                                                            X of Y
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="Flex-flex">
                                                    <div className="Flex-flex Flex-direction--column Text-align--right Margin-horizontal--4">
                                                        <span className="Text-fontSize--11">
                                                            Events
                                                        </span>
                                                        <span
                                                            className="Text-fontSize--14"
                                                            style={{
                                                                color: 'blue',
                                                            }}
                                                        >
                                                            260
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="db-ListViewItem-cellContent Box-root Padding-vertical--8 Flex-flex">
                                                <button
                                                    className="bs-Button bs-Button--icon bs-Button--check"
                                                    type="button"
                                                >
                                                    <span>Resolve</span>
                                                    <img
                                                        src="/dashboard/assets/img/down.svg"
                                                        alt=""
                                                        style={{
                                                            margin: '0px 10px',
                                                            height: '10px',
                                                            width: '10px',
                                                        }}
                                                    />
                                                </button>
                                                <button
                                                    className="bs-Button bs-Button--icon bs-Button--block"
                                                    type="button"
                                                >
                                                    <span>Ignore</span>
                                                    <img
                                                        src="/dashboard/assets/img/down.svg"
                                                        alt=""
                                                        style={{
                                                            margin: '0px 10px',
                                                            height: '10px',
                                                            width: '10px',
                                                        }}
                                                    />
                                                </button>
                                                <button
                                                    className="bs-Button"
                                                    type="button"
                                                    disabled={true}
                                                >
                                                    <span>Merge</span>
                                                </button>
                                                <span className="Margin-left--8">
                                                    <Dropdown>
                                                        <Dropdown.Toggle
                                                            id="filterToggle"
                                                            className="bs-Button bs-DeprecatedButton"
                                                        />
                                                        <Dropdown.Menu>
                                                            <MenuItem title="clear">
                                                                Clear Filters
                                                            </MenuItem>
                                                            <MenuItem title="unacknowledged">
                                                                Unacknowledged
                                                            </MenuItem>
                                                            <MenuItem title="unresolved">
                                                                Unresolved
                                                            </MenuItem>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="Padding-all--20">
                                    <div className="Flex-flex Flex-justifyContent--spaceBetween">
                                        <div className="Flex-flex Flex-direction--column">
                                            <span>
                                                <span className="Text-fontWeight--bold">
                                                    Event
                                                </span>
                                                <span>
                                                    {' '}
                                                    EventID2345676543234567654
                                                </span>
                                            </span>
                                            <span>
                                                Oct 13, 2020 5:13:22 PM UTC
                                            </span>
                                        </div>
                                        <div className="Navigator-Btn-Group Text-fontWeight--bold Text-fontSize--12">
                                            <div className="Navigator-Oldest">
                                                <img
                                                    src="/dashboard/assets/img/previous.svg"
                                                    alt=""
                                                    style={{
                                                        height: '12px',
                                                        width: '12px',
                                                    }}
                                                />
                                            </div>
                                            <div>Older</div>
                                            <div className="Navigator-Disable">
                                                Newer
                                            </div>
                                            <div className="Navigator-Newest Navigator-Disable">
                                                <img
                                                    src="/dashboard/assets/img/next-disable.svg"
                                                    alt=""
                                                    style={{
                                                        height: '12px',
                                                        width: '12px',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Flex-flex Flex-justifyContent--spaceBetween Box-divider--border-top-1 Margin-top--16 Padding-vertical--20">
                                        <div className="Flex-flex">
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: '50px',
                                                    backgroundColor: '#F968BC',
                                                    borderRadius: '50%',
                                                    color: 'white',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '24px',
                                                }}
                                            >
                                                {' '}
                                                ?{' '}
                                            </div>
                                            <div className="Text-fontWeight--bold Margin-left--8">
                                                <p> 192.168.0.45 </p>
                                            </div>
                                        </div>
                                        <div className="Flex-flex">
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: '50px',
                                                    backgroundColor: '#488CE0',
                                                    borderRadius: '50%',
                                                    color: 'white',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '24px',
                                                }}
                                            >
                                                {' '}
                                                ?{' '}
                                            </div>
                                            <div className="Text-fontWeight--bold Margin-left--8">
                                                <p> Chrome </p>
                                                <p>
                                                    {' '}
                                                    Version:{' '}
                                                    <span className="Text-fontWeight--light">
                                                        {' '}
                                                        58.0.3
                                                    </span>{' '}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="Flex-flex">
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: '50px',
                                                    backgroundColor: 'grey',
                                                    borderRadius: '50%',
                                                    color: 'white',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '24px',
                                                }}
                                            >
                                                {' '}
                                                ?{' '}
                                            </div>
                                            <div className="Text-fontWeight--bold Margin-left--8">
                                                <p> Device </p>
                                                <p>
                                                    {' '}
                                                    Family:{' '}
                                                    <span className="Text-fontWeight--light">
                                                        {' '}
                                                        Android
                                                    </span>{' '}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Box-divider--border-top-1 Padding-vertical--20">
                                        <div>
                                            <p className="SubHeader">Tags</p>
                                        </div>
                                        <div className="Flex-flex Flex-wrap--wrap">
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    browser
                                                </div>
                                                <div className="Tag-Content">
                                                    Chrome Mobile
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    type
                                                </div>
                                                <div className="Tag-Content">
                                                    Exception
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    User IP
                                                </div>
                                                <div className="Tag-Content">
                                                    20.98.54.299
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    User Type
                                                </div>
                                                <div className="Tag-Content">
                                                    Client
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    test
                                                </div>
                                                <div className="Tag-Content">
                                                    Mobile
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    where
                                                </div>
                                                <div className="Tag-Content">
                                                    NG
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    Artist
                                                </div>
                                                <div className="Tag-Content">
                                                    The Weekend
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    User Type
                                                </div>
                                                <div className="Tag-Content">
                                                    Client
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    browser
                                                </div>
                                                <div className="Tag-Content">
                                                    Chrome Mobile
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    type
                                                </div>
                                                <div className="Tag-Content">
                                                    Exception
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    User IP
                                                </div>
                                                <div className="Tag-Content">
                                                    20.98.54.299
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    User Type
                                                </div>
                                                <div className="Tag-Content">
                                                    Client
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Box-divider--border-top-1 Padding-vertical--20">
                                        <div>
                                            <p className="SubHeader">
                                                Exception
                                            </p>
                                        </div>
                                        <div>
                                            <span className="Text-fontSize--14 Text-fontWeight--bold">
                                                TypeError
                                            </span>
                                            <span>
                                                {' '}
                                                Cant read property text of
                                                undefined
                                            </span>
                                        </div>
                                        <div className="Flex-flex Flex-wrap--wrap">
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    function
                                                </div>
                                                <div className="Tag-Content">
                                                    getUserDetails
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    handled
                                                </div>
                                                <div className="Tag-Content">
                                                    true
                                                </div>
                                            </div>
                                            <div className="Tag-Pill">
                                                <div className="Tag-Title">
                                                    platform
                                                </div>
                                                <div className="Tag-Content">
                                                    JavaScript
                                                </div>
                                            </div>
                                        </div>
                                        <div className="Stacktrace-Listing">
                                            <div>
                                                <span className="Text-fontWeight--bold">
                                                    /static/js/0.chunk.js
                                                    {'  '}
                                                </span>
                                                <img
                                                    src="/dashboard/assets/img/external.svg"
                                                    alt=""
                                                    style={{
                                                        height: '12px',
                                                        width: '12px',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                                {'  '}
                                                in{' '}
                                                <span className="Text-fontWeight--bold">
                                                    dispatchDiscreteEvent
                                                </span>{' '}
                                                at line{' '}
                                                <span className="Text-fontWeight--bold">
                                                    27925:7
                                                </span>
                                            </div>
                                            <div>
                                                <span className="Text-fontWeight--bold">
                                                    /static/js/0.chunk.js
                                                    {'  '}
                                                </span>
                                                <img
                                                    src="/dashboard/assets/img/external.svg"
                                                    alt=""
                                                    style={{
                                                        height: '12px',
                                                        width: '12px',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                                {'  '}
                                                in{' '}
                                                <span className="Text-fontWeight--bold">
                                                    dispatchDiscreteEvent
                                                </span>{' '}
                                                at line{' '}
                                                <span className="Text-fontWeight--bold">
                                                    27925:7
                                                </span>
                                            </div>
                                            <div>
                                                <span className="Text-fontWeight--bold">
                                                    /static/js/0.chunk.js
                                                    {'  '}
                                                </span>
                                                <img
                                                    src="/dashboard/assets/img/external.svg"
                                                    alt=""
                                                    style={{
                                                        height: '12px',
                                                        width: '12px',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                                {'  '}
                                                in{' '}
                                                <span className="Text-fontWeight--bold">
                                                    dispatchDiscreteEvent
                                                </span>{' '}
                                                at line{' '}
                                                <span className="Text-fontWeight--bold">
                                                    27925:7
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Box-divider--border-top-1 Padding-vertical--20">
                                        <div className="Flex-flex Flex-justifyContent--spaceBetween">
                                            <p className="SubHeader">
                                                Timeline
                                            </p>
                                            <span className="Margin-all--8">
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        id="filterToggle"
                                                        className="bs-Button bs-DeprecatedButton"
                                                        title={
                                                            'Sort By: Last Seen'
                                                        }
                                                    />
                                                    <Dropdown.Menu>
                                                        <MenuItem title="clear">
                                                            Clear Filters
                                                        </MenuItem>
                                                        <MenuItem title="unacknowledged">
                                                            Unacknowledged
                                                        </MenuItem>
                                                        <MenuItem title="unresolved">
                                                            Unresolved
                                                        </MenuItem>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </span>
                                        </div>
                                        <div className="Timeline-Table">
                                            <table className="Table">
                                                <thead className="Table-body">
                                                    <tr className="Table-row db-ListViewItem db-ListViewItem-header">
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                            style={{
                                                                height: '1px',
                                                                maxWidth:
                                                                    '48px',
                                                            }}
                                                        >
                                                            <div
                                                                className="db-ListViewItem-cellContent Padding-vertical--8 Flex-flex Flex-justifyContent--flexStart Flex-alignItems--center"
                                                                style={{
                                                                    height:
                                                                        '100%',
                                                                }}
                                                            >
                                                                Type
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                            style={{
                                                                height: '1px',
                                                                maxWidth:
                                                                    '48px',
                                                            }}
                                                        >
                                                            <div
                                                                className="db-ListViewItem-cellContent Padding-vertical--8 Flex-flex Flex-justifyContent--flexStart Flex-alignItems--center"
                                                                style={{
                                                                    height:
                                                                        '100%',
                                                                }}
                                                            >
                                                                Category
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                            style={{
                                                                height: '1px',
                                                                minWidth:
                                                                    '248px',
                                                            }}
                                                        >
                                                            <div
                                                                className="db-ListViewItem-cellContent Padding-vertical--8 Flex-flex Flex-justifyContent--flexStart Flex-alignItems--center"
                                                                style={{
                                                                    height:
                                                                        '100%',
                                                                }}
                                                            >
                                                                Description
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                            style={{
                                                                height: '1px',
                                                                maxWidth:
                                                                    '48px',
                                                            }}
                                                        >
                                                            <div
                                                                className="db-ListViewItem-cellContent Padding-vertical--8 Flex-flex Flex-justifyContent--flexStart Flex-alignItems--center"
                                                                style={{
                                                                    height:
                                                                        '100%',
                                                                }}
                                                            >
                                                                Level
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                            style={{
                                                                height: '1px',
                                                                maxWidth:
                                                                    '48px',
                                                            }}
                                                        >
                                                            <div
                                                                className="db-ListViewItem-cellContent Padding-vertical--8 Flex-flex Flex-justifyContent--flexStart Flex-alignItems--center"
                                                                style={{
                                                                    height:
                                                                        '100%',
                                                                }}
                                                            >
                                                                Time
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </thead>
                                                <tbody className="Table-body">
                                
                                                    <tr>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-left--20 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <img
                                                                                        src="/dashboard/assets/img/debugging.svg"
                                                                                        alt=""
                                                                                        style={{
                                                                                            height:
                                                                                                '35px',
                                                                                            width:
                                                                                                '35px',
                                                                                            padding:
                                                                                                '5px',
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <span>
                                                                                        {' '}
                                                                                        console{' '}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <span>
                                                                                        [object
                                                                                        Object],[object
                                                                                        Object],[object
                                                                                        Object],[object
                                                                                        Object],[object
                                                                                        Object],[object
                                                                                        Object]
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <Badge color="orange">
                                                                                        {' '}
                                                                                        warn{' '}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <span>
                                                                                        {' '}
                                                                                        08:22:30{' '}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>{' '}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-left--20 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <img
                                                                                        src="/dashboard/assets/img/user.svg"
                                                                                        alt=""
                                                                                        style={{
                                                                                            height:
                                                                                                '35px',
                                                                                            width:
                                                                                                '35px',
                                                                                            padding:
                                                                                                '5px',
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <span>
                                                                                        {' '}
                                                                                        ui.click{' '}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <span>
                                                                                        {` body > div#root >
                                                            div.App >
                                                            header#random.App-header.tested
                                                            > button`}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <Badge>
                                                                                        {' '}
                                                                                        info{' '}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="db-ListViewItem-link">
                                                                <div className="db-ListViewItem-cellContent Box-root Padding-horizontal--2 Padding-vertical--8 Flex-flex Flex-alignItems--center">
                                                                    <div>
                                                                        <div className="Box-root Flex-flex">
                                                                            <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                                <div className="Box-root Flex-inlineFlex Flex-alignItems--center Padding-right--8 Padding-vertical--2">
                                                                                    <span>
                                                                                        {' '}
                                                                                        08:22:30{' '}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>{' '}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
ErrorEventDetail.propTypes = {};
ErrorEventDetail.displayName = 'ErrorEventDetail';
export default ErrorEventDetail;
