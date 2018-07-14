
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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
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
});

const mapStateToProps = state => {
    return { currentNs: state.currentNs, currentContext: state.currentContext };
};

class ConfigMaps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            configmaps: [],
            editor: {
                open: false,
                content: {},
            }
        };
    }

    componentDidMount() {
        axios.get(`/api/namespace/${this.props.currentNs}/configmaps`, { headers: { 'k8s-context': this.props.currentContext } })
            .then(res => {
                this.setState({ configmaps: res.data.body.items });
            });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentNs !== prevProps.currentNs || this.props.currentContext !== prevProps.currentContext) {
            this.componentDidMount();
        }
    }

    edit(c) {
        this.setState({ editor: { open: true, content: c, editUrl: `/api/namespace/${this.props.currentNs}/configmaps/${c.metadata.name}` } });
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid>
                    <Typography variant="title" gutterBottom>
                        Config Map
                    </Typography>
                </Grid>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Values</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.configmaps.map(s => {
                                return (
                                    <TableRow key={s.metadata.uid}>
                                        <TableCell component="th" scope="row">
                                            {s.metadata.name}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <List dense>
                                                {
                                                    Object.keys(s.data).map((k) => {
                                                        return (<ListItem disableGutters>
                                                             <ListItemText primary={`${k}: ${s.data[k]}`} />
                                                        </ListItem>)
                                                    })
                                                }
                                            </List>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Moment fromNow>{s.metadata.creationTimestamp}</Moment>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Tooltip id="tooltip-top" title="Edit" placement="top">
                                                    <Button mini color="primary" variant="fab" onClick={() => this.edit(s)}><BuildIcon /></Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Editor context={this.props.currentContext} content={this.state.editor.content} editUrl={this.state.editor.editUrl} open={this.state.editor.open} onClose={() => this.setState({ editor: { open: false } })} />
                </Paper>
            </div>
        );
    }
}

ConfigMaps.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps)(ConfigMaps));