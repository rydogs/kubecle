import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
const { LazyLog } = require('react-lazylog');

const styles = theme => ({
});


class LogViewer extends React.Component {
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
                {logUrl && <LazyLog stream follow url={logUrl} height={600}></LazyLog>}
            </Dialog>
        )
    }
}

LogViewer.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    logUrl: PropTypes.string,
};

export default withStyles(styles)(LogViewer);