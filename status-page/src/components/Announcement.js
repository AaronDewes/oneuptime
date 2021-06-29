import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getAnnouncements } from '../actions/status';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { handleResources } from '../config';
import ShouldRender from './ShouldRender';
import Markdown from 'markdown-to-jsx';
class Announcement extends Component {
    constructor(props) {
        super(props);
        this.limit = 2;
        this.counter = 2;
    }
    async componentDidMount() {
        const {
            getAnnouncements,
            statusPage: { projectId, _id },
        } = this.props;
        await getAnnouncements(projectId._id, _id, 0, this.limit);
    }

    handleRouting = announcementSlug => {
        const {
            history,
            statusPage: { slug },
        } = this.props;
        history.push(`/status-page/${slug}/announcement/${announcementSlug}`);
    };

    addMore = async () => {
        const {
            getAnnouncements,
            statusPage: { projectId, _id },
        } = this.props;
        this.limit += this.counter;
        await getAnnouncements(projectId._id, _id, 0, this.limit);
    };

    render() {
        const { announcement, monitorState } = this.props;
        return (
            <>
                {announcement && (
                    <>
                        {this.props.theme ? (
                            <div
                                className="clean_ann"
                                onClick={e => {
                                    e.preventDefault();
                                    this.handleRouting(announcement.slug);
                                }}
                            >
                                <span className="ann_header">ANNOUNCEMENT</span>
                                <AnnouncementBox
                                    announcement={announcement}
                                    monitorState={monitorState}
                                />
                            </div>
                        ) : (
                            <div
                                className="announcement_classic"
                                onClick={e => {
                                    e.preventDefault();
                                    this.handleRouting(announcement.slug);
                                }}
                            >
                                <div className="ann_header classic_header">
                                    ANNOUNCEMENT
                                </div>
                                <AnnouncementBox
                                    announcement={announcement}
                                    monitorState={monitorState}
                                    type={true}
                                />
                            </div>
                        )}
                    </>
                )}
            </>
        );
    }
}

Announcement.displayName = 'Announcement';

Announcement.propTypes = {
    theme: PropTypes.string,
    getAnnouncements: PropTypes.func,
    statusPage: PropTypes.object,
    announcement: PropTypes.object,
    monitorState: PropTypes.array,
    history: PropTypes.object,
};

const mapStateToProps = state => {
    return {
        statusPage: state.status.statusPage,
        announcement:
            state.status.announcements.list.allAnnouncements &&
            state.status.announcements.list.allAnnouncements.length > 0 &&
            state.status.announcements.list.allAnnouncements[0],
    };
};

const mapDispatchToProps = dispatch =>
    bindActionCreators({ getAnnouncements }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Announcement);

function AnnouncementBox({ announcement, monitorState, type }) {
    return (
        <>
            <div className="icon_ann">
                <div className={type ? 'ann_title classic_font' : 'ann_title'}>
                    {announcement.name}
                </div>
            </div>
            <div className="ann_desc">
                <Markdown>{announcement.description}</Markdown>
            </div>
            <ShouldRender if={announcement.monitors.length > 0}>
                <div className={'resources_aff'}>
                    <span className={type && 'classic_font'}>
                        Resources Affected:{' '}
                    </span>
                    <span>
                        {announcement &&
                            handleResources(monitorState, announcement)}
                    </span>
                </div>
            </ShouldRender>
            <div className="ongoing__schedulebox classic_icon_x">
                <span className="sp__icon sp__icon--more"></span>
            </div>
        </>
    );
}

AnnouncementBox.propTypes = {
    announcement: PropTypes.object,
    monitorState: PropTypes.array,
    type: PropTypes.bool,
};

AnnouncementBox.displayName = 'AnnouncementBox';
