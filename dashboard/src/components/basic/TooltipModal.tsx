import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from './Modal';

class TooltipModal extends Component {
    render() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'title' does not exist on type 'Readonly<... Remove this comment to see the full error message
        const { title, body, closeThisDialog } = this.props;
        return (
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; title: any; closeButton... Remove this comment to see the full error message
            <Modal
                title={title}
                closeButtonLabel={'Close'}
                hideAffirmativeButton={true}
                closeThisDialog={closeThisDialog}
            >
                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                    {body}
                </span>
            </Modal>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
TooltipModal.displayName = 'TooltipModal';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
TooltipModal.propTypes = {
    closeThisDialog: PropTypes.func.isRequired,
    title: PropTypes.string,
    body: PropTypes.string,
};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = () => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(TooltipModal);
