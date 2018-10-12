import React from 'react';
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

import { connect } from 'react-redux';

import axios from 'axios';

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

class ConfigMaps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            configmaps: [],
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchConfigMaps = this.fetchConfigMaps.bind(this);
    }

    componentDidMount() {
        this.fetchConfigMaps();
    }

    componentDidUpdate(prevProps) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;

        if (currentNs !== prevNs || currentContext !== prevContext) {
            this.fetchConfigMaps();
        }
    }

    fetchConfigMaps() {
        const { currentContext, currentNs } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/configmaps`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                this.setState({ configmaps: res.data.body.items });
            });
    }

    edit(configMap) {
        const { currentNs } = this.props;
        this.setState({
            editor: {
                open: true,
                content: configMap,
                editUrl: `/api/namespace/${currentNs}/configmaps/${configMap.metadata.name}`
            }
        });
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor } = this.state;

        return (
            <div>
                <Grid>
                    <Typography variant="title" className={classes.title}>
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
                            {this.state.configmaps.map(configMap => {
                                return (
                                    <TableRow key={configMap.metadata.uid}>
                                        <TableCell component="th" scope="row">
                                            {configMap.metadata.name}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <List dense>
                                                {configMap.data && Object.keys(configMap.data).map(k => {
                                                    return (
                                                        <ListItem key={k} disableGutters>
                                                            <ListItemText primary={`${k}: ${configMap.data[k]}`} />
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Moment fromNow>{configMap.metadata.creationTimestamp}</Moment>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Tooltip title="Edit" placement="top">
                                                    <Button
                                                        mini
                                                        color="primary"
                                                        variant="fab"
                                                        onClick={() => this.edit(configMap)}
                                                    >
                                                        <BuildIcon />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Editor
                        context={currentContext}
                        content={editor.content}
                        editUrl={editor.editUrl}
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

ConfigMaps.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(ConfigMaps));
