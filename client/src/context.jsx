import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { connect } from 'react-redux';
import { changeContext } from './actions';
import axios from 'axios';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 250
    },
    formControl: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: 16,
        marginBottom: 8,
        width: 300,
        color: 'white'
    },
    white: {
        color: 'white'
    }
});

const mapDispatchToProps = { changeContext };

const mapStateToProps = ({ currentNs, currentContext }) => ({
    currentNs,
    currentContext
});

class Context extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            namespace: props.currentNs,
            context: props.currentContext
        };
        this.handleChangeContext = this.handleChangeContext.bind(this);
        this.handleChangeNs = this.handleChangeNs.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    render() {
        const { classes } = this.props;
        const { context, namespace } = this.state;

        return (
            <div className={classes.container}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="context-select" className={classes.white}>
                        Context
                    </InputLabel>
                    <Select
                        value={context}
                        onChange={this.handleChangeContext}
                        className={classes.white}
                        inputProps={{ name: 'context', id: 'context-select' }}
                    >
                        {this.state.contexts &&
                            this.state.contexts.map((ctx, i) => (
                                <MenuItem key={i} value={ctx}>
                                    {ctx}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Namespace"
                    required
                    id="currentNs"
                    value={namespace}
                    InputLabelProps={{ className: classes.white }}
                    InputProps={{ className: classes.white }}
                    className={classes.textField}
                    margin="normal"
                    onChange={this.handleChangeNs}
                    onKeyPress={this.handleEnter}
                />
            </div>
        );
    }

    componentDidMount() {
        this.loadContext();
    }

    loadContext() {
        axios.get('/api/contexts').then(res => {
            this.setState({ contexts: res.data.contexts, context: this.state.context || res.data.currentContext });
        });
    }

    handleChangeNs(event) {
        this.setState({ namespace: event.target.value });
    }

    handleChangeContext(event) {
        this.setState(
            {
                namespace: 'default',
                context: event.target.value
            },
            () => this.props.changeContext(this.state.namespace, event.target.value)
        );
    }

    handleEnter(e) {
        if (e.key === 'Enter') {
            this.props.changeContext(this.state.namespace, this.state.context);
            event.preventDefault();
        }
    }
}

Context.propTypes = {
    changeContext: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    currentContext: PropTypes.string,
    currentNs: PropTypes.string.isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(Context));
