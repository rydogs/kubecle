import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AceEditor from 'react-ace';
import beautify from 'json-beautify';
import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/searchbox';

import axios from 'axios';

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.editedContent = null;
        this.onChange = this.onChange.bind(this);
        this.save = this.save.bind(this);
    }

    render() {
        const { context, content, editUrl, open, onClose } = this.props;

        return (
            <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose} disableAutoFocus={true}>
                <DialogTitle id="simple-dialog-title">Describe</DialogTitle>
                <AceEditor
                    focus={true}
                    height="600px"
                    width="100%"
                    mode="json"
                    theme="monokai"
                    name="editor"
                    wrapEnabled={true}
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
            </Dialog>
        );
    }

    onChange(newValue) {
        this.editedContent = newValue;
    }

    save(editUrl, context, onClose) {
        if (this.editedContent) {
            let json = JSON.parse(this.editedContent);
            delete json.status;
            axios.post(editUrl, json, {
                headers: {
                    'k8s-context': context
                }
            }).then(onClose).catch(e => {
                this.editedContent = null;
            });
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
