import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AceEditor from 'react-ace';
import beautify from 'json-beautify';
import 'brace/mode/json';
import 'brace/theme/monokai';

import axios from 'axios';

const styles = theme => ({
});


class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.error = null;
        this.editedContent = null;
    }

    render() {
        const { classes, title, content, editUrl, open, onClose } = this.props;
        return (
            <Dialog fullWidth={true} maxWidth="md" open={open} onClose={onClose}>
                <DialogTitle id="simple-dialog-title">Describe</DialogTitle>
                <AceEditor
                    height="400px"
                    width="100%"                  
                    mode="json"
                    theme="monokai"
                    name="editor"
                    onChange={(n) => this.onChange(n)}
                    editorProps={{$blockScrolling: true}}
                    value={beautify(content, null, 2, 80)}
                />
                { editUrl && 
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => this.save(editUrl, onClose)} color="secondary">
                            Save
                        </Button>
                    </DialogActions>
                }
                <div>
                    { this.error && 
                        <Typography color="error" variant="body1" align="center">
                            {this.error.toString()}
                        </Typography>
                    }
                </div>
            </Dialog>
        )
    }

    onChange(newValue) {
        this.editedContent = newValue;
    }

    save(editUrl, onClose) {
        try {
            let json = JSON.parse(this.editedContent);
            delete json.status;
            axios.post(editUrl, json).then(res => {
                onClose();
            }).catch((e) => {
                this.error = e;
            });
        } catch (e) {
            this.error = e;
        }
    }
}

Editor.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    editUrl: PropTypes.string,
    content: PropTypes.object,
};

export default withStyles(styles)(Editor);