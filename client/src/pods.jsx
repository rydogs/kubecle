
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

class Pods extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pods: [],
        };
    }

    componentDidMount() {
        axios.get(`/api/namespace/dev05/pods`)
            .then(res => {
                this.setState({ pods: res.data.body.items });
            });
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
                                <TableCell>Created</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.pods.map(s => {
                                return (
                                    <TableRow key={s.metadata.id}>
                                        <TableCell component="th" scope="row">
                                            {s.metadata.name}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {s.spec.containers[0].image.includes("/") ? s.spec.containers[0].image.split("/")[1] : s.spec.containers[0].image}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {s.status.phase}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {s.metadata.creationTimestamp}
                                        </TableCell>
                                    </TableRow>
                                );
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

export default withStyles(styles)(Pods);