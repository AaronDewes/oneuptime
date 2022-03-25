import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { User } from '../../config';
import moment from 'moment';

class NotificationMenu extends Component<ComponentProps> {

    public static propTypes = {};

    override render() {
        const userId = User.getUserId();

        return this.props.visible ? (
            <div
                className="notifications ContextualLayer-layer--topright ContextualLayer-layer--anytop ContextualLayer-layer--anyright ContextualLayer-context--bottom ContextualLayer-context--anybottom ContextualLayer-container ContextualLayer--pointerEvents"
                style={{
                    top: '49px',
                    width: '450px',

                    left: this.props.position

                        ? `${this.props.position - 391.5}px`
                        : 'unset',
                    right: '40px',
                }}
            >
                <div className="ContextualPopover-animate ContextualPopover-animate-entered">
                    <div
                        className="ContextualPopover"
                        style={{ transformOrigin: '100% 0px 0px' }}
                    >
                        <div
                            className="ContextualPopover-arrowContainer"
                            style={{ position: 'relative', right: '40px' }}
                        >
                            <div className="ContextualPopover-arrow"></div>
                        </div>
                        <div className="ContextualPopover-contents">
                            <div
                                className="Box-root"
                                id="notificationscroll"
                                style={{
                                    width: '450px',
                                    maxHeight: '300px',
                                    overflowX: 'scroll',
                                }}
                            >
                                <div
                                    className="Box-root Box-divider--surface-bottom-1 Padding-all--12"
                                    style={{
                                        boxShadow:
                                            '1px 1px rgba(188,188,188,0.5)',
                                    }}
                                >
                                    <div>
                                        <span
                                            style={{
                                                color: '#24b47e',
                                                paddingLeft: '15px',
                                                fontSize: '14px',
                                                fontWeight: 'medium',
                                            }}
                                        >
                                            NOTIFICATIONS
                                        </span>
                                    </div>
                                </div>
                                <div className="Box-root Padding-vertical--8">

                                    {this.props.notifications &&

                                        this.props.notifications.notifications &&

                                        this.props.notifications.notifications
                                            .length ? (

                                        this.props.notifications.notifications.map(
                                            (notification: $TSFixMe, key: $TSFixMe) => {
                                                return (
                                                    <div
                                                        className={
                                                            notification.read.indexOf(
                                                                userId
                                                            ) > -1
                                                                ? 'Box-root'
                                                                : 'Box-root unread'
                                                        }
                                                        style={{
                                                            padding:
                                                                '10px 10px',
                                                            fontWeight: '400',
                                                            fontSize: '1em',
                                                            borderBottom:
                                                                '1px solid rgba(188,188,188,0.5)',
                                                            borderRadius: '2px',
                                                        }}
                                                        key={key}
                                                    >
                                                        <div className="Notify-oneuptime">
                                                            <img
                                                                src={`/dashboard/assets/img/${notification.icon
                                                                    ? notification.icon
                                                                    : 'information'
                                                                    }.svg`}
                                                                className="Notify-oneuptime-row-primary"
                                                                style={{
                                                                    height:
                                                                        '20px',
                                                                    width:
                                                                        '20px',
                                                                }}
                                                                alt="notify"
                                                            />
                                                            <span
                                                                className="Notify-oneuptime-row-secondary"
                                                                style={{
                                                                    cursor:
                                                                        'default',
                                                                }}
                                                            >
                                                                {
                                                                    notification.message
                                                                }{' '}
                                                                on{' '}
                                                                {moment(
                                                                    notification.createdAt
                                                                ).format(
                                                                    'MMMM Do YYYY, h:mm a'
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )
                                    ) : (
                                        <div
                                            className="Box-root"
                                            style={{
                                                padding: '10px',
                                                fontWeight: '500',
                                                marginTop: '-12px',
                                            }}
                                        >
                                            <span>
                                                No notifications at this time
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null;
    }
}


NotificationMenu.displayName = 'NotificationMenu';

const mapStateToProps = (state: $TSFixMe) => {
    return {
        notifications: state.notifications.notifications,
        position: state.notifications.notificationsPosition,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators({}, dispatch);
};


NotificationMenu.propTypes = {
    visible: PropTypes.bool,
    notifications: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    length: PropTypes.number,
    map: PropTypes.func,
    position: PropTypes.number,
};


NotificationMenu.contextTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationMenu);
