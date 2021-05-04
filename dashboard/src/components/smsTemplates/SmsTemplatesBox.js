import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import {
    editSmsTemplates,
    resetSmsTemplates,
    changeShowingTemplate,
} from '../../actions/smsTemplates';
import SmsTemplatesFormBox from './SmsTemplatesFormBox';
import IsAdmin from '../basic/IsAdmin';
import IsOwner from '../basic/IsOwner';
import { RenderSelect } from '../basic/RenderSelect';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS } from '../../config';

class SmsTemplatesBox extends React.Component {
    submitForm = values => {
        const { currentProject } = this.props;
        const val = this.props.smsTemplates.smsTemplates.templates.map(tmp => {
            if (tmp.smsType === values.sms_type) {
                tmp.body = values.body;
                return tmp;
            } else {
                return tmp;
            }
        });
        this.props.editSmsTemplates(currentProject._id, val);
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > SETTINGS > SMS TEMPLATES UPDATED'
            );
        }
    };

    resetTemplate = templateId => {
        const { currentProject } = this.props;
        return this.props.resetSmsTemplates(currentProject._id, templateId);
    };

    templateChange = (e, value) => {
        this.props.changeShowingTemplate(value);
    };
    render() {
        const templates =
            this.props.smsTemplates &&
            this.props.smsTemplates.smsTemplates &&
            this.props.smsTemplates.smsTemplates.templates
                ? this.props.smsTemplates.smsTemplates.templates
                : [];
        return (
            <div id="smsTemplate" className="Box-root Margin-vertical--12">
                <div className="db-RadarRulesLists-page">
                    <div className="Box-root Margin-bottom--12">
                        <div className="Box-root Margin-bottom--12">
                            <div
                                className={
                                    this.props.smsTemplates &&
                                    this.props.smsTemplates.showingTemplate &&
                                    this.props.smsTemplates.showingTemplate
                                        .smsType
                                        ? ''
                                        : 'bs-ContentSection Card-root Card-shadow--medium'
                                }
                            >
                                <div className="Box-root bs-ContentSection Card-root Card-shadow--medium">
                                    <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                                        <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                                            <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                                                <span className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                                    <span>SMS Templates</span>
                                                </span>
                                                <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                    <span>
                                                        Customize your SMS
                                                        templates.
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                                                <div className="Box-root"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {IsAdmin(this.props.currentProject) ||
                                    IsOwner(this.props.currentProject) ? (
                                        <form>
                                            <div
                                                className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-vertical--2"
                                                style={{ boxShadow: 'none' }}
                                            >
                                                <div className="bs-Fieldset-row">
                                                    <label className="bs-Fieldset-label">
                                                        Templates
                                                    </label>
                                                    <div className="bs-Fieldset-fields">
                                                        <Field
                                                            className="db-select-nw"
                                                            component={
                                                                RenderSelect
                                                            }
                                                            name="type_Templates"
                                                            id="type"
                                                            placeholder="Templates"
                                                            required="required"
                                                            onChange={(e, v) =>
                                                                this.templateChange(
                                                                    e,
                                                                    v
                                                                )
                                                            }
                                                            style={{
                                                                height: '28px',
                                                            }}
                                                            options={[
                                                                {
                                                                    value: '',
                                                                    label:
                                                                        'Select a template',
                                                                },
                                                                ...(templates &&
                                                                templates.length >
                                                                    0
                                                                    ? templates.map(
                                                                          template => ({
                                                                              value:
                                                                                  template.smsType,
                                                                              label:
                                                                                  template.smsType,
                                                                          })
                                                                      )
                                                                    : []),
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div
                                            className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-vertical--2"
                                            style={{ boxShadow: 'none' }}
                                        >
                                            <div
                                                className="bs-Fieldset-row"
                                                style={{ textAlign: 'center' }}
                                            >
                                                <label
                                                    className="bs-Fieldset-label"
                                                    style={{ flex: 'none' }}
                                                >
                                                    SMS Template settings are
                                                    available to only admins and
                                                    owners.
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {this.props.smsTemplates.showingTemplate &&
                                this.props.smsTemplates.showingTemplate
                                    .smsType ? (
                                    <div className="bs-ContentSection Card-root Card-shadow--medium Margin-vertical--12">
                                        <SmsTemplatesFormBox
                                            submitForm={this.submitForm}
                                            resetTemplate={this.resetTemplate}
                                        />
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SmsTemplatesBox.displayName = 'SmsTemplatesBox';

const SmsTemplatesBoxForm = new reduxForm({
    form: 'SmsTemplates',
    enableReinitialize: true,
    destroyOnUnmount: false,
})(SmsTemplatesBox);

SmsTemplatesBox.propTypes = {
    smsTemplates: PropTypes.object.isRequired,
    editSmsTemplates: PropTypes.func.isRequired,
    currentProject: PropTypes.object.isRequired,
    resetSmsTemplates: PropTypes.func.isRequired,
    changeShowingTemplate: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        { editSmsTemplates, resetSmsTemplates, changeShowingTemplate },
        dispatch
    );

const mapStateToProps = state => {
    return {
        monitor: state.monitor,
        currentProject: state.project.currentProject,
        smsTemplates: state.smsTemplates,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SmsTemplatesBoxForm);
