import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Moment from 'react-moment';
import Button from '@material-ui/core/Button';
import BuildIcon from '@material-ui/icons/Build';
import { connect } from 'react-redux';
import Editor from './editor';

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

class Deployments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deployments: [],
            editor: {
                open: false,
                editUrl: '',
                content: {}
            }
        };
        this.fetchDeployments = this.fetchDeployments.bind(this);
    }

    componentDidMount() {
        this.fetchDeployments();
    }

    componentDidUpdate(prevProps) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;

        if (currentNs !== prevNs || currentContext !== prevContext) {
            this.fetchDeployments();
        }
    }

    fetchDeployments() {
        const { currentContext, currentNs } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/deployments`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ deployments: res.data.body.items });
                }
            });
    }

    edit(deployment) {
        const { currentNs } = this.props;

        this.setState({
            editor: {
                open: true,
                content: deployment,
                editUrl: `/api/namespace/${currentNs}/deployments/${deployment.metadata.name}`
            }
        });
    }

    render() {
        const { classes, currentContext } = this.props;
        const { deployments, editor } = this.state;

        return (
            <div>
                <Grid>
                    <Typography variant="title" className={classes.title}>
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
                                <TableCell>Port</TableCell>
                                <TableCell>Last Updated</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deployments.map(deployment => {
                                return deployment.spec.template.spec.containers.map(container => {
                                    return (
                                        <TableRow key={deployment.metadata.uid + container.name}>
                                            <TableCell scope="row">{container.name}</TableCell>
                                            <TableCell scope="row">{deployment.spec.replicas}</TableCell>
                                            <TableCell scope="row">
                                                {container.image.includes('/')
                                                    ? container.image.split('/')[1]
                                                    : container.image}
                                            </TableCell>
                                            <TableCell scope="row">
                                                {container.ports && container.ports[0].containerPort}
                                            </TableCell>
                                            <TableCell scope="row">
                                                <Moment fromNow>{deployment.status.conditions[0].lastUpdateTime}</Moment>
                                            </TableCell>
                                            <TableCell scope="row">
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    <Tooltip title="Edit" placement="top">
                                                        <Button
                                                            mini
                                                            color="primary"
                                                            variant="fab"
                                                            onClick={() => this.edit(deployment)}
                                                        >
                                                            <BuildIcon />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                });
                            })}
                        </TableBody>
                    </Table>
                    <Editor
                        context={currentContext}
                        content={editor.content}
                        editUrl={editor.editUrl}
                        open={editor.open}
                        onClose={() => this.setState({ editor: { open: false } })}
                    />
                </Paper>
            </div>
        );
    }
}

Deployments.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Deployments));
