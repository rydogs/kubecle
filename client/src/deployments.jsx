import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import Tooltip from '@material-ui/core/Tooltip';
import Moment from 'react-moment';
import Fab from '@material-ui/core/Fab';
import BuildIcon from '@material-ui/icons/Build';
import { connect } from 'react-redux';
import Editor from './editor';
import fmt from './fmt';
import SimpleList from './simpleList';
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
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    }
});

const mapStateToProps = ({ currentNs, currentContext }) => ({
    currentNs,
    currentContext
});

class Deployments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deployments: [],
            editor: {
                open: false,
                editUrl: '',
                content: {}
            }
        };
        this.fetchDeployments = this.fetchDeployments.bind(this);
    }

    componentDidMount() {
        this.fetchDeployments();
    }

    componentDidUpdate(prevProps) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;

        if (currentNs !== prevNs || currentContext !== prevContext) {
            this.fetchDeployments();
        }
    }

    fetchDeployments() {
        const { currentContext, currentNs } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/deployments`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ deployments: res.data.body.items });
                }
            });
    }

    edit(deployment) {
        const { currentNs } = this.props;

        this.setState({
            editor: {
                open: true,
                content: deployment,
                editUrl: `/api/namespace/${currentNs}/deployments/${deployment.metadata.name}`
            }
        });
    }

    actions(deployment) {
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Tooltip title="Edit" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.edit(deployment)}>
                        <BuildIcon />
                    </Fab>
                </Tooltip>
            </div>
        );
    }

    render() {
        const { classes, currentContext } = this.props;
        const { deployments, editor } = this.state;

        return (
            <div style={{ maxWidth: '100%' }}>
                <MUIDataTable
                    columns={[
                        { name: 'Name', customBodyRender: rowData => rowData.metadata.name },
                        { name: 'Replicas', customBodyRender: rowData => rowData.spec.replicas },
                        { name: 'Containers', customBodyRender: rowData => (<SimpleList data={fmt.containerImageNames(rowData.spec.template.spec.containers)} />) },
                        { name: 'Ports', customBodyRender: rowData => (<SimpleList data={fmt.containerPorts(rowData.spec.template.spec.containers)} />) },
                        { name: 'Last Updated', customBodyRender: rowData => (<Moment fromNow>{rowData.status.conditions[0].lastUpdateTime}</Moment>) },
                        { name: 'Action', customBodyRender: rowData => this.actions(rowData) }
                    ]}
                    data={deployments}
                    title='Deployments'
                    options={{paging: false, search: false, sorting: false}}
                />
                <Editor
                    context={currentContext}
                    content={editor.content}
                    editUrl={editor.editUrl}
                    open={editor.open}
                    onClose={() => this.setState({ editor: { open: false } })}
                />
            </div>
        );
    }
}

Deployments.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Deployments));
