
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
import DeleteIcon from '@material-ui/icons/Delete';
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
    },
    centered: {
        textAlign: 'center'
    }
});

const mapStateToProps = state => {
    return { currentNs: state.currentNs, currentContext: state.currentContext };
};

class Jobs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jobs: [],
            editor: {
                open: false,
                content: {},
            }
        };
    }

    componentDidMount() {
        axios.get(`/api/namespace/${this.props.currentNs}/jobs`, {headers: {'k8s-context': this.props.currentContext}})
            .then(res => {
                this.setState({ jobs: res.data.body.items });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentNs !== prevProps.currentNs || this.props.currentContext !== prevProps.currentContext) {
            this.componentDidMount();
        }
    }

    edit(jobName) {
        this.setState({editor: {open: true, content: c, editUrl: `/api/namespace/${this.props.currentNs}/jobs/${jobName}`}});
    }

    delete(jobName) {
        axios.delete(`/api/namespace/${this.props.currentNs}/jobs/${jobName}`, {headers: {'k8s-context': this.props.currentContext}})
            .then(res => {
                this.componentDidMount();
            });    
    }

    getStatus(s) {
        if (!s.status.conditions) {
            return <Button mini fullWidth color="error">Unknown</Button>
        }
        let color = s.status.conditions[0].type === 'Failed' ? 'secondary' : 'primary';
        if (s.status.conditions[0].message) {
            return (
                <Tooltip title={s.status.conditions[0].message} placement="top">
                    <Button mini fullWidth color={color}>{s.status.conditions[0].type}</Button>
                </Tooltip>
            )
        } else {
            return <Button mini fullWidth color={color}>{s.status.conditions[0].type}</Button>
        }
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid>
                    <Typography variant="title" className={classes.title}>
                        Jobs
                    </Typography>
                </Grid>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Image Version</TableCell>
                                <TableCell className={classes.centered}>Status</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.jobs.map(s => {
                                return (
                                    <TableRow key={s.metadata.uid}>
                                        <TableCell scope="row">
                                            {s.metadata.name}
                                        </TableCell>
                                        <TableCell scope="row">
                                            {s.spec.template.spec.containers[0] && s.spec.template.spec.containers[0].image.includes("/") ? s.spec.template.spec.containers[0].image.split("/")[1] : s.spec.template.spec.containers[0].image}
                                        </TableCell>
                                        <TableCell scope="row">
                                            {this.getStatus(s)}
                                        </TableCell>
                                        <TableCell scope="row">
                                            <Moment fromNow>{s.metadata.creationTimestamp}</Moment>
                                        </TableCell>
                                        <TableCell scope="row">
                                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                                    <Tooltip title="Edit" placement="top">
                                                        <Button mini color="primary" variant="fab" onClick={() => this.edit(s.metadata.name)}><BuildIcon /></Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" placement="top">
                                                        <Button mini color="secondary" variant="fab" onClick={() => this.delete(s.metadata.name)}><DeleteIcon /></Button>
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

Jobs.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps)(Jobs));