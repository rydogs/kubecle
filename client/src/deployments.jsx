
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

class Deployments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deployments: [],
        };
    }

    componentDidMount() {
        axios.get(`/api/namespace/dev05/deployments`)
            .then(res => {
                console.log(res.data.body.items);
                this.setState({ deployments: res.data.body.items });
            });
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid>
                    <Typography variant="title" gutterBottom>
                        Deployments
                    </Typography>
                </Grid>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Replicas</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Created</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.deployments.map(s => {
                                return (
                                    <TableRow key={s.metadata.id}>
                                        <TableCell component="th" scope="row">
                                            {s.metadata.name}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {s.spec.replicas}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {s.spec.template.spec.containers[0].image.includes("/") ? s.spec.template.spec.containers[0].image.split("/")[1] : s.spec.template.spec.containers[0].image}
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

Deployments.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Deployments);