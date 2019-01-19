import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Moment from 'react-moment';
import Fab from '@material-ui/core/Fab';
import BuildIcon from '@material-ui/icons/Build';
import Tooltip from '@material-ui/core/Tooltip';
import Editor from './editor';
import MaterialTable from 'material-table';
import fmt from './fmt';
import { connect } from 'react-redux';
import SimpleList from './simpleList';

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

    actions(service) {
       return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                <Tooltip title="Edit" placement="top">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => this.edit(service)}>
                        <BuildIcon />
                    </Fab>
                </Tooltip>
            </div>
       );
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor, services } = this.state;

        return (
            <div style={{ maxWidth: '100%' }}>
                <MaterialTable
                    columns={[
                        { title: 'Name', render: rowData => rowData.metadata.name },
                        { title: 'Type', render: rowData => rowData.spec.type },
                        { title: 'Selectors', render: rowData => <SimpleList data={rowData.spec.selector} /> },
                        { title: 'Ports', render: rowData => (<SimpleList data={fmt.servicePorts(rowData.spec.ports)} />) },
                        { title: 'Created', render: rowData => (<Moment fromNow>{rowData.metadata.creationTimestamp}</Moment>) },
                        { title: 'Actions', render: rowData => this.actions(rowData)},
                    ]}
                    data={services}
                    title='Services'
                    options={{paging: false, search: false, sorting: false}}
                />
                <Editor
                    context={currentContext}
                    content={editor.content}
                    editUrl={editor.editUrl}
                    readOnly={true}
                    open={editor.open}
                    onClose={() => this.setState({ editor: { open: false } })}
                />
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
