import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import uuid from 'uuid';
import {
    updateStatusPageSetting,
    updateStatusPageSettingRequest,
    updateStatusPageSettingSuccess,
    updateStatusPageSettingError,
    addMoreDomain,
    cancelAddMoreDomain,
} from '../../actions/statusPage';
import { RenderField } from '../basic/RenderField';
import { Validate } from '../../config';
import { FormLoader } from '../basic/Loader';
import RenderIfSubProjectAdmin from '../basic/RenderIfSubProjectAdmin';
import ShouldRender from '../basic/ShouldRender';
import PropTypes from 'prop-types';
import IsAdminSubProject from '../basic/IsAdminSubProject';
import IsOwnerSubProject from '../basic/IsOwnerSubProject';
import { logEvent } from '../../analytics';
import {
    SHOULD_LOG_ANALYTICS,
    IS_LOCALHOST,
    IS_SAAS_SERVICE,
} from '../../config';
import {
    verifyDomain,
    createDomain,
    deleteDomain,
    updateDomain,
    createDomainFailure,
} from '../../actions/domain';
import { openModal, closeModal } from '../../actions/modal';
import VerifyDomainModal from './VerifyDomainModal';
import DeleteDomainModal from './DeleteDomainModal';

//Client side validation
// eslint-disable-next-line no-unused-vars
function validate(_values) {
    const error = undefined;
    return error;
}

export class Setting extends Component {
    state = {
        verifyModalId: uuid.v4(),
        deleteDomainModalId: uuid.v4(),
        fields: [],
    };

    submitForm = values => {
        const { fields } = this.state;
        const domains = [];
        for (const [key, value] of Object.entries(values)) {
            if (key.includes('domain') && !Validate.isDomain(value)) {
                throw new SubmissionError({ [key]: 'Domain is not valid.' });
            }
            if (key.includes('domain') && Validate.isDomain(value)) {
                domains.push({ domain: value });
            }
        }
        if (fields.length > 0) {
            fields.forEach((_field, index) => {
                if (!Object.keys(values).includes(`domain_${index + 1}`)) {
                    throw new SubmissionError({
                        [`domain_${index + 1}`]: 'Domain is required.',
                    });
                }
            });
        }

        if (fields.length > 0 && domains.length > 0) {
            return this.handleCreateDomain(domains);
        }

        const isChanged =
            JSON.stringify(this.props.initialFormValues) ===
            JSON.stringify(values);

        if (!isChanged) {
            let data = {};
            for (const property in values) {
                if (
                    this.props.initialFormValues[property] !== values[property]
                ) {
                    data = { domain: values[property], _id: property };
                }
            }
            this.handleUpdateDomain(data);
        }
    };

    handleCreateDomain = values => {
        const { reset } = this.props;
        const { _id, projectId } = this.props.statusPage.status;

        if (values.length === 0) return;

        const data = {
            domain: values,
            projectId: projectId._id || projectId,
            statusPageId: _id,
        };
        this.props.createDomain(data).then(() => {
            if (!this.props.addDomain.error) {
                this.setState({ fields: [] });
                reset();
            }
        });
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > STATUS PAGES > STATUS PAGE > DOMAIN UPDATED'
            );
        }
    };

    handleUpdateDomain = values => {
        const { reset } = this.props;
        const { _id, projectId } = this.props.statusPage.status;

        if (!values.domain) return;

        const data = {
            projectId: projectId._id || projectId,
            statusPageId: _id,
            domainId: values._id,
            newDomain: values.domain,
        };
        this.props.updateDomain(data).then(
            () => {
                reset();
            },
            function() {}
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > STATUS PAGES > STATUS PAGE > DOMAIN UPDATED'
            );
        }
    };

    handleVerifyDomain = (e, { domain, domainVerificationToken }) => {
        e.preventDefault();
        const { verifyDomain } = this.props;
        const { projectId } = this.props.statusPage.status;
        const thisObj = this;
        const token = domainVerificationToken.verificationToken; // get the verification token

        const data = {
            projectId: projectId._id || projectId,
            domainId: domainVerificationToken._id,
            payload: {
                domain,
                verificationToken: token,
            },
        };
        this.props.openModal({
            id: this.state.verifyModalId,
            onConfirm: () => {
                //Todo: handle the dispatch to domain verification
                return verifyDomain(data).then(() => {
                    if (this.props.verifyError) {
                        // prevent dismissal of modal if errored
                        return this.handleVerifyDomain();
                    }

                    if (window.location.href.indexOf('localhost') <= -1) {
                        thisObj.context.mixpanel.track('Domain verification');
                    }

                    this.props.closeModal({
                        id: this.state.deleteDomainModalId,
                    });
                });
            },
            content: VerifyDomainModal,
            propArr: [
                {
                    domain,
                    verificationToken: token,
                    _id: domainVerificationToken._id,
                },
            ], // data to populate the modal
        });
    };

    handleDeleteDomain = (e, domain) => {
        e.preventDefault();
        const { deleteDomain } = this.props;
        const { _id, projectId } = this.props.statusPage.status;
        const thisObj = this;

        const data = {
            projectId: projectId._id || projectId,
            statusPageId: _id,
            domainId: domain._id,
        };
        this.props.openModal({
            id: this.state.deleteDomainModalId,
            onConfirm: () => {
                //Todo: handle the dispatch to delete domain
                return deleteDomain(data).then(() => {
                    if (this.props.deleteDomainError) {
                        // prevent dismissal of modal if errored
                        return this.handleDeleteDomain();
                    }

                    if (window.location.href.indexOf('localhost') <= -1) {
                        thisObj.context.mixpanel.track('Delete domain');
                    }

                    this.props.closeModal({
                        id: this.state.deleteDomainModalId,
                    });
                });
            },
            content: DeleteDomainModal,
        });
    };

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return this.props.closeModal({
                    id: this.state.verifyModalId,
                });
            default:
                return false;
        }
    };

    renderNewDomainField = (publicStatusPageUrl, index) => (
        <div className="bs-Fieldset-row Margin-bottom--20" key={index}>
            <label className="bs-Fieldset-label">
                {' '}
                Your Status Page is hosted at{' '}
            </label>

            <div className="bs-Fieldset-fields">
                <Field
                    className="db-BusinessSettings-input TextInput bs-TextInput"
                    component={RenderField}
                    type="text"
                    name={`domain_${index}`}
                    id={`domain_${index}`}
                    disabled={this.props.statusPage.setting.requesting}
                    placeholder="domain"
                />
                <p className="bs-Fieldset-explanation" id="publicStatusPageUrl">
                    {IS_LOCALHOST && (
                        <span>
                            If you want to preview your status page. Please
                            check{' '}
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={publicStatusPageUrl}
                            >
                                {publicStatusPageUrl}{' '}
                            </a>
                        </span>
                    )}
                    {IS_SAAS_SERVICE && !IS_LOCALHOST && (
                        <span>
                            Add statuspage.fyipeapp.com to your CNAME. If you
                            want to preview your status page. Please check{' '}
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={publicStatusPageUrl}
                            >
                                {publicStatusPageUrl}{' '}
                            </a>
                        </span>
                    )}
                    {!IS_SAAS_SERVICE && !IS_LOCALHOST && (
                        <span>
                            If you want to preview your status page. Please
                            check{' '}
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={publicStatusPageUrl}
                            >
                                {publicStatusPageUrl}{' '}
                            </a>
                        </span>
                    )}
                </p>
                <div
                    className="bs-Fieldset-row"
                    style={{
                        padding: '5px 0 0 0',
                    }}
                >
                    <button
                        className="btnDeleteDomain bs-Button"
                        onClick={event => this.removeInputField(event)}
                    >
                        <span className="bs-Button--icon bs-Button--delete"></span>
                        <span>Delete Domain</span>
                    </button>
                </div>
            </div>
        </div>
    );

    renderAddDomainButton = publicStatusPageUrl => (
        <button
            id="addMoreDomain"
            className="bs-Button bs-Button--icon bs-Button--new"
            type="button"
            onClick={() => {
                this.props.createDomainFailure('');
                this.props.addMoreDomain();
                this.setState(prevState => {
                    return {
                        fields: [
                            ...prevState.fields,
                            this.renderNewDomainField(
                                publicStatusPageUrl,
                                prevState.fields.length + 1
                            ),
                        ],
                    };
                });
            }}
        >
            <span>Add Domain</span>
        </button>
    );

    removeInputField = event => {
        event.preventDefault();
        this.setState(prevState => {
            prevState.fields.pop();
            return {
                fields: [...prevState.fields],
            };
        });
    };

    render() {
        let statusPageId = '';
        let hosted = '';
        let publicStatusPageUrl = '';
        let { projectId } = this.props.statusPage.status;
        projectId = projectId ? projectId._id || projectId : null;
        if (
            this.props.statusPage &&
            this.props.statusPage.status &&
            this.props.statusPage.status._id
        ) {
            hosted = `${this.props.statusPage.status._id}.fyipeapp.com`;
        }
        if (
            this.props.statusPage &&
            this.props.statusPage.status &&
            this.props.statusPage.status._id
        ) {
            statusPageId = this.props.statusPage.status._id;
        }

        if (IS_LOCALHOST) {
            publicStatusPageUrl = `http://${statusPageId}.localhost:3006`;
        } else {
            publicStatusPageUrl =
                window.location.origin + '/status-page/' + statusPageId;
        }

        const { handleSubmit, subProjects, currentProject } = this.props;
        const currentProjectId = currentProject ? currentProject._id : null;
        let subProject =
            currentProjectId === projectId ? currentProject : false;
        if (!subProject)
            subProject = subProjects.find(
                subProject => subProject._id === projectId
            );

        return (
            <div
                onKeyDown={this.handleKeyBoard}
                className="bs-ContentSection Card-root Card-shadow--medium"
            >
                <div className="Box-root">
                    <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                        <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                            <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                <span className="ContentHeader-title Text-display--inline Text-fontSize--20 Text-fontWeight--regular Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                    <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                        Domain and CNAME Settings
                                    </span>
                                </span>
                                <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                    <span>
                                        Change the domain settings of where the
                                        status page will be hosted.
                                    </span>
                                </span>
                            </div>
                            <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                                <div className="Box-root">
                                    {this.renderAddDomainButton(
                                        publicStatusPageUrl
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(this.submitForm)}>
                        <div className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-horizontal--8 Padding-vertical--2">
                            <div>
                                <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                    <ShouldRender
                                        if={
                                            this.props.domains &&
                                            this.props.domains.length > 0
                                        }
                                    >
                                        {this.props.domains &&
                                            this.props.domains.map(domain => {
                                                return (
                                                    <fieldset
                                                        key={domain._id}
                                                        className="bs-Fieldset"
                                                        style={{ padding: 0 }}
                                                        name="added-domain"
                                                    >
                                                        <div className="bs-Fieldset-rows">
                                                            {IsAdminSubProject(
                                                                subProject
                                                            ) ||
                                                            IsOwnerSubProject(
                                                                subProject
                                                            ) ? (
                                                                <div className="bs-Fieldset-row">
                                                                    <label className="bs-Fieldset-label">
                                                                        Your
                                                                        Status
                                                                        Page is
                                                                        hosted
                                                                        at
                                                                    </label>

                                                                    <div className="bs-Fieldset-fields">
                                                                        <Field
                                                                            className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                            component={
                                                                                RenderField
                                                                            }
                                                                            type="text"
                                                                            name={
                                                                                domain._id
                                                                            }
                                                                            id={
                                                                                domain._id
                                                                            }
                                                                            disabled={
                                                                                this
                                                                                    .props
                                                                                    .statusPage
                                                                                    .setting
                                                                                    .requesting
                                                                            }
                                                                            placeholder="domain"
                                                                        />
                                                                        <p
                                                                            className="bs-Fieldset-explanation"
                                                                            id="publicStatusPageUrl"
                                                                        >
                                                                            {IS_LOCALHOST && (
                                                                                <span>
                                                                                    If
                                                                                    you
                                                                                    want
                                                                                    to
                                                                                    preview
                                                                                    your
                                                                                    status
                                                                                    page.
                                                                                    Please
                                                                                    check{' '}
                                                                                    <a
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        href={
                                                                                            publicStatusPageUrl
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            publicStatusPageUrl
                                                                                        }{' '}
                                                                                    </a>
                                                                                </span>
                                                                            )}
                                                                            {IS_SAAS_SERVICE &&
                                                                                !IS_LOCALHOST && (
                                                                                    <span>
                                                                                        Add
                                                                                        statuspage.fyipeapp.com
                                                                                        to
                                                                                        your
                                                                                        CNAME.
                                                                                        If
                                                                                        you
                                                                                        want
                                                                                        to
                                                                                        preview
                                                                                        your
                                                                                        status
                                                                                        page.
                                                                                        Please
                                                                                        check{' '}
                                                                                        <a
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            href={
                                                                                                publicStatusPageUrl
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                publicStatusPageUrl
                                                                                            }{' '}
                                                                                        </a>
                                                                                    </span>
                                                                                )}
                                                                            {!IS_SAAS_SERVICE &&
                                                                                !IS_LOCALHOST && (
                                                                                    <span>
                                                                                        If
                                                                                        you
                                                                                        want
                                                                                        to
                                                                                        preview
                                                                                        your
                                                                                        status
                                                                                        page.
                                                                                        Please
                                                                                        check{' '}
                                                                                        <a
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            href={
                                                                                                publicStatusPageUrl
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                publicStatusPageUrl
                                                                                            }{' '}
                                                                                        </a>
                                                                                    </span>
                                                                                )}
                                                                        </p>
                                                                        <div
                                                                            className="bs-Fieldset-row"
                                                                            style={{
                                                                                alignItems:
                                                                                    'center',
                                                                                paddingLeft: 0,
                                                                                paddingBottom: 0,
                                                                                paddingTop:
                                                                                    '5px',
                                                                            }}
                                                                        >
                                                                            <ShouldRender
                                                                                if={
                                                                                    domain &&
                                                                                    domain.domainVerificationToken &&
                                                                                    !domain
                                                                                        .domainVerificationToken
                                                                                        .verified
                                                                                }
                                                                            >
                                                                                <div
                                                                                    className="bs-Fieldset-row"
                                                                                    style={{
                                                                                        padding: 0,
                                                                                        marginRight:
                                                                                            '15px',
                                                                                    }}
                                                                                >
                                                                                    <button
                                                                                        id="btnVerifyDomain"
                                                                                        className="bs-Button"
                                                                                        onClick={e => {
                                                                                            this.handleVerifyDomain(
                                                                                                e,
                                                                                                domain
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        <span>
                                                                                            Verify
                                                                                            domain
                                                                                        </span>
                                                                                    </button>
                                                                                </div>
                                                                            </ShouldRender>
                                                                            <ShouldRender
                                                                                if={
                                                                                    this
                                                                                        .props
                                                                                        .domains &&
                                                                                    this
                                                                                        .props
                                                                                        .domains
                                                                                        .length >
                                                                                        0
                                                                                }
                                                                            >
                                                                                <div
                                                                                    className="bs-Fieldset-row"
                                                                                    style={{
                                                                                        padding: 0,
                                                                                    }}
                                                                                >
                                                                                    <button
                                                                                        className="btnDeleteDomain bs-Button"
                                                                                        onClick={e => {
                                                                                            //Todo: handle delete here
                                                                                            this.handleDeleteDomain(
                                                                                                e,
                                                                                                domain
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        <span className="bs-Button--icon bs-Button--delete"></span>
                                                                                        <span>
                                                                                            Delete
                                                                                            Domain
                                                                                        </span>
                                                                                    </button>
                                                                                </div>
                                                                            </ShouldRender>
                                                                        </div>
                                                                    </div>
                                                                    <ShouldRender
                                                                        if={
                                                                            domain
                                                                        }
                                                                    >
                                                                        <div
                                                                            className="bs-Fieldset-fields"
                                                                            style={{
                                                                                marginTop: 5,
                                                                            }}
                                                                        >
                                                                            {domain &&
                                                                            domain.domainVerificationToken &&
                                                                            !domain
                                                                                .domainVerificationToken
                                                                                .verified ? (
                                                                                <div className="Badge Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                                    <span
                                                                                        className="Badge-text Text-color--red Text-display--inline Text-fontSize--14 Text-fontWeight--bold Text-lineHeight--16 Text-wrap--noWrap pointer"
                                                                                        onClick={e => {
                                                                                            this.handleVerifyDomain(
                                                                                                e,
                                                                                                domain
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        Not
                                                                                        verified
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="Badge Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                                    <span className="Badge-text Text-color--green Text-display--inline Text-fontSize--14 Text-fontWeight--bold Text-lineHeight--16 Text-wrap--noWrap">
                                                                                        Verified
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </ShouldRender>
                                                                </div>
                                                            ) : (
                                                                <div className="bs-Fieldset-row">
                                                                    <label className="bs-Fieldset-label">
                                                                        Your
                                                                        Status
                                                                        Page is
                                                                        hosted
                                                                        at
                                                                    </label>
                                                                    <div className="bs-Fieldset-fields">
                                                                        <span
                                                                            className="value"
                                                                            style={{
                                                                                marginTop:
                                                                                    '6px',
                                                                            }}
                                                                        >
                                                                            {
                                                                                hosted
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </fieldset>
                                                );
                                            })}
                                    </ShouldRender>
                                    <ShouldRender
                                        if={
                                            this.props.domains &&
                                            this.props.domains.length === 0 &&
                                            this.state.fields.length === 0
                                        }
                                    >
                                        <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2 Padding-all--16 Text-align--center Padding-top--20">
                                            <span>No domains added</span>
                                        </div>
                                    </ShouldRender>
                                    {this.props.showDomainField && (
                                        <fieldset className="bs-Fieldset">
                                            <div className="bs-Fieldset-rows">
                                                {IsAdminSubProject(
                                                    subProject
                                                ) ||
                                                IsOwnerSubProject(
                                                    subProject
                                                ) ? (
                                                    this.state.fields
                                                ) : (
                                                    <div className="bs-Fieldset-row">
                                                        <label className="bs-Fieldset-label">
                                                            Your Status Page is
                                                            hosted at{' '}
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <span
                                                                className="value"
                                                                style={{
                                                                    marginTop:
                                                                        '6px',
                                                                }}
                                                            >
                                                                {hosted}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </fieldset>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--12">
                            <span className="db-SettingsForm-footerMessage"></span>

                            <div className="bs-Tail-copy">
                                <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                    <div className="Box-root Margin-right--8">
                                        <div className="Icon Icon--info Icon--size--14 Box-root Flex-flex"></div>
                                    </div>
                                    <div className="Box-root">
                                        <ShouldRender
                                            if={
                                                this.props.addDomain.error ||
                                                this.props.updateDomainError
                                            }
                                        >
                                            <span
                                                style={{
                                                    color: 'red',
                                                    display: 'block',
                                                }}
                                            >
                                                {this.props.addDomain.error ||
                                                    this.props
                                                        .updateDomainError}
                                            </span>
                                        </ShouldRender>
                                        <ShouldRender
                                            if={!this.props.addDomain.error}
                                        >
                                            <span>
                                                Changes to these settings will
                                                take 72 hours to propagate.
                                            </span>
                                        </ShouldRender>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <RenderIfSubProjectAdmin
                                    subProjectId={projectId}
                                >
                                    {this.renderAddDomainButton(
                                        publicStatusPageUrl
                                    )}
                                    <ShouldRender
                                        if={
                                            this.props.showDomainField ||
                                            (this.props.domains &&
                                                this.props.domains.length > 0)
                                        }
                                    >
                                        <button
                                            id="btnAddDomain"
                                            className="bs-Button bs-Button--blue"
                                            disabled={
                                                this.props.statusPage.setting
                                                    .requesting
                                            }
                                            type="submit"
                                        >
                                            {(!this.props.addDomain
                                                .requesting ||
                                                !this.props
                                                    .updateDomainRequesting) && (
                                                <span>
                                                    Save Domain Settings{' '}
                                                </span>
                                            )}
                                            {(this.props.addDomain.requesting ||
                                                this.props
                                                    .updateDomainRequesting) && (
                                                <FormLoader />
                                            )}
                                        </button>
                                    </ShouldRender>
                                </RenderIfSubProjectAdmin>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

Setting.displayName = 'Setting';

Setting.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    statusPage: PropTypes.object.isRequired,
    currentProject: PropTypes.oneOfType([
        PropTypes.object.isRequired,
        PropTypes.oneOf([null, undefined]),
    ]),
    reset: PropTypes.func.isRequired,
    subProjects: PropTypes.array.isRequired,
    addMoreDomain: PropTypes.func,
    domains: PropTypes.array,
    showDomainField: PropTypes.bool,
    openModal: PropTypes.func.isRequired,
    createDomain: PropTypes.func,
    verifyDomain: PropTypes.func,
    closeModal: PropTypes.func,
    verifyError: PropTypes.bool,
    addDomain: PropTypes.object,
    deleteDomain: PropTypes.func,
    deleteDomainError: PropTypes.oneOfType([
        PropTypes.oneOf([null, undefined]),
        PropTypes.string,
    ]),
    updateDomain: PropTypes.func,
    updateDomainError: PropTypes.oneOfType([
        PropTypes.oneOfType([null, undefined]),
        PropTypes.string,
    ]),
    updateDomainRequesting: PropTypes.bool,
    initialFormValues: PropTypes.object,
    createDomainFailure: PropTypes.func,
};

const SettingForm = reduxForm({
    form: 'Setting', // a unique identifier for this form
    enableReinitialize: true,
    validate, // <--- validation function given to redux-for
})(Setting);

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            updateStatusPageSetting,
            updateStatusPageSettingRequest,
            updateStatusPageSettingSuccess,
            updateStatusPageSettingError,
            addMoreDomain,
            cancelAddMoreDomain,
            verifyDomain,
            createDomain,
            updateDomain,
            deleteDomain,
            openModal,
            closeModal,
            createDomainFailure,
        },
        dispatch
    );
};

function mapStateToProps(state) {
    const domainsContainer =
        state.statusPage &&
        state.statusPage.status &&
        state.statusPage.status.domains
            ? state.statusPage.status.domains
            : [];

    let obj = {};
    domainsContainer.forEach(d => {
        obj = { ...obj, [d._id]: d.domain };
    });

    return {
        statusPage: state.statusPage,
        currentProject: state.project.currentProject,
        domains:
            state.statusPage &&
            state.statusPage.status &&
            state.statusPage.status.domains
                ? state.statusPage.status.domains
                : [],
        initialValues: {
            ...obj,
        },
        subProjects: state.subProject.subProjects.subProjects,
        showDomainField: state.statusPage.addMoreDomain,
        verifyError:
            state.statusPage.verifyDomain &&
            state.statusPage.verifyDomain.error,
        addDomain: state.statusPage.addDomain,
        deleteDomainError:
            state.statusPage.deleteDomain &&
            state.statusPage.deleteDomain.error,
        updateDomainError: state.statusPage.updateDomain.error,
        updateDomainRequesting: state.statusPage.updateDomain.requesting,
        initialFormValues: state.form.Setting && state.form.Setting.initial,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingForm);
