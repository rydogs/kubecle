import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import Moment from 'react-moment';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import BuildIcon from '@material-ui/icons/Build';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import Editor from './editor';
import fmt from './fmt';
import useK8sContext from './contextStore';
import axios from 'axios';
import SimpleList from './simpleList';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 700
    },
    title: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    centered: {
        textAlign: 'center'
    }
});

const Jobs = (props) => {
    const [ jobs, setJobs ] = useState([])
    const [editor, setEditor] = useState({ open: false, content: {}})
    const { currentContext, currentNs } = useK8sContext()
    useEffect(() => fetchJobs(), [currentContext, currentNs])

    const fetchJobs = () => {
        axios
            .get(`/api/namespace/${currentNs}/jobs`, {
                headers: { 'k8s-context': currentContext }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    setJobs(transform(res.data.body.items));
                }
            });
    }

    const transform = (data) => {
        return data.map(d => {
            d.name = d.metadata.name;
            d.imageNames = fmt.containerImageNames(d.spec.template.spec.containers);
            return d;
        });
    }

    const edit = (job) => {
        setEditor(
            {
                open: true,
                content: job,
                editUrl: `/api/namespace/${currentNs}/jobs/${job.metadata.name}`
            }
        );
    }

    const deleteJob = (jobName) => {
        axios
            .delete(`/api/namespace/${currentNs}/jobs/${jobName}`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(fetchJobs);
    }

    const getStatus = (job) => {
        if (!job.status.conditions) {
            return (
                <Button size="small" fullWidth color="error">
                    Unknown
                </Button>
            );
        }
        let color = job.status.conditions[0].type === 'Failed' ? 'secondary' : 'primary';
        if (job.status.conditions[0].message) {
            return (
                <Tooltip title={job.status.conditions[0].message} placement="top">
                    <Button size="small" fullWidth color={color}>
                        {job.status.conditions[0].type}
                    </Button>
                </Tooltip>
            );
        } else {
            return (
                <Button size="small" fullWidth color={color}>
                    {job.status.conditions[0].type}
                </Button>
            );
        }
    }

    const actions = (job) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Tooltip title="Edit" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => edit(job)}>
                        <BuildIcon />
                    </Fab>
                </Tooltip>
                <Tooltip title="Delete" placement="top">
                    <Fab
                        size="small"
                        color="secondary"
                        onClick={() => deleteJob(job.metadata.name)}>
                        <DeleteIcon />
                    </Fab>
                </Tooltip>
            </div>
        );
    }
    const { classes } = props;
    const columns = [
        { title: 'Name', field: 'name' },
        { title: 'Image', field: 'imageNames', render: rowData => (<SimpleList data={rowData.imageNames} />) },
        { title: 'Status', headerStyle: {textAlign: 'center'}, render: rowData => getStatus(rowData) },
        { title: 'Created', render: rowData => (<Moment fromNow>{rowData.metadata.creationTimestamp}</Moment>) },
        { title: 'Actions', render: rowData => actions(rowData)},
    ].map(c => {
        c.cellStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.cellStyle);
        c.headerStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.headerStyle);
        return c;
    });

    return (
        <div style={{ maxWidth: '100%' }}>
            <MaterialTable
                columns={columns}
                data={jobs}
                title='Jobs'
                options={{paging: false, sorting: true}}
            />
            <Editor
                context={currentContext}
                content={editor.content}
                editUrl={editor.editUrl}
                readOnly={true}
                open={editor.open}
                onClose={() => setEditor({open: false})
                }
            />
        </div>
    );
}

Jobs.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Jobs);
