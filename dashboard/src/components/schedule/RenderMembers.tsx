import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'redu... Remove this comment to see the full error message
import { formValueSelector } from 'redux-form';
import ShouldRender from '../basic/ShouldRender';
import { RenderMember } from './RenderMember';

let RenderMembers = ({
    fields,
    meta: { error, submitFailed },
    subProjectId,
    policyIndex,
    teamIndex,
    form
}: $TSFixMe) => {
    const policyRotation = form[policyIndex].teams[teamIndex];

    return (
        <ul>
            {fields.map((inputarray: $TSFixMe, i: $TSFixMe) => {
                const memberValue = policyRotation.teamMembers[i];
                return (
                    <RenderMember
                        memberValue={memberValue}
                        subProjectId={subProjectId}
                        policyIndex={policyIndex}
                        teamIndex={teamIndex}
                        inputarray={inputarray}
                        key={i}
                        nameIndex={i}
                        fields={fields}
                    />
                );
            })}

            <li>
                <div className="bs-Fieldset-row">
                    <label className="bs-Fieldset-label"></label>
                    <div className="bs-Fieldset-fields">
                        <div className="Box-root Flex-flex Flex-alignItems--center"></div>
                    </div>
                </div>
                <div className="bs-Fieldset-row">
                    <label className="bs-Fieldset-label"></label>
                    <div className="bs-Fieldset-fields">
                        <div className="Box-root Flex-flex Flex-alignItems--center">
                            <div>
                                <ShouldRender if={fields.length < 10}>
                                    <button
                                        type="button"
                                        className="bs-Button bs-FileUploadButton bs-Button--icon bs-Button--new"
                                        onClick={() =>
                                            fields.push({
                                                member: '',
                                                timezone: '',
                                                startTime: '',
                                                endTime: '',
                                            })
                                        }
                                    >
                                        Add Team Member
                                    </button>
                                    <ShouldRender if={submitFailed && error}>
                                        <span>{error}</span>
                                    </ShouldRender>
                                </ShouldRender>
                            </div>
                        </div>
                        <p className="bs-Fieldset-explanation">
                            <span>
                                Add more team members to this on-call team.
                            </span>
                        </p>
                    </div>
                </div>
            </li>
        </ul>
    );
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type '({ ... Remove this comment to see the full error message
RenderMembers.displayName = 'RenderMembers';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type '({ fi... Remove this comment to see the full error message
RenderMembers.propTypes = {
    subProjectId: PropTypes.string.isRequired,
    meta: PropTypes.object.isRequired,
    fields: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    policyIndex: PropTypes.number.isRequired,
    teamIndex: PropTypes.number.isRequired,
    form: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
};

function mapStateToProps(state: $TSFixMe) {
    const selector = formValueSelector('OnCallAlertBox');
    const form = selector(state, 'OnCallAlertBox');

    return {
        form,
    };
}

// @ts-expect-error ts-migrate(2322) FIXME: Type 'ConnectedComponent<({ fields, meta: { error,... Remove this comment to see the full error message
RenderMembers = connect(mapStateToProps)(RenderMembers);

export { RenderMembers };
