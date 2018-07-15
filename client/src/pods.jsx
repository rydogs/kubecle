
import React from 'react'
import PropTypes from 'prop-types';
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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import InputIcon from '@material-ui/icons/Input';
import AssignmentIcon from '@material-ui/icons/Assignment'
import LinearProgress from '@material-ui/core/LinearProgress';
import Moment from 'react-moment';
import { connect } from "react-redux";
import axios from 'axios';
import LogViewer from './logViewer';
import Editor from './editor';
import copy from 'copy-to-clipboard';
import humanize from'string-humanize';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
    title: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    },
    centered: {
        textAlign: 'center'
    }
});

const mapStateToProps = state => {
    return { currentNs: state.currentNs, currentContext: state.currentContext };
};

class Pods extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pods: [],
            time: new Date(),
            logViewer: {
                open: false,
                logUrl: ''
            },
            editor: {
                open: false,
                content: {},
            }
        };
        this.intervalID = setInterval(() => this.tick(), 5000);
    }

    componentDidMount() {
        axios.get(`/api/namespace/${this.props.currentNs}/pods`, {headers: {'k8s-context': this.props.currentContext}})
            .then(res => {
                this.setState({ pods: res.data.body.items });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentNs !== prevProps.currentNs || this.props.currentContext !== prevProps.currentContext || this.state.time !== prevState.time) {
            this.componentDidMount();
        }
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    tick() {
        this.setState({time: new Date()});
    }
    
    viewLog(podName, containerName) {
        this.setState({logViewer: {open: true, logUrl: `/api/namespace/${this.props.currentNs}/pods/${podName}/logs/${containerName}`}});
    }

    showInfo(c) {
        this.setState({editor: {open: true, content: c}});
    }

    deletePod(podName) {
        axios.delete(`/api/namespace/${this.props.currentNs}/pods/${podName}`, {headers: {'k8s-context': this.props.currentContext}})
            .then(res => {
                console.log(res);
                this.tick();
            });
    }

    formatPodStatus(s, i) {
        if (s.containerStatuses) {
            let status = s.containerStatuses[i];
            if (status.state.running) {
                if (status.ready) {
                    return <Button fullWidth size="small" color="primary">Ready</Button>;
                } else {
                    return <Button fullWidth size="small" color="primary">Not Ready</Button>;
                }
            } else if (status.state.waiting) {
                if (status.state.waiting.message) {
                    return <Tooltip title={status.state.waiting.message} placement="top"><Button fullWidth size="small" color="secondary">{humanize(status.state.waiting.reason)}</Button></Tooltip>;
                } else {
                    return <Button fullWidth size="small" color="secondary">{humanize(status.state.waiting.reason)}</Button>
                }
            } else if (status.state.terminated) {
                return <Button fullWidth size="small" color="secondary">Terminated {humanize(status.state.terminated.reason)}</Button>;
            } else {
                return "Unknown";
            }
        } else {
            return <Button fullWidth size="small" color="secondary">{s.phase} - {s.reason}</Button>;
        }
    }

    imageName(image) {
        var imgStr;
        if (image.includes("/")) {
            imgStr = image.split("/")[1]
        } else {
            imgStr = image;
        }
        var parts = imgStr.split(":");
        if (parts.length > 1) {
            return (
                <span>{parts[1]}</span>
            );
        } else {
            return <span>{parts[0]}</span>;
        }
    }

    copySshToClipboard(podName, containerName) {
        let copyCmd = `kubectl exec -it ${podName} -n ${this.props.currentNs} -c ${containerName} sh`;
        if (this.props.currentContext) {
            copyCmd += ` --context ${this.props.currentContext}`;
        }
        copy(copyCmd);
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid>
                    <Typography variant="title" className={classes.title}>
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
                                <TableCell padding="dense" className={classes.centered}>Status</TableCell>
                                <TableCell padding="dense">Restart Count</TableCell>
                                <TableCell padding="dense">Created</TableCell>
                                <TableCell padding="dense">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.pods.map(s => {
                                return s.spec.containers.map((c, i) => {
                                    return (
                                        <TableRow key={s.metadata.uid + c.name}>
                                            <TableCell padding="dense" scope="row">
                                                {s.metadata.name}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {c.name}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {this.imageName(c.image)}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {this.formatPodStatus(s.status, i)}
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                {s.status.containerStatuses && 
                                                    (<Typography color={s.status.containerStatuses[i].restartCount > 0 ? 'error': 'primary'}>{s.status.containerStatuses[i].restartCount}</Typography>)
                                                }
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                <Moment fromNow>{s.metadata.creationTimestamp}</Moment>
                                            </TableCell>
                                            <TableCell padding="dense" scope="row">
                                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                                    <Tooltip title="Describe" placement="top">
                                                        <Button mini color="primary" variant="fab" onClick={() => this.showInfo(s)}><InfoIcon /></Button>
                                                    </Tooltip>
                                                    <Tooltip title="Log" placement="top">
                                                        <Button mini color="primary" variant="fab" onClick={() => this.viewLog(s.metadata.name, c.name)}><AssignmentIcon /></Button>
                                                    </Tooltip>
                                                    <Tooltip title="Copy SSH Command" placement="top">
                                                        <Button mini color="primary" variant="fab" onClick={() => this.copySshToClipboard(s.metadata.name, c.name)}><InputIcon /></Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" placement="top">
                                                        <Button mini color="secondary" variant="fab" onClick={() => this.deletePod(s.metadata.name)}><DeleteIcon /></Button>
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
                        <LogViewer context={this.props.currentContext} logUrl={this.state.logViewer.logUrl} open={this.state.logViewer.open} onClose={() => this.setState({logViewer: {open: false}})} />
                        <Editor context={this.props.currentContext} content={this.state.editor.content} open={this.state.editor.open} onClose={() => this.setState({editor: {open: false}})} />
                    </div>
                </Paper>
            </div>
        );
    }
}

Pods.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps)(Pods));