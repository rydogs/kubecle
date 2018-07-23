
import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { connect } from "react-redux";
import { changeContext } from './actions';
import axios from 'axios';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 250,
    },
    formControl: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        marginTop: 16,
        marginBottom: 8,
        width: 300,
        color: "white"
    },
    white: {
        color: "white"
    }
});

const mapDispatchToProps = (dispatch) => {
    return {
        changeContext: (ns, context) => dispatch(changeContext(ns, context))
    };
};

const mapStateToProps = state => {
    return { currentNs: state.currentNs, currentContext: state.currentContext };
};

class Context extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            namespace: props.currentNs,
            context: props.currentContext,
        };
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.container}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="context-select" className={classes.white}>Context</InputLabel>
                    <Select value={this.state.context} onChange={(e) => this.handleChangeContext(e)} className={classes.white} inputProps={{ name: 'context', id: 'context-select' }}>
                        {
                            this.state.contexts &&
                            (
                                this.state.contexts.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)
                            )
                        }
                    </Select>
                </FormControl>
                <TextField label="Namespace" required id="currentNs" value={this.state.namespace} InputLabelProps={{ className: classes.white }} InputProps={{ className: classes.white }} className={classes.textField} margin="normal"
                    onChange={(e) => this.handleChangeNs(e)} onKeyPress={(e) => this.handleEnter(e)} />
            </div>
        )
    }
 
    componentDidMount() {
        this.loadContext();
    }

    loadContext() {
        axios.get(`/api/contexts`)
            .then(res => {
                this.setState({ contexts: res.data.contexts, context: this.state.context || res.data.currentContext });
            });
    }

    handleChangeNs(event) {
        this.setState({ namespace: event.target.value });
    }

    handleChangeContext(event) {
        this.setState({ namespace: "default", context: event.target.value }, (e) => this.props.changeContext(this.state.namespace, event.target.value));
    }

    handleEnter(e) {
        if (e.key === 'Enter') {
            this.props.changeContext(this.state.namespace, this.state.context);
            event.preventDefault();
        }
    }
}

Context.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Context));