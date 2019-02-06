import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import axios from 'axios';
import copy from 'copy-to-clipboard';
import humanize from 'string-humanize';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import ScreenShare from '@material-ui/icons/ScreenShare';
import AssignmentIcon from '@material-ui/icons/Assignment';
import LinearProgress from '@material-ui/core/LinearProgress';
import MaterialTable from 'material-table';
import fmt from './fmt';
import LogViewer from './logViewer';
import Editor from './editor';
import * as _ from 'lodash';

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

class Pods extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pods: [],
            logViewer: {
                open: false,
                logUrl: ''
            },
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchPods = this.fetchPods.bind(this);
        this.tick = this.tick.bind(this);
        this.intervalID = setInterval(this.fetchPods, 10000);
    }

    componentDidMount() {
        this.fetchPods();
    }

    componentDidUpdate(prevProps, prevState) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;
        if (currentNs !== prevNs || currentContext !== prevContext) {
            this.fetchPods();
        }
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    fetchPods() {
        if (document.visibilityState !== 'visible') { return }
        const { currentContext, currentNs } = this.props;
        axios
            .get(`/api/namespace/${currentNs}/pods`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ pods: this.transform(res.data.body.items)});
                }
            });
    }

    transform(data) {
        return _.flatMap(data, p => p.spec.containers.map(c => {
            c.podName = p.metadata.name;
            c.imageVersion = fmt.imageVersion(c.image);
            if (p.status.containerStatuses) {
                c.status = p.status.containerStatuses.find(s => s.name === c.name);
            }
            c.statusText = this.getContainerStatusText(c.status, p.status);
            c.restartCount = this.getContainerRestartCount(c.name, p.status);
            c.creationTimestamp = p.metadata.creationTimestamp;
            return c;
        }));
    }

    tick() {
        this.setState({ time: new Date() });
    }

    viewLog(podName, containerName) {
        const { currentNs } = this.props;

        this.setState({
            logViewer: {
                open: true,
                logUrl: `/api/namespace/${currentNs}/pods/${podName}/logs/${containerName}`
            }
        });
    }

    showInfo(content) {
        this.setState({
            editor: {
                open: true,
                content
            }
        });
    }

    deletePod(podName) {
        const { currentContext, currentNs } = this.props;
        axios.delete(`/api/namespace/${currentNs}/pods/${podName}`, {
                headers: {
                    'k8s-context': currentContext
                }
            }).then(this.tick);
    }

    getContainerRestartCount(containerName, status) {
        if (status && status.containerStatuses) {
            var podStatus = status.containerStatuses.find(s => s.name === containerName);
            return podStatus && podStatus.restartCount;
        }
    }

    getContainerStatus

    getContainerStatusText(status, podStatus) {
        if (podStatus && status) {
            if (!status) {
                return 'Unknown';
            } else if (status.state && status.state.running) {
                if (status.ready) {
                    return 'Ready';
                } else {
                    return 'Not Ready';
                }
            } else if (status.state && status.state.waiting) {
                if (status.state.waiting.message) {
                    return humanize(status.state.waiting.reason);
                } else {
                    return humanize(status.state.waiting.reason);
                }
            } else if (status.state && status.state.terminated) {
                return `Terminated ${humanize(status.state.terminated.reason)}`
            } else {
                return 'Unknown';
            }
        } else {
            return podStatus ? `${podStatus.phase} - ${podStatus.reason}` : 'Unknown phase/reason';
        }
    }

    copySshToClipboard(podName, containerName) {
        const { currentContext, currentNs } = this.props;
        let copyCmd = `kubectl exec -it ${podName} -n ${currentNs} -c ${containerName} sh`;

        if (currentContext) {
            copyCmd += ` --context ${currentContext}`;
        }

        copy(copyCmd);
    }

    actions(container) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                <Tooltip title="Describe" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.showInfo(container)}>
                        <InfoIcon />
                    </Fab>
                </Tooltip>
                <Tooltip title="Log" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.viewLog(container.podName, container.name)}>
                        <AssignmentIcon />
                    </Fab>
                </Tooltip>
                <Tooltip title="Copy Shell Command" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.copySshToClipboard(container.podName, container.name)}>
                        <ScreenShare />
                    </Fab>
                </Tooltip>
                <Tooltip title="Delete" placement="top">
                    <Fab
                        size="small"
                        color="secondary"
                        onClick={() => this.deletePod(container.podName)} >
                        <DeleteIcon />
                    </Fab>
                </Tooltip>
            </div> 
        );
    }

    render() {
        const { classes, currentContext } = this.props;
        const { pods, editor, logViewer } = this.state;
        const columns = [
            { title: 'Name', field: 'podName' },
            { title: 'Container Name', field: 'name' },
            { title: 'Image Version', field: 'imageVersion' },
            { title: 'Status', field: 'statusText', headerStyle: {textAlign: 'center'},
                render: rowData => (<Button fullWidth size="small" color={rowData.statusText === 'Ready' ? 'primary' : 'secondary'}>{rowData.statusText}</Button>)
            },
            { title: 'Restart Count', field: 'restartCount',
                render: rowData => (<Typography color={rowData.restartCount > 0 ? 'error' : 'primary'}>{rowData.restartCount}</Typography>)
            },
            { title: 'Created', render: rowData => (<Moment fromNow>{rowData.creationTimestamp}</Moment>) },
            { title: 'Actions', render: rowData => this.actions(rowData)},
        ].map(c => {
            c.cellStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.cellStyle);
            c.headerStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.headerStyle);
            return c;
        });
        return (
            <div style={{ maxWidth: '100%' }}>
                <Paper className={classes.root}>
                    <LinearProgress variant="query" />
                    <MaterialTable
                        columns={columns}
                        data={pods}
                        title='Pods'
                        options={{paging: false, sorting: false}}
                    />
                    <LogViewer
                        context={currentContext}
                        logUrl={logViewer.logUrl}
                        open={logViewer.open}
                        onClose={() =>
                            this.setState({
                                logViewer: {
                                    open: false
                                }
                            })
                        }
                    />
                    <Editor
                        context={currentContext}
                        content={editor.content}
                        open={editor.open}
                        onClose={() =>
                            this.setState({
                                editor: {
                                    open: false
                                }
                            })
                        }
                    />
                </Paper>
            </div>
        );
    }
}

Pods.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Pods));
