import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import axios from 'axios';
import MaterialTable from 'material-table';
import Fab from '@material-ui/core/Fab';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

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

class CRDsDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customResources: [],
            viewer: {
                open: false,
                content: {},
            }
        };
        this.fetchResources = this.fetchResources.bind(this);
    }

    componentDidMount() {
        this.fetchResources(this.props.crd);
    }

    componentDidUpdate(prevProps, prevState) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;
        const { viewer: prevViewer }  = prevState;
        const { viewer: currentViewer }  = this.state;
        if (currentNs !== prevNs || currentContext !== prevContext || currentViewer.open !== prevViewer.open) {
            this.fetchResources();
        }
    }

    viewDefinition(customResourceDefinition) {
        this.setState({
            viewer: {
                content: customResourceDefinition,
                open: true,
            }
        });
    }

    fetchResources(crd) {
        if (!crd) {
            return;
        }
        const { currentContext, currentNs } = this.props;
        axios
            .get(`/api/namespace/${currentNs}/customResources/${crd.spec.group}/${crd.spec.version}/${crd.spec.names.plural}`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                this.setState({
                    name: res.data.body.kind,
                    customResources: res.data.body.items,
                });
            });
    }

    actions(customResourceDefinition) {
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Tooltip title="View Details" placement="top">
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
        const { currentContext } = this.props;
        const { customResources, viewer } = this.state;
        const columns = [
            { title: 'Name', field: 'metadata.name' },
            { title: 'Created', render: rowData => (<Moment fromNow>{rowData.metadata.creationTimestamp}</Moment>) },
            { title: 'Actions', render: rowData => this.actions(rowData)},
        ].map(c => {
            c.cellStyle = Object.assign({padding: '4px 16px'}, c.cellStyle);
            return c;
        });
        return (
            <div style={{ maxWidth: '100%' }}>
                <MaterialTable
                    style= {{ boxShadow: 'none', paddingLeft: '50px' }}
                    columns={columns}
                    data={customResources}
                    options={{paging: false, sorting: false, toolbar: false, header: false}}
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

CRDsDetail.propTypes = {
    crd: PropTypes.object,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default withStyles(styles)(CRDsDetail);