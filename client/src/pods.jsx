import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import axios from 'axios';
import copy from 'copy-to-clipboard';
import humanize from 'string-humanize';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import ScreenShare from '@material-ui/icons/ScreenShare';
import AssignmentIcon from '@material-ui/icons/Assignment';
import LinearProgress from '@material-ui/core/LinearProgress';

import LogViewer from './logViewer';
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
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    },
    centered: {
        textAlign: 'center'
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
                    this.setState({ pods: res.data.body.items });
                }
            });
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
        axios
            .delete(`/api/namespace/${currentNs}/pods/${podName}`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(this.tick);
    }

    formatPodRestartCount(containerName, status) {
        if (status && status.containerStatuses) {
            var podStatus = status.containerStatuses.find(s => s.name === containerName);
            return (
                <Typography
                    color={
                        podStatus.restartCount > 0 ? 'error' : 'primary'
                    }
                >
                    {podStatus.restartCount}
                </Typography>
            )
        }
    }



    formatPodStatus(containerName, statusObj) {
        if (statusObj && statusObj.containerStatuses) {
            var status = statusObj.containerStatuses.find(s => s.name === containerName);

            if (!status) {
                return 'Unknown';
            } else if (status.state && status.state.running) {
                if (status.ready) {
                    return (
                        <Button fullWidth size="small" color="primary">
                            Ready
                        </Button>
                    );
                } else {
                    return (
                        <Button fullWidth size="small" color="primary">
                            Not Ready
                        </Button>
                    );
                }
            } else if (status.state && status.state.waiting) {
                if (status.state.waiting.message) {
                    return (
                        <Tooltip title={status.state.waiting.message} placement="top">
                            <Button fullWidth size="small" color="secondary">
                                {humanize(status.state.waiting.reason)}
                            </Button>
                        </Tooltip>
                    );
                } else {
                    return (
                        <Button fullWidth size="small" color="secondary">
                            {humanize(status.state.waiting.reason)}
                        </Button>
                    );
                }
            } else if (status.state && status.state.terminated) {
                return (
                    <Button fullWidth size="small" color="secondary">
                        Terminated {humanize(status.state.terminated.reason)}
                    </Button>
                );
            } else {
                return 'Unknown';
            }
        } else {
            const phaseReason = statusObj ? `${statusObj.phase} - ${statusObj.reason}` : 'Unknown phase/reason';

            return (
                <Button fullWidth size="small" color="secondary">
                    {phaseReason}
                </Button>
            );
        }
    }

    imageName(image) {
        const imgStr = image.includes('/') ? image.split('/')[1] : image;

        const parts = imgStr.split(':');
        const part = parts.length > 1 ? parts[1] : parts[0];

        return <span>{part}</span>;
    }

    copySshToClipboard(podName, containerName) {
        const { currentContext, currentNs } = this.props;
        let copyCmd = `kubectl exec -it ${podName} -n ${currentNs} -c ${containerName} sh`;

        if (currentContext) {
            copyCmd += ` --context ${currentContext}`;
        }

        copy(copyCmd);
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor, logViewer } = this.state;
        return (
            <div>
                <Grid>
                    <Typography variant="h6" className={classes.title}>
                        Pods
                    </Typography>
                </Grid>
                <Paper className={classes.root}>
                    <LinearProgress variant="query" />
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="dense">Name</TableCell>
                                <TableCell padding="dense">Container Name</TableCell>
                                <TableCell padding="dense">Image Version</TableCell>
                                <TableCell padding="dense" className={classes.centered}>
                                    Status
                                </TableCell>
                                <TableCell padding="dense">Restart Count</TableCell>
                                <TableCell padding="dense">Created</TableCell>
                                <TableCell padding="dense">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.pods.map(pod => {
                                return pod.spec.containers.map((container, i) => {
                                    return (
                                        <TableRow key={pod.metadata.uid + container.name}>
                                            <TableCell padding="dense" scope="row">
                                                { i == 0 && (pod.metadata.name) }
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {container.name}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {this.imageName(container.image)}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {this.formatPodStatus(container.name, pod.status)}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {this.formatPodRestartCount(container.name, pod.status)}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                <Moment fromNow>{pod.metadata.creationTimestamp}</Moment>
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'row'
                                                    }}
                                                >
                                                    <Tooltip title="Describe" placement="top">
                                                        <Fab
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => this.showInfo(pod)}
                                                        >
                                                            <InfoIcon />
                                                        </Fab>
                                                    </Tooltip>
                                                    <Tooltip title="Log" placement="top">
                                                        <Fab
                                                            size="small"
                                                            color="primary"
                                                            onClick={() =>
                                                                this.viewLog(pod.metadata.name, container.name)
                                                            }
                                                        >
                                                            <AssignmentIcon />
                                                        </Fab>
                                                    </Tooltip>
                                                    <Tooltip title="Copy Shell Command" placement="top">
                                                        <Fab
                                                            size="small"
                                                            color="primary"
                                                            onClick={() =>
                                                                this.copySshToClipboard(
                                                                    pod.metadata.name,
                                                                    container.name
                                                                )
                                                            }
                                                        >
                                                            <ScreenShare />
                                                        </Fab>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" placement="top">
                                                        <Fab
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() => this.deletePod(pod.metadata.name)}
                                                        >
                                                            <DeleteIcon />
                                                        </Fab>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                });
                            })}
                        </TableBody>
                    </Table>
                    <div>
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
                    </div>
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
