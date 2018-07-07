
import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { connect } from "react-redux";
import { changeNs } from './actions';

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
        changeNs: (url) => dispatch(changeNs(url))
    };
};

class CurrentNs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            namespace: 'default',
        };
    }
    
    render() {
      const { classes } = this.props;
  
      return (
        <form className={classes.container} noValidate autoComplete="off" action="" onSubmit={() => this.handleSubmit()}>
            <TextField label="Namespace" required id="currentNs" value={this.state.namespace} className={classes.textField} margin="normal" onChange={(e) => this.handleChange(e)} />
        </form>
      )
    }

    handleChange(event) {
        this.setState({namespace: event.target.value})
    }

    handleSubmit() {
        this.props.changeNs(this.state.namespace);
        event.preventDefault();
    }
}

CurrentNs.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(connect(null, mapDispatchToProps)(CurrentNs));