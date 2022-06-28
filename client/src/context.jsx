import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import axios from 'axios';
import useK8sContext from './contextStore';
import { connect } from 'react-redux';

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

const Context = (props) => {
    const { currentContext, currentNs, setContext, setNamespace} = useK8sContext()
    const [ contexts, setContexts ] = useState([])
    const { classes, dispatch } = props;

    useEffect(() => loadContext(), []);

    // backward compatiability with redux store
    const CHANGE_CONTEXT = 'CHANGE_CONTEXT';
    useEffect(() => {
        console.log("backwords push");
        dispatch({
            type: CHANGE_CONTEXT,
            namespace: currentNs,
            context: currentContext
        })
    }, [currentNs, currentContext]);

    const loadContext = () => {
        axios.get('/api/contexts').then(res => {
            setContexts(res.data.contexts)
            setContext(res.data.currentContext)
        });
    }

    const handleChangeNs = (event) => {
        setNamespace(event.target.value)
    }

    const handleChangeContext = (event) => {
        setContext(event.target.value)
    }

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            handleChangeNs(e);
            e.preventDefault();
        }
    }

    return (
        <div className={classes.container}>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="context-select" className={classes.white}>
                    Context
                </InputLabel>
                <Select
                    value={currentContext}
                    onChange={handleChangeContext}
                    className={classes.white}
                    inputProps={{ name: 'context', id: 'context-select' }}
                >
                    {contexts && contexts.map((ctx, i) => (
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
                value={currentNs}
                InputLabelProps={{ className: classes.white }}
                InputProps={{ className: classes.white }}
                className={classes.textField}
                margin="normal"
                onChange={handleChangeNs}
                onKeyPress={handleEnter}
            />
        </div>
    );
}

Context.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect()(withStyles(styles)(Context));
