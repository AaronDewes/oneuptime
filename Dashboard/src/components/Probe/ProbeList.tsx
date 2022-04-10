import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import { v4 as uuidv4 } from 'uuid';
import { ListLoader } from '../basic/Loader';
import ProbeStatus from './ProbeStatus';
import { openModal, closeModal } from 'Common-ui/actions/modal';
import ProbeDetail from '../modals/ProbeDetail';
import DataPathHoC from '../DataPathHoC';
import { API_URL } from '../../config';

interface ProbeListProps {
    probesList?: object;
    skip?: number;
    limit?: number;
    count?: number;
    requesting?: boolean;
    data?: unknown[];
    error?: object;
    prevClicked?: Function;
    nextClicked?: Function;
    openModal?: Function;
    closeModal?: Function;
    page?: number;
}

export class ProbeList extends Component<ProbeListProps>{
    public static displayName = '';
    public static propTypes = {};
    constructor(props: $TSFixMe) {
        super(props);
        this.state = { ProbeDetailModalId: uuidv4() };
    }

    override render() {
        if (

            this.props.probesList &&

            this.props.probesList.skip &&

            typeof this.props.probesList.skip === 'string'
        ) {

            this.props.probesList.skip = parseInt(

                this.props.probesList.skip,
                10
            );
        }
        if (

            this.props.probesList &&

            this.props.probesList.limit &&

            typeof this.props.probesList.limit === 'string'
        ) {

            this.props.probesList.limit = parseInt(

                this.props.probesList.limit,
                10
            );
        }

        if (!this.props.probesList.skip) this.props.probesList.skip = 0;

        if (!this.props.probesList.limit) this.props.probesList.limit = 0;

        let canNext =

            this.props.probesList &&

                this.props.probesList.count &&

                this.props.probesList.count >

                this.props.probesList.skip + this.props.probesList.limit
                ? true
                : false;
        let canPrev =

            this.props.probesList && this.props.probesList.skip <= 0
                ? false
                : true;

        if (

            this.props.probesList &&

            (this.props.probesList.requesting || !this.props.probesList.data)
        ) {
            canNext = false;
            canPrev = false;
        }
        const numberOfPages = Math.ceil(

            parseInt(this.props.probesList && this.props.probesList.count) / 10
        );
        return (
            <div>
                <div style={{ overflow: 'hidden', overflowX: 'auto' }}>
                    <table className="Table">
                        <thead className="Table-body">
                            <tr className="Table-row db-ListViewItem db-ListViewItem-header">
                                <td
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px', minWidth: '270px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Probe Location</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-align--left Text-color--dark Text-display--block Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Last Active</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    id="placeholder-left"
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{
                                        height: '1px',
                                        maxWidth: '48px',
                                        minWidth: '48px',
                                        width: '48px',
                                    }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
                                    </div>
                                </td>
                                <td
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Status</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    id="placeholder-right"
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{
                                        height: '1px',
                                        maxWidth: '48px',
                                        minWidth: '48px',
                                        width: '48px',
                                    }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody className="Table-body">

                            {this.props.probesList &&

                                this.props.probesList.data &&

                                this.props.probesList.data.length ? (

                                this.props.probesList.data.map(
                                    (probesData: $TSFixMe, index: $TSFixMe) => (
                                        <tr
                                            className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink"
                                            key={probesData._id}
                                            id={`probe_${index}`}
                                            onClick={() =>

                                                this.props.openModal({
                                                    id: this.state

                                                        .ProbeDetailModalId,
                                                    onClose: () => '',
                                                    content: DataPathHoC(
                                                        ProbeDetail,
                                                        {
                                                            ProbeDetailModalId: this
                                                                .state

                                                                .ProbeDetailModalId,
                                                            closeModal: this
                                                                .props

                                                                .closeModal,
                                                            probesData,
                                                        }
                                                    ),
                                                })
                                            }
                                        >
                                            <td
                                                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                style={{
                                                    height: '1px',
                                                    minWidth: '270px',
                                                }}
                                            >
                                                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                    <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                        <div
                                                            className="Box-root Margin-right--16"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    probesData.probeImage
                                                                        ? `${API_URL}/file/${probesData.probeImage}`
                                                                        : '/dashboard/assets/img/no-probe.svg'
                                                                }
                                                                alt=""
                                                                className="image-small-circle"
                                                                style={{
                                                                    width:
                                                                        '25px',
                                                                    height:
                                                                        '25px',
                                                                    marginRight:
                                                                        '10px',

                                                                    opacity:
                                                                        !probesData.probeImage &&
                                                                        '0.3',
                                                                }}
                                                            />
                                                            <span>
                                                                {probesData.probeName
                                                                    ? probesData.probeName
                                                                    : 'Unknown Location'}
                                                            </span>
                                                        </div>
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                style={{ height: '1px' }}
                                            >
                                                <div className="db-ListViewItem-link">
                                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                        <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                            <div className="Box-root">
                                                                <span>
                                                                    {probesData.lastAlive
                                                                        ? moment(
                                                                            probesData.lastAlive
                                                                        ).format(
                                                                            'dddd, MMMM Do YYYY, h:mm a'
                                                                        )
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                aria-hidden="true"
                                                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                style={{
                                                    height: '1px',
                                                    maxWidth: '48px',
                                                    minWidth: '48px',
                                                    width: '48px',
                                                }}
                                            >
                                                <div className="db-ListViewItem-link">
                                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                        ⁣
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                style={{ height: '1px' }}
                                            >
                                                <div className="db-ListViewItem-link">
                                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                        <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                            <div className="Box-root Flex-flex">
                                                                <div className="Box-root Flex-flex">
                                                                    <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                        <ProbeStatus
                                                                            lastAlive={
                                                                                probesData &&
                                                                                probesData.lastAlive
                                                                            }
                                                                            id={
                                                                                index
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td
                                                aria-hidden="true"
                                                className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                style={{
                                                    height: '1px',
                                                    maxWidth: '48px',
                                                    minWidth: '48px',
                                                    width: '48px',
                                                }}
                                            >
                                                <div className="db-ListViewItem-link">
                                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                        ⁣
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {this.props.probesList && this.props.probesList.requesting ? (
                    <ListLoader />
                ) : null}

                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '10px',
                        padding: '0 10px',
                    }}
                >

                    {this.props.probesList &&

                        (!this.props.probesList.data ||

                            !this.props.probesList.data.length) &&

                        !this.props.probesList.requesting &&

                        !this.props.probesList.error
                        ? 'Probes does not exist. Please contact admin to add one.'
                        : null}

                    {this.props.probesList && this.props.probesList.error

                        ? this.props.probesList.error
                        : null}
                </div>
                <div className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween">
                    <div className="Box-root Flex-flex Flex-alignItems--center Padding-all--20">
                        <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <span>
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">

                                    {this.props.probesList &&

                                        this.props.probesList.count
                                        ? `Page ${this.props.page
                                        } of ${numberOfPages} (${this.props

                                            .probesList &&

                                        this.props.probesList
                                            .count} Probe${this.props.probesList &&

                                                this.props.probesList.count === 1
                                                ? ''
                                                : 's'
                                        })`
                                        : null}
                                </span>
                            </span>
                        </span>
                    </div>
                    <div className="Box-root Padding-horizontal--20 Padding-vertical--16">
                        <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                            <div className="Box-root Margin-right--8">
                                <button

                                    onClick={this.props.prevClicked}
                                    className={
                                        'Button bs-ButtonLegacy' +
                                        (canPrev ? '' : 'Is--disabled')
                                    }
                                    disabled={!canPrev}
                                    data-db-analytics-name="list_view.pagination.previous"
                                    type="button"
                                >
                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                            <span>Previous</span>
                                        </span>
                                    </div>
                                </button>
                            </div>
                            <div className="Box-root">
                                <button

                                    onClick={this.props.nextClicked}
                                    className={
                                        'Button bs-ButtonLegacy' +
                                        (canNext ? '' : 'Is--disabled')
                                    }
                                    disabled={!canNext}
                                    data-db-analytics-name="list_view.pagination.next"
                                    type="button"
                                >
                                    <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                        <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                            <span>Next</span>
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators({ openModal, closeModal }, dispatch);
};

function mapStateToProps(state: RootState) {
    return {
        currentProject: state.project.currentProject,
    };
}


ProbeList.displayName = 'ProbeList';


ProbeList.propTypes = {
    probesList: PropTypes.object,
    skip: PropTypes.number,
    limit: PropTypes.number,
    count: PropTypes.number,
    requesting: PropTypes.bool,
    data: PropTypes.array,
    error: PropTypes.object,
    prevClicked: PropTypes.func,
    nextClicked: PropTypes.func,
    openModal: PropTypes.func,
    closeModal: PropTypes.func,
    page: PropTypes.number,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProbeList);
