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
import Fab from '@material-ui/core/Fab';
import BuildIcon from '@material-ui/icons/Build';
import Tooltip from '@material-ui/core/Tooltip';
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

class Ingresses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ingresses: [],
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchIngresses = this.fetchIngresses.bind(this);
    }

    componentDidMount() {
        this.fetchIngresses();
    }

    componentDidUpdate(prevProps) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;

        if (currentNs !== prevNs || currentContext !== prevContext) {
            this.fetchIngresses();
        }
    }

    fetchIngresses() {
        axios
            .get(`/api/namespace/${this.props.currentNs}/ingresses`, {
                headers: { 'k8s-context': this.props.currentContext }
            })
            .then(res => {
                this.setState({ ingresses: res.data.body.items });
            });
    }

    edit(ingress) {
        const { currentNs } = this.props;
        this.setState({
            editor: {
                open: true,
                content: ingress,
                editUrl: `/api/namespace/${currentNs}/ingresses/${ingress.metadata.name}`
            }
        });
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor, ingresses } = this.state;

        return (
            <div>
                <Grid>
                    <Typography variant="h6" className={classes.title}>
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
                            {ingresses.map(ingress => {
                                return (
                                    <TableRow key={ingress.metadata.uid}>
                                        <TableCell scope="row">{ingress.metadata.name}</TableCell>
                                        <TableCell scope="row">
                                            {ingress.spec.rules
                                                .map(h => {
                                                    return h.host;
                                                })
                                                .join(', ')}
                                        </TableCell>
                                        <TableCell scope="row">
                                            <Moment fromNow>{ingress.metadata.creationTimestamp}</Moment>
                                        </TableCell>
                                        <TableCell scope="row">
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Tooltip title="Edit" placement="top">
                                                    <Fab
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => this.edit(ingress)}
                                                    >
                                                        <BuildIcon />
                                                    </Fab>
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
                        readOnly={true}
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

Ingresses.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Ingresses));
