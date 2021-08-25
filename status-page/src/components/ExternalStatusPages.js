import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetchExternalStatusPages } from '../actions/status';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ShouldRender from './ShouldRender';
class ExternalStatusPages extends Component {
    async componentDidMount() {
        this.props.fetchExternalStatusPages(
            this.props.statusPage.projectId._id,
            this.props.statusPage._id
        );
    }

    render() {
        const { externalStatusPages, theme } = this.props;
        return (
            <div>
                {theme && theme === 'Clean Theme' && (
                    <div
                        className="box-inner"
                        style={{
                            paddingLeft: 0,
                            paddingRight: 0,
                            width: '100%',
                        }}
                    >
                        {externalStatusPages?.externalStatusPagesList?.map(
                            (link, i) => {
                                return (
                                    <div key={i}>
                                        <div
                                            style={{
                                                height: '50px',
                                                position: 'relative',
                                                borderBottomWidth: '1px',
                                                borderLeftWidth: '1px',
                                                borderRightWidth: '1px',
                                                borderTopWidth: '1px',
                                                borderStyle: 'solid',
                                                borderColor: '#dfe1df',
                                                backgroundColor: '#fdfdfd',
                                                marginBottom: '25px',
                                                opacity: '1',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: '500',
                                                    marginLeft: '10px',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    transform:
                                                        'translateY(-50%)',
                                                }}
                                            >
                                                {link.name}
                                            </span>
                                            <span
                                                style={{
                                                    fontWeight: '500',
                                                    color: 'grey',
                                                    left: '35%',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    transform:
                                                        'translateY(-50%)',
                                                }}
                                            >
                                                {link.url}
                                            </span>
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '10px',
                                                    transform:
                                                        'translateY(-50%)',
                                                    color:
                                                        link.description ===
                                                        'All Systems Operational'
                                                            ? '#49c3b1'
                                                            : 'red',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                {link.description}{' '}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                        <ShouldRender
                            if={
                                externalStatusPages &&
                                externalStatusPages.externalStatusPagesList &&
                                externalStatusPages.externalStatusPagesList
                                    .length === 0
                            }
                        >
                            {' '}
                            <div className="nt_list">
                                You don&#39;t have any external service.
                            </div>
                        </ShouldRender>
                    </div>
                )}
                {theme && theme === 'Classic Theme' && (
                    <div
                        className="twitter-feed white box"
                        style={{
                            overflow: 'visible',
                        }}
                    >
                        <div
                            className="messages"
                            style={{ position: 'relative' }}
                        >
                            <div
                                className="box-inner"
                                style={{
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    width: '100%',
                                }}
                            >
                                <div
                                    className="feed-header"
                                    style={{ display: 'block' }}
                                >
                                    <div className="feed-title">
                                        {' '}
                                        External Status Pages
                                    </div>
                                    <ul className="feed-contents plain">
                                        {externalStatusPages?.externalStatusPagesList?.map(
                                            (link, i) => {
                                                return (
                                                    <li
                                                        key={i}
                                                        className="incidentlist feed-item clearfix"
                                                        style={{
                                                            margin: '0 0 10px',
                                                        }}
                                                    >
                                                        <span
                                                            className="ct_header"
                                                            style={{
                                                                fontWeight:
                                                                    '500',
                                                                marginLeft:
                                                                    '10px',
                                                                position:
                                                                    'absolute',
                                                                top: '50%',
                                                                transform:
                                                                    'translateY(-50%)',
                                                            }}
                                                        >
                                                            <b>{link.url}</b>
                                                        </span>
                                                        <span
                                                            style={{
                                                                position:
                                                                    'absolute',
                                                                top: '50%',
                                                                right: '10px',
                                                                transform:
                                                                    'translateY(-50%)',
                                                                color:
                                                                    link.description ===
                                                                    'All Systems Operational'
                                                                        ? '#49c3b1'
                                                                        : 'red',
                                                                fontWeight:
                                                                    '500',
                                                                fontSize:
                                                                    '13px',
                                                            }}
                                                        >
                                                            {link.description}
                                                        </span>
                                                    </li>
                                                );
                                            }
                                        )}
                                    </ul>

                                    <ShouldRender
                                        if={
                                            externalStatusPages &&
                                            externalStatusPages.externalStatusPagesList &&
                                            externalStatusPages
                                                .externalStatusPagesList
                                                .length === 0
                                        }
                                    >
                                        {' '}
                                        <div className="cl_nolist">
                                            You don&#39;t have any external
                                            status page.
                                        </div>
                                    </ShouldRender>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

ExternalStatusPages.displayName = 'ExternalStatusPages';
const mapStateToProps = state => ({
    statusPage: state.status.statusPage,
    externalStatusPages: state.status.externalStatusPages,
    requesting: state.status.announcementLogs.requesting,
    error: state.status.announcementLogs.error,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators({ fetchExternalStatusPages }, dispatch);

ExternalStatusPages.propTypes = {
    externalStatusPages: PropTypes.object,
    fetchExternalStatusPages: PropTypes.func,
    statusPage: PropTypes.object,
    theme: PropTypes.string,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExternalStatusPages);
