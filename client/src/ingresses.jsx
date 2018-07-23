
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
import Moment from 'react-moment';
import Button from '@material-ui/core/Button';
import BuildIcon from '@material-ui/icons/Build';
import Tooltip from '@material-ui/core/Tooltip';
import Editor from './editor';

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
    title: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    }
});

const mapStateToProps = state => {
    return { currentNs: state.currentNs, currentContext: state.currentContext };
};

class Ingresses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ingresses: [],
            editor: {
                open: false,
                content: {},
            }
        };
    }

    componentDidMount() {
        axios.get(`/api/namespace/${this.props.currentNs}/ingresses`, {headers: {'k8s-context': this.props.currentContext}})
            .then(res => {
                this.setState({ ingresses: res.data.body.items });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentNs !== prevProps.currentNs || this.props.currentContext !== prevProps.currentContext) {
            this.componentDidMount();
        }
    }

    edit(c) {
        this.setState({editor: {open: true, content: c, editUrl: `/api/namespace/${this.props.currentNs}/ingresses/${c.metadata.name}`}});
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid>
                    <Typography variant="title" className={classes.title}>
                        Ingresses
                    </Typography>
                </Grid>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Hosts</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.ingresses.map(s => {
                                return (
                                    <TableRow key={s.metadata.uid}>
                                        <TableCell scope="row">
                                            {s.metadata.name}
                                        </TableCell>
                                        <TableCell scope="row">
                                            {s.spec.rules.map(h => {return h.host}).join(", ")}
                                        </TableCell>
                                        <TableCell scope="row">
                                            <Moment fromNow>{s.metadata.creationTimestamp}</Moment>
                                        </TableCell>
                                        <TableCell scope="row">
                                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                                    <Tooltip title="Edit" placement="top">
                                                        <Button mini color="primary" variant="fab" onClick={() => this.edit(s)}><BuildIcon /></Button>
                                                    </Tooltip>
                                                </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Editor context={this.props.currentContext} content={this.state.editor.content} editUrl={this.state.editor.editUrl} readOnly={true} open={this.state.editor.open} onClose={() => this.setState({editor: {open: false}})} />
                </Paper>
            </div>
        );
    }
}

Ingresses.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps)(Ingresses));