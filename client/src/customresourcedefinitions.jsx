import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Moment from 'react-moment';
import Fab from '@material-ui/core/Fab';
import AssignmentIcon from '@material-ui/icons/Assignment';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import CustomResourceViewer from './customresourceviewer';
import MaterialTable from 'material-table';

import { connect } from 'react-redux';

import axios from 'axios';

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

class CustomResourceDefinitions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customResourceDefinitions: [],
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchCustomResources = this.fetchCustomResources.bind(this);
    }

    componentDidMount() {
        this.fetchCustomResources();
    }

    componentDidUpdate(prevProps, prevState) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;
        const { editor: prevViewer }  = prevState;
        const { editor: currentViewer }  = this.state;
        if (currentNs !== prevNs || currentContext !== prevContext || currentViewer.open !== prevViewer.open) {
            this.fetchCustomResources();
        }
    }

    fetchCustomResources() {
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
            editor: {
                content: customResourceDefinition,
                name: customResourceDefinition.metadata.name,
                open: true,
            }
        });
    }

    viewResources(crd) {
        const { currentContext, currentNs } = this.props;
        axios
            .get(`/api/namespace/${currentNs}/customResources/${crd.spec.group}/${crd.spec.version}/${crd.spec.names.plural}`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                this.setState({
                    editor: {
                        name: res.data.body.kind,
                        open: true,
                        content: res.data.body.items,
                    }
                });
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
                <Tooltip title={`View ${customResourceDefinition.spec.names.plural}`} placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.viewResources(customResourceDefinition)}>
                        <AssignmentIcon />
                    </Fab>
                </Tooltip>
            </div>
        );
    }

    render() {
        const { currentContext } = this.props;
        const { customResourceDefinitions, editor } = this.state;
        const columns = [
            { title: 'Name', field: 'metadata.name' },
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
                />
                <CustomResourceViewer
                    context={currentContext}
                    content={editor.content}
                    name={editor.name}
                    open={editor.open}
                    onClose={() =>
                        this.setState({
                            editor: {
                                open: false
                            }
                        })
                    }
                />
            </div>
        );
    }
}

CustomResourceDefinitions.propTypes = {
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(CustomResourceDefinitions));
