import React from 'react';
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
import { connect } from 'react-redux';

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

const mapStateToProps = ({ currentNs, currentContext }) => ({
    currentNs,
    currentContext
});

class Cronjobs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cronjobs: [],
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchCronjobs = this.fetchCronjobs.bind(this);
    }

    componentDidMount() {
        this.fetchCronjobs();
    }

    componentDidUpdate(prevProps, prevStats) {
        const { currentContext, currentNs } = this.props;
        const { currentContext: prevContext, currentNs: prevNs } = prevProps;
        const { editor: prevEditor }  = prevStats;
        const { editor: currentEditor }  = this.state;
        if (currentNs !== prevNs || currentContext !== prevContext || currentEditor.open !== prevEditor.open) {
            this.fetchCronjobs();
        }
    }

    fetchCronjobs() {
        const { currentContext, currentNs } = this.props;

        axios
            .get(`/api/namespace/${currentNs}/cronjobs`, {
                headers: { 'k8s-context': currentContext }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ cronjobs: this.transform(res.data.body.items) });
                }
            });
    }

    transform(data) {
        return data.map(d => {
            d.name = d.metadata.name;
            d.imageNames = fmt.containerImageNames(d.spec.jobTemplate.spec.template.spec.containers);
            return d;
        });
    }

    edit(cronjob) {
        const { currentNs } = this.props;

        this.setState({
            editor: {
                open: true,
                content: cronjob,
                editUrl: `/api/namespace/${currentNs}/cronjobs/${cronjob.metadata.name}`
            }
        });
    }

    delete(name) {
        const { currentContext, currentNs } = this.props;

        axios
            .delete(`/api/namespace/${currentNs}/cronjobs/${name}`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(this.fetchCronjobs);
    }

    actions(cronjob) {
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Tooltip title="Edit" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.edit(cronjob)}>
                        <BuildIcon />
                    </Fab>
                </Tooltip>
                <Tooltip title="Delete" placement="top">
                    <Fab
                        size="small"
                        color="secondary"
                        onClick={() => this.delete(cronjob.metadata.name)}>
                        <DeleteIcon />
                    </Fab>
                </Tooltip>
            </div>
        );
    }

    render() {
        const { classes, currentContext } = this.props;
        const { cronjobs, editor } = this.state;
        const columns = [
            { title: 'Name', field: 'name' },
            { title: 'Image', field: 'imageNames', render: rowData => (<SimpleList data={rowData.imageNames} />) },
            { title: 'Schedule', field: 'spec.schedule' },
            { title: 'Suspended', field: 'spec.suspend', render: rowData => rowData.suspend ? 'true':'false' },
            { title: 'Concurrency Policy', field: 'spec.concurrencyPolicy' },
            { title: 'Last Scheduled', render: rowData => (<Moment fromNow>{rowData.status.lastScheduleTime}</Moment>) },
            { title: 'Created', render: rowData => (<Moment fromNow>{rowData.metadata.creationTimestamp}</Moment>) },
            { title: 'Actions', render: rowData => this.actions(rowData)},
        ].map(c => {
            c.cellStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.cellStyle);
            c.headerStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.headerStyle);
            return c;
        });

        return (
            <div style={{ maxWidth: '100%' }}>
                <MaterialTable
                    columns={columns}
                    data={cronjobs}
                    title='Cron Jobs'
                    options={{paging: false, sorting: true}}
                />
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
            </div>
        );
    }
}

Cronjobs.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Cronjobs));
