import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
const { LazyLog } = require('react-lazylog');

class LogViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            follow: true
        };
    }

    render() {
        const { logUrl, context, open, onClose } = this.props;
        const { follow } = this.state;
        const fetchOptions = {
            headers: {
                'k8s-context': context
            }
        };
    
        return (
            <Dialog fullWidth={true} maxWidth="xl" open={open} onClose={onClose}>
                <DialogTitle id="simple-dialog-title">Logs <Button onClick={() => this.setState({follow: !this.state.follow})} size="small" variant="contained" color={follow ? "primary": "default"}>Follow</Button></DialogTitle>
                {logUrl && <LazyLog fetchOptions={fetchOptions} stream follow={follow} selectableLines url={logUrl} height={600} />}
            </Dialog>
        );
    }
};

LogViewer.propTypes = {
    context: PropTypes.string,
    logUrl: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool
};

export default LogViewer;
