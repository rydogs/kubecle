
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
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import ListIcon from '@material-ui/icons/List'
import LinearProgress from '@material-ui/core/LinearProgress';
import Moment from 'react-moment';
import { connect } from "react-redux";
import axios from 'axios';
import LogViewer from './logViewer';
import Editor from './editor';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
});

const mapStateToProps = state => {
    return { currentNs: state.currentNs };
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
        axios.get(`/api/namespace/${this.props.currentNs}/pods`)
            .then(res => {
                this.setState({ pods: res.data.body.items });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentNs !== prevProps.currentNs || this.state.time !== prevState.time) {
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
        axios.delete(`/api/namespace/${this.props.currentNs}/pods/${podName}`)
            .then(res => {
                console.log(res);
                this.tick();
            });
    }

    formatPodStatus(s, i) {
        if (s.containerStatuses) {
            let status = s.containerStatuses[i];
            if (status.state.running) {
                return <Button size="small" color="primary">Running</Button>;
            } else if (status.state.waiting) {
                return <Button size="small" color="secondary">{status.state.waiting.reason}</Button>;
            } else if (status.state.terminated) {
                return <Button size="small" color="secondary">{status.state.terminated.reason}</Button>;
            } else {
                return "Unknown";
            }            
        } else {
            return <Button size="small" color="secondary">{s.phase} - {s.reason}</Button>;
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

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid>
                    <Typography variant="title" gutterBottom>
                        Pods
                    </Typography>
                </Grid>
                <Paper className={classes.root}>
                    <LinearProgress variant="query" />
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Container Name</TableCell>
                                <TableCell>Image Version</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Restart Count</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.pods.map(s => {
                                return s.spec.containers.map((c, i) => {
                                    return (
                                        <TableRow key={s.metadata.uid + c.name}>
                                            <TableCell component="th" scope="row">
                                                {s.metadata.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {c.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {this.imageName(c.image)}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {this.formatPodStatus(s.status, i)}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {s.status.containerStatuses && s.status.containerStatuses[i].restartCount}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Moment fromNow>{s.metadata.creationTimestamp}</Moment>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                                    <Button mini color="primary" variant="fab" onClick={() => this.showInfo(s)}><InfoIcon /></Button>
                                                    <Button mini color="primary" variant="fab" onClick={() => this.viewLog(s.metadata.name, c.name)}><ListIcon /></Button>
                                                    <Button mini color="secondary" variant="fab" onClick={() => this.deletePod(s.metadata.name)}><DeleteIcon /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                });
                            })}
                        </TableBody>
                    </Table>
                    <div>
                        <LogViewer logUrl={this.state.logViewer.logUrl} open={this.state.logViewer.open} onClose={() => this.setState({logViewer: {open: false}})} />
                        <Editor content={this.state.editor.content} open={this.state.editor.open} onClose={() => this.setState({editor: {open: false}})} />
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