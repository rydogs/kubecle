import React from 'react';
import PropTypes from 'prop-types';
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

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null
        };
        this.editedContent = null;
        this.onChange = this.onChange.bind(this);
        this.save = this.save.bind(this);
    }

    render() {
        const { context, content, editUrl, open, onClose } = this.props;
        const { error } = this.state;

        return (
            <Dialog fullWidth={true} maxWidth="md" open={open} onClose={onClose}>
                <DialogTitle id="simple-dialog-title">Describe</DialogTitle>
                <AceEditor
                    height="400px"
                    width="100%"
                    mode="json"
                    theme="monokai"
                    name="editor"
                    onChange={this.onChange}
                    editorProps={{ $blockScrolling: true }}
                    value={beautify(content, null, 2, 80)}
                />
                {editUrl && (
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => this.save(editUrl, context, onClose)} color="secondary">
                            Save
                        </Button>
                    </DialogActions>
                )}
                <div>
                    {error && (
                        <Typography color="error" variant="body1" align="center">
                            {error.toString()}
                        </Typography>
                    )}
                </div>
            </Dialog>
        );
    }

    onChange(newValue) {
        this.editedContent = newValue;
    }

    save(editUrl, context, onClose) {
        try {
            let json = JSON.parse(this.editedContent);
            delete json.status;
            axios
                .post(editUrl, json, {
                    headers: {
                        'k8s-context': context
                    }
                })
                .then(onClose)
                .catch(error => {
                    this.setState({ error });
                });
        } catch (error) {
            this.setState({ error });
        }
    }
}

Editor.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    editUrl: PropTypes.string,
    content: PropTypes.object,
    context: PropTypes.string
};

export default Editor;
