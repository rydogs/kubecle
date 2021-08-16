import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
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
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    }
});

const mapStateToProps = ({ currentNs, currentContext }) => ({
    currentNs,
    currentContext
});

class StatefulSets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            StatefulSets: [],
            editor: {
                open: false,
                editUrl: '',
                content: {}
            },
            historyViewer: {
                open: false,
                historyUrl: '',
                deployment: {}
            }
        };
        this.fetchStatefulSets = this.fetchStatefulSets.bind(this);
    }

    componentDidMount() {
        this.fetchStatefulSets();
    }

    componentDidUpdate(prevProps, prevStats) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;
        const { editor: prevEditor }  = prevStats;
        const { editor: currentEditor }  = this.state;
        if (currentNs !== prevNs || currentContext !== prevContext || currentEditor.open !== prevEditor.open) {
            this.fetchStatefulSets();
        }
    }

    fetchStatefulSets() {
        const { currentContext, currentNs } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/statefulsets`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ statefulsets: this.transform(res.data.body.items) });
                }
            });
    }

    transform(data) {
        return data.map(d => {
            d.name = d.metadata.name;
            d.imageNames = fmt.containerImageNames(d.spec.template.spec.containers);
            d.cpu = fmt.cpu(d.spec.template.spec.containers);
            d.memory = fmt.memory(d.spec.template.spec.containers);
            return d;
        });
    }

    edit(statefulset) {
        const { currentNs } = this.props;
        this.setState({
            editor: {
                open: true,
                content: statefulset,
                editUrl: `/api/namespace/${currentNs}/statefulsets/${statefulset.metadata.name}`
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
        const { classes, currentContext, currentNs } = this.props;
        const { statefulsets, editor } = this.state;
        const columns = [
            { title: 'Name', field: 'name'},
            { title: 'Replicas', render: rowData => rowData.spec.replicas },
            { title: 'Image Names', field: 'imageNames', render: rowData => (<SimpleList data={rowData.imageNames} />) },
            { title: 'CPU', field: 'cpu', render: rowData => (<SimpleList data={rowData.cpu} />) },
            { title: 'Memory', field: 'memory', render: rowData => (<SimpleList data={rowData.memory} />) },
            { title: 'Ports', render: rowData => (<SimpleList data={fmt.containerPorts(rowData.spec.template.spec.containers)} />) },
            // { title: 'Last Updated', render: rowData => (<Moment fromNow>{rowData.status.conditions[0].lastUpdateTime}</Moment>) },
            { title: 'Action', render: rowData => this.actions(rowData) }
        ].map(c => {
            c.cellStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.cellStyle);
            c.headerStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.headerStyle);
            return c;
        });

        return (
            <div style={{ maxWidth: '100%' }}>
                <MaterialTable
                    columns={columns}
                    data={statefulsets}
                    title='Stateful Sets'
                    options={{paging: false, sorting: true}}
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

StatefulSets.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(StatefulSets));
