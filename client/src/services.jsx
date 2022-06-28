import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Moment from 'react-moment';
import Fab from '@material-ui/core/Fab';
import BuildIcon from '@material-ui/icons/Build';
import Tooltip from '@material-ui/core/Tooltip';
import Editor from './editor';
import MaterialTable from 'material-table';
import fmt from './fmt';
import SimpleList from './simpleList';
import useK8sContext from './contextStore';

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
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    }
});

const Services = (props) => {
    const [services, setServices] = useState([])
    const [editor, setEditor] = useState({ open: false, content: {}})
    const { currentContext, currentNs } = useK8sContext()

    useEffect(() => fetchServices(), [currentContext, currentNs])

    const fetchServices = () => {
        axios
            .get(`/api/namespace/${currentNs}/services`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    setServices(transform(res.data.body.items));
                }
            });
    }

    const transform = (data) => {
        return data.map(d => {
            d.name = d.metadata.name;
            d.type = d.spec.type;
            d.selectors = d.spec.selector;
            d.ports = fmt.servicePorts(d.spec.ports);
            return d;
        });
    }

    const edit = (content) => {
        setEditor({
            open: true,
            content,
            editUrl: `/api/namespace/${currentNs}/services/${content.metadata.name}`
        });
    }

    const actions = (service) => {
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
                        onClick={() => edit(service)}>
                        <BuildIcon />
                    </Fab>
                </Tooltip>
            </div>
       );
    }

    const columns = [
        { title: 'Name', field: 'name' },
        { title: 'Type', field: 'type' },
        { title: 'Selectors', field: 'selectors', render: rowData => <SimpleList data={rowData.selectors} /> },
        { title: 'Ports', field: 'ports', render: rowData => (<SimpleList data={rowData.ports} />) },
        { title: 'Created', render: rowData => (<Moment fromNow>{rowData.metadata.creationTimestamp}</Moment>) },
        { title: 'Actions', render: rowData => actions(rowData)},
    ].map(c => {
        c.cellStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.cellStyle);
        c.headerStyle = Object.assign({padding: '4px 24px 4px 14px'}, c.headerStyle);
        return c;
    });

    return (
        <div style={{ maxWidth: '100%' }}>
            <span>{currentContext} {currentNs}</span>
            <MaterialTable
                columns={columns}
                data={services}
                title='Services'
                options={{paging: false, sorting: true}}
            />
            <Editor
                content={editor.content}
                editUrl={editor.editUrl}
                open={editor.open}
                onClose={() => setEditor({ open: false })}
            />
        </div>
    );
}

Services.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Services);
