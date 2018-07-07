
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
import Moment from 'react-moment';
import { connect } from "react-redux";

import axios from 'axios';

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
        };
    }

    componentDidMount() {
        axios.get(`/api/namespace/${this.props.currentNs}/pods`)
            .then(res => {
                this.setState({ pods: res.data.body.items });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentNs !== prevProps.currentNs) {
            this.componentDidMount();
        }
    }

    formatPodStatus(status) {
        if (status.state.running) {
            return <Button size="small" color="primary">Running</Button>;
        } else if (status.state.waiting) {
            return <Button size="small" color="secondary">{status.state.waiting.reason}</Button>;
        } else if (status.state.terminated) {
            return <Button size="small" color="secondary">{status.state.terminated.reason}</Button>;
        } else {
            return "Unknown";
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

                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Restart Count</TableCell>
                                <TableCell>Created</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.pods.map(s => {
                                return s.spec.containers.map((c, i) => {
                                    return (
                                        <TableRow key={s.metadata.id}>
                                            <TableCell component="th" scope="row">
                                                {s.metadata.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {c.image.includes("/") ? c.image.split("/")[1] : c.image}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {this.formatPodStatus(s.status.containerStatuses[i])}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {s.status.containerStatuses[i].restartCount}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Moment fromNow>{s.metadata.creationTimestamp}</Moment>
                                            </TableCell>
                                        </TableRow>
                                    );
                                });
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            </div>
        );
    }
}

Pods.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps)(Pods));