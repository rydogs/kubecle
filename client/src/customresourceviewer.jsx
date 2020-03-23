import React from 'react';
import PropTypes from 'prop-types';
import ReactJson from 'react-json-view'
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const CustomResourceViewer = props => {
    const { content, open, onClose } = props;

    return (
        <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose}>
            <DialogTitle id="simple-dialog-title">{props.name || 'Viewer'}</DialogTitle>
            <ReactJson
                displayDataTypes={false}
                src={content}
            />
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

CustomResourceViewer.defaultProps = {
    name: 'Viewer',
};

CustomResourceViewer.propTypes = {
    onClose: PropTypes.func,
    name: PropTypes.string.isRequired,
    open: PropTypes.bool,
    content: PropTypes.object,
    context: PropTypes.string
};

export default CustomResourceViewer;
