
import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { connect } from "react-redux";
import { changeContext } from './actions';

const styles = theme => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 300,
    },
    input: {
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
        <form className={classes.container} noValidate autoComplete="off" action="">
            <TextField label="Context" id="currentContext" value={this.state.context} className={classes.textField} margin="normal" onChange={(e) => this.handleChangeContext(e)} />
            <TextField label="Namespace" required id="currentNs" value={this.state.namespace} className={classes.textField} margin="normal" onChange={(e) => this.handleChangeNs(e)} />
            <Button onClick={() => this.handleSubmit()} color="secondary">Set</Button>
        </form>
      )
    }

    handleChangeNs(event) {
        this.setState({namespace: event.target.value});
    }

    handleChangeContext(event) {
        this.setState({namespace: "default", context: event.target.value});
    }

    handleSubmit() {
        this.props.changeContext(this.state.namespace, this.state.context);
        event.preventDefault();
    }
}

Context.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Context));