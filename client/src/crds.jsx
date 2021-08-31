import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Moment from 'react-moment';
import Fab from '@material-ui/core/Fab';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import MaterialTable from 'material-table';
import { connect } from 'react-redux';
import axios from 'axios';

import CRDsDetail from './crdsdetail';
import Editor from './editor';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 700
    },
    title: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    }
});

const mapStateToProps = ({ currentNs, currentContext }) => ({
    currentNs,
    currentContext
});

class CRDs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customResourceDefinitions: [],
            viewer: {
                open: false,
                content: {},
            }
        };
        this.fetchCRDs = this.fetchCRDs.bind(this);
    }

    componentDidMount() {
        this.fetchCRDs();
    }

    componentDidUpdate(prevProps, prevState) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;
        const { viewer: prevViewer }  = prevState;
        const { viewer: currentViewer }  = this.state;
        if (currentNs !== prevNs || currentContext !== prevContext || currentViewer.open !== prevViewer.open) {
            this.fetchCRDs();
        }
    }

    fetchCRDs() {
        const { currentContext, currentNs } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/customResources`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                this.setState({ customResourceDefinitions: res.data.body.items });
            });
    }

    viewDefinition(customResourceDefinition) {
        this.setState({
            viewer: {
                content: customResourceDefinition,
                open: true,
            }
        });
    }

    actions(customResourceDefinition) {
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Tooltip title="View Definition" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.viewDefinition(customResourceDefinition)}>
                        <InfoIcon />
                    </Fab>
                </Tooltip>
            </div>
        );
    }

    render() {
        const { currentContext, currentNs } = this.props;
        const { customResourceDefinitions, viewer } = this.state;
        const columns = [
            { title: 'Name', field: 'spec.names.kind' },
            { title: 'Created', render: rowData => (<Moment fromNow>{rowData.metadata.creationTimestamp}</Moment>) },
            { title: 'Actions', render: rowData => this.actions(rowData)},
        ].map(c => {
            c.cellStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.cellStyle);
            c.headerStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.headerStyle);
            return c;
        });

        return (
            <div style={{ maxWidth: '100%' }}>
                <MaterialTable
                    columns={columns}
                    data={customResourceDefinitions}
                    title='Custom Resources'
                    options={{paging: false, sorting: false}}
                    detailPanel={crd => {
                        return (
                            <CRDsDetail
                                crd={crd}
                                currentContext={currentContext}
                                currentNs={currentNs}
                            />
                        );
                    }}
                />
                <Editor
                    context={currentContext}
                    content={viewer.content}
                    open={viewer.open}
                    onClose={() =>
                        this.setState({
                            viewer: {
                                open: false
                            }
                        })
                    }
                />
            </div>
        );
    }
}

CRDs.propTypes = {
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(CRDs));
