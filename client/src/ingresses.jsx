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
import SimpleList from './simpleList';
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
                this.setState({ ingresses: this.transform(res.data.body.items) });
            });
    }

    transform(data) {
        return data.map(d => {
            d.name = d.metadata.name;
            d.hosts = fmt.ingressHost(d.spec.rules);
            return d;
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

    actions(ingress) {
        return (
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
        );
    }

    render() {
        const { classes, currentContext } = this.props;
        const { editor, ingresses } = this.state;
        const columns = [
            { title: 'Name', field: 'name' },
            { title: 'Hosts', field: 'hosts', render: rowData => (<SimpleList data={rowData.hosts} />) },
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
                    data={ingresses}
                    title='Ingresses'
                    options={{paging: false, sorting: false}}
                />
`               <Editor
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

Ingresses.propTypes = {
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Ingresses));
