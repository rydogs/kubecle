import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Moment from "react-moment";
import Button from "@material-ui/core/Button";
import BuildIcon from "@material-ui/icons/Build";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import Editor from "./editor";

import { connect } from "react-redux";

import axios from "axios";

const styles = theme => ({
    root: {
        width: "100%",
        overflowX: "auto"
    },
    table: {
        minWidth: 700
    },
    title: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    },
    centered: {
        textAlign: "center"
    }
});

const mapStateToProps = ({ currentNs, currentContext }) => ({
    currentNs,
    currentContext
});

class Jobs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jobs: [],
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchJobs = this.fetchJobs.bind(this);
    }

    componentDidMount() {
        this.fetchJobs();
    }

    componentDidUpdate(prevProps) {
        const { currentContext, currentNs } = this.props;
        const { currentContext: prevContext, currentNs: prevNs } = prevProps;

        if (currentNs !== prevNs || currentContext !== prevContext) {
            this.fetchJobs();
        }
    }

    fetchJobs() {
        const { currentContext, currentNs } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/jobs`, {
                headers: { "k8s-context": currentContext }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ jobs: res.data.body.items });
                }
            });
    }

    edit(job) {
        const { currentNs } = this.props;

        this.setState({
            editor: {
                open: true,
                content: job,
                editUrl: `/api/namespace/${currentNs}/jobs/${job.metadata.name}`
            }
        });
    }

    delete(jobName) {
        const { currentContext, currentNs } = this.props;

        axios
            .delete(`/api/namespace/${currentNs}/jobs/${jobName}`, {
                headers: {
                    "k8s-context": currentContext
                }
            }).then(this.fetchJobs);
    }

    getStatus(job) {
        if (!job.status.conditions) {
            return (
                <Button mini fullWidth color="error">
                    Unknown
                </Button>
            );
        }
        let color = job.status.conditions[0].type === "Failed" ? "secondary" : "primary";
        if (job.status.conditions[0].message) {
            return (
                <Tooltip title={job.status.conditions[0].message} placement="top">
                    <Button mini fullWidth color={color}>
                        {job.status.conditions[0].type}
                    </Button>
                </Tooltip>
            );
        } else {
            return (
                <Button mini fullWidth color={color}>
                    {job.status.conditions[0].type}
                </Button>
            );
        }
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor } = this.state;

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
                            {this.state.jobs.map(job =>
                                <TableRow key={job.metadata.uid}>
                                    <TableCell scope="row">{job.metadata.name}</TableCell>
                                    <TableCell scope="row">
                                        {job.spec.template.spec.containers[0] &&
                                        job.spec.template.spec.containers[0].image.includes("/")
                                            ? job.spec.template.spec.containers[0].image.split("/")[1]
                                            : job.spec.template.spec.containers[0].image}
                                    </TableCell>
                                    <TableCell scope="row">{this.getStatus(job)}</TableCell>
                                    <TableCell scope="row">
                                        <Moment fromNow>{job.metadata.creationTimestamp}</Moment>
                                    </TableCell>
                                    <TableCell scope="row">
                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                            <Tooltip title="Edit" placement="top">
                                                <Button
                                                    mini
                                                    color="primary"
                                                    variant="fab"
                                                    onClick={() => this.edit(job)}
                                                >
                                                    <BuildIcon />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Delete" placement="top">
                                                <Button
                                                    mini
                                                    color="secondary"
                                                    variant="fab"
                                                    onClick={() => this.delete(job.metadata.name)}
                                                >
                                                    <DeleteIcon />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
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

Jobs.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Jobs));
