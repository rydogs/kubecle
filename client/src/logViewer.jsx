import React from 'react'
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
const { LazyLog } = require('react-lazylog');

const LogViewer = props => {
    const { logUrl, context, open, onClose } = props;

    const fetchOptions = {
        headers: {
            "k8s-context": context
        }
    };

    return (
        <Dialog fullWidth={true} maxWidth="md" open={open} onClose={onClose}>
            <DialogTitle id="simple-dialog-title">
                Logs
            </DialogTitle>
            {logUrl &&
                <LazyLog
                    fetchOptions={fetchOptions}
                    stream
                    follow
                    selectableLines
                    url={logUrl}
                    height={600}>
                </LazyLog>
            }
        </Dialog>
    )
};

LogViewer.propTypes = {
    context: PropTypes.string,
    logUrl: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool,
};

export default LogViewer;
