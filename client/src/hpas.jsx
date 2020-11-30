import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Moment from 'react-moment';
import Fab from '@material-ui/core/Fab';
import BuildIcon from '@material-ui/icons/Build';
import Tooltip from '@material-ui/core/Tooltip';
import Editor from './editor';
import MaterialTable from 'material-table';
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
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    }
});

const mapStateToProps = ({ currentNs, currentContext }) => ({
    currentNs,
    currentContext
});

class HPAs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hpas: [],
            editor: {
                open: false,
                content: {}
            }
        };
        this.fetchHPAs = this.fetchHPAs.bind(this);
    }

    componentDidMount() {
        this.fetchHPAs();
    }

    componentDidUpdate(prevProps, prevStats) {
        const { currentNs, currentContext } = this.props;
        const { currentNs: prevNs, currentContext: prevContext } = prevProps;
        const { editor: prevEditor }  = prevStats;
        const { editor: currentEditor }  = this.state;

        if (currentNs !== prevNs || currentContext !== prevContext || currentEditor.open !== prevEditor.open) {
            this.fetchHPAs();
        }
    }

    fetchHPAs() {
        const { currentNs, currentContext } = this.props;
        axios
            .get(`/api/namespace/${currentNs}/hpas`, {
                headers: {
                    'k8s-context': currentContext
                }
            })
            .then(res => {
                if (res && res.data && res.data.body) {
                    this.setState({ hpas: this.transform(res.data.body.items) });
                }
            });
    }

    transform(data) {
        return data.map(d => {
            d.name = d.metadata.name;
            d.target = d.spec.scaleTargetRef.kind + ':' + d.spec.scaleTargetRef.name;
            return d;
        });
    }

    edit(content) {
        const { currentNs } = this.props;

        this.setState({
            editor: {
                open: true,
                content,
                editUrl: `/api/namespace/${currentNs}/hpas/${content.metadata.name}`
            }
        });
    }

    replicaInfo(hpa) {
        let data = [
            `Min: ${hpa.spec.minReplicas} Max: ${hpa.spec.maxReplicas}`,
            `Current: ${hpa.status.currentReplicas} Desired: ${hpa.status.desiredReplicas}`
        ];
        return (
            <SimpleList data={data} />
        );
    }

    actions(hpa) {
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
                        onClick={() => this.edit(hpa)}>
                        <BuildIcon />
                    </Fab>
                </Tooltip>
            </div>
       );
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor, hpas } = this.state;
        const columns = [
            { title: 'Name', field: 'name' },
            { title: 'Target', field: 'target' },
            { title: 'Replicas', render: rowData => `${rowData.spec.minReplicas}/${rowData.spec.maxReplicas}`},
            { title: 'Status', render: rowData => `${rowData.status.currentReplicas}/${rowData.status.desiredReplicas}`},
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
                    data={hpas}
                    title='Horizontal Pod Autoscaler'
                    options={{paging: false, sorting: true}}
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

HPAs.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(HPAs));