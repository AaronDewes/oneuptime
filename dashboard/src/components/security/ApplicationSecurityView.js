import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { scanApplicationSecurity } from '../../actions/security';
import { openModal, closeModal } from '../../actions/modal';
import DeleteApplicationSecurity from '../modals/DeleteApplicationSecurity';
import SecurityDetail from './SecurityDetail';
import Badge from '../common/Badge';
import IssueIndicator from './IssueIndicator';
import { Spinner } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import EditApplicationSecurity from '../modals/EditApplicationSecurity';
import threatLevel from '../../utils/threatLevel';

const ApplicationSecurityView = ({
    isRequesting,
    applicationSecurityId,
    projectId,
    componentId,
    openModal,
    closeModal,
    securityLog,
    scanApplicationSecurity,
    scanning,
    applicationSecurity,
    scanError,
    activeApplicationSecurity,
}) => {
    const handleDelete = ({
        projectId,
        componentId,
        applicationSecurityId,
    }) => {
        openModal({
            id: applicationSecurityId,
            content: DeleteApplicationSecurity,
            propArr: [{ projectId, componentId, applicationSecurityId }],
        });
    };

    const handleEdit = ({ projectId, componentId, applicationSecurityId }) => {
        openModal({
            id: applicationSecurityId,
            content: EditApplicationSecurity,
            propArr: [{ projectId, componentId, applicationSecurityId }],
        });
    };

    const handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return closeModal({
                    id: applicationSecurityId,
                });
            default:
                return false;
        }
    };

    const status = securityLog.data
        ? threatLevel(securityLog.data.vulnerabilities)
        : 'no data';

    return (
        <div onKeyDown={handleKeyBoard} className="Box-root Margin-bottom--12">
            <div className="bs-ContentSection Card-root Card-shadow--medium">
                <div className="Box-root">
                    <div className="db-Trends-header">
                        <div className="db-Trends-title">
                            <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                                    <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                        <span
                                            id={`applicationSecurityHeader_${applicationSecurity.name}`}
                                            className="ContentHeader-title Text-color--dark Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap"
                                        >
                                            <IssueIndicator status={status} />
                                            <span
                                                id={`applicationSecurityTitle_${applicationSecurity.name}`}
                                                style={{
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {applicationSecurity.name}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                                        <ShouldRender
                                            if={
                                                applicationSecurity &&
                                                applicationSecurity.resourceCategoryId
                                            }
                                        >
                                            <div className="Box-root Padding-right--8">
                                                <Badge color={'slate5'}>
                                                    {applicationSecurity &&
                                                    applicationSecurity.resourceCategoryId
                                                        ? applicationSecurity
                                                              .resourceCategoryId
                                                              .name
                                                        : ''}
                                                </Badge>
                                            </div>
                                        </ShouldRender>
                                        <div className="Box-root">
                                            <Badge color={'green'}>
                                                Application Security
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bs-u-flex Flex-wrap--wrap bs-u-justify--between">
                            <div>
                                <div
                                    className="bs-Fieldset-row"
                                    style={{ padding: 0 }}
                                >
                                    <ShouldRender
                                        if={applicationSecurity.lastScan}
                                    >
                                        <label className="Text-fontWeight--medium">
                                            Last Scan:
                                        </label>
                                        <div className="Margin-left--2">
                                            <span className="value">{`${moment(
                                                applicationSecurity.lastScan
                                            ).fromNow()} (${moment(
                                                applicationSecurity.lastScan
                                            ).format(
                                                'MMMM Do YYYY, h:mm:ss a'
                                            )})`}</span>
                                        </div>
                                    </ShouldRender>
                                </div>
                                <div
                                    className="bs-Fieldset-row"
                                    style={{ padding: 0 }}
                                >
                                    <ShouldRender
                                        if={applicationSecurity.lastScan}
                                    >
                                        <label className="Text-fontWeight--medium">
                                            Next Scan:
                                        </label>
                                        <div className="Margin-left--2">
                                            <span className="value">{`${moment(
                                                applicationSecurity.lastScan
                                            )
                                                .add(24, 'hours')
                                                .format(
                                                    'MMMM Do YYYY, h:mm:ss a'
                                                )}`}</span>
                                        </div>
                                    </ShouldRender>
                                </div>
                            </div>
                            <div>
                                <ShouldRender
                                    if={
                                        (scanning &&
                                            String(applicationSecurityId) ===
                                                String(
                                                    activeApplicationSecurity
                                                )) ||
                                        applicationSecurity.scanning ||
                                        !applicationSecurity.lastScan
                                    }
                                >
                                    <button
                                        className="bs-Button bs-DeprecatedButton"
                                        disabled={
                                            scanning ||
                                            applicationSecurity.scanning ||
                                            !applicationSecurity.lastScan
                                        }
                                        id={`scanning_${applicationSecurity.name}`}
                                    >
                                        <Spinner
                                            style={{ stroke: '#8898aa' }}
                                        />
                                        <span>Scanning</span>
                                    </button>
                                </ShouldRender>
                                <ShouldRender
                                    if={
                                        (!scanning ||
                                            String(applicationSecurityId) !==
                                                String(
                                                    activeApplicationSecurity
                                                )) &&
                                        !applicationSecurity.scanning &&
                                        applicationSecurity.lastScan
                                    }
                                >
                                    <button
                                        className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--security-scan"
                                        type="button"
                                        onClick={() =>
                                            scanApplicationSecurity({
                                                projectId,
                                                applicationSecurityId,
                                            })
                                        }
                                        disabled={
                                            scanning &&
                                            String(applicationSecurityId) ===
                                                String(
                                                    activeApplicationSecurity
                                                )
                                        }
                                        id={`scan_${applicationSecurity.name}`}
                                    >
                                        <span>Scan</span>
                                    </button>
                                </ShouldRender>
                                <button
                                    className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--edit"
                                    type="button"
                                    onClick={() =>
                                        handleEdit({
                                            projectId,
                                            componentId,
                                            applicationSecurityId,
                                        })
                                    }
                                    id={`edit_${applicationSecurity.name}`}
                                >
                                    <span>Edit</span>
                                </button>
                                <button
                                    id="deleteApplicationSecurityBtn"
                                    className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--delete"
                                    disabled={isRequesting}
                                    onClick={() =>
                                        handleDelete({
                                            projectId,
                                            componentId,
                                            applicationSecurityId,
                                        })
                                    }
                                >
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-vertical--2"
                        style={{ boxShadow: 'none' }}
                    >
                        <div>
                            <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                <SecurityDetail
                                    applicationSecurityLog={securityLog}
                                    type="application"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--12">
                        <div className="bs-Tail-copy">
                            <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                <ShouldRender
                                    if={
                                        !isRequesting &&
                                        scanError &&
                                        String(applicationSecurityId) ===
                                            String(activeApplicationSecurity)
                                    }
                                >
                                    <div className="Box-root Margin-right--8">
                                        <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                                    </div>
                                    <div className="Box-root">
                                        <span style={{ color: 'red' }}>
                                            {scanError}
                                        </span>
                                    </div>
                                </ShouldRender>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ApplicationSecurityView.displayName = 'Application Security View';

ApplicationSecurityView.propTypes = {
    isRequesting: PropTypes.bool,
    applicationSecurityId: PropTypes.string,
    projectId: PropTypes.string,
    componentId: PropTypes.string,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    securityLog: PropTypes.object,
    scanApplicationSecurity: PropTypes.func,
    scanning: PropTypes.bool,
    applicationSecurity: PropTypes.object,
    scanError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    activeApplicationSecurity: PropTypes.string,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            openModal,
            closeModal,
            scanApplicationSecurity,
        },
        dispatch
    );

const mapStateToProps = state => {
    return {
        isRequesting: state.security.deleteApplication.requesting,
        securityLog: state.security.applicationSecurityLog || {},
        scanning: state.security.scanApplicationSecurity.requesting,
        scanError: state.security.scanApplicationSecurity.error,
        activeApplicationSecurity: state.security.activeApplicationSecurity,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ApplicationSecurityView);
