import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
const { LazyLog } = require('react-lazylog');
import axios from 'axios';

const styles = theme => ({
});


class LogViwer extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
        };
    }

    render() {
        const { classes, title, logUrl, open, onClose } = this.props;

        return (
            <Dialog fullWidth={true} maxWidth="md" open={open} onClose={onClose}>
                <DialogTitle id="simple-dialog-title">Logs</DialogTitle>
                <LazyLog follow url={logUrl} height={600}></LazyLog>
            </Dialog>
        )
    }
}

LogViwer.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    logUrl: PropTypes.string,
};

export default withStyles(styles)(LogViwer);