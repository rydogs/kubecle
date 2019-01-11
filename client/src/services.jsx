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

class Services extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [],
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchServices = this.fetchServices.bind(this);
    }

    componentDidMount() {
        this.fetchServices();
    }

    componentDidUpdate(prevProps) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;

        if (currentNs !== prevNs || currentContext !== prevContext) {
            this.fetchServices();
        }
    }

    fetchServices() {
        const { currentNs, currentContext } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/services`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ services: res.data.body.items });
                }
            });
    }

    edit(content) {
        const { currentNs } = this.props;

        this.setState({
            editor: {
                open: true,
                content,
                editUrl: `/api/namespace/${currentNs}/services/${content.metadata.name}`
            }
        });
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor, services } = this.state;

        return (
            <div>
                <Grid>
                    <Typography variant="h6" className={classes.title}>
                        Services
                    </Typography>
                </Grid>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>External Name</TableCell>
                                <TableCell>Ports</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {services.map(service => {
                                return (
                                    <TableRow key={service.metadata.uid}>
                                        <TableCell scope="row">{service.metadata.name}</TableCell>
                                        <TableCell scope="row">{service.spec.type}</TableCell>
                                        <TableCell scope="row">{service.spec.externalName}</TableCell>
                                        <TableCell scope="row">
                                            {service.spec.ports && service.spec.ports[0].port + ':'}
                                            {service.spec.ports && service.spec.ports[0].targetPort}
                                            {service.spec.ports && '/' + service.spec.ports[0].protocol}
                                        </TableCell>
                                        <TableCell scope="row">
                                            <Moment fromNow>{service.metadata.creationTimestamp}</Moment>
                                        </TableCell>
                                        <TableCell scope="row">
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <Tooltip title="Edit" placement="top">
                                                    <Fab
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => this.edit(service)}
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
                        onClose={() => this.setState({ editor: { open: false } })}
                    />
                </Paper>
            </div>
        );
    }
}

Services.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Services));
