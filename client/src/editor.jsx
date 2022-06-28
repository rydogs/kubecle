import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AceEditor from 'react-ace';
import beautify from 'json-beautify';
import useK8sContext from './contextStore';
import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/searchbox';

import axios from 'axios';

const Editor = (props) => {
    const { currentContext, currentNs } = useK8sContext()
    const { content, editUrl, open, onClose } = props;
    let editedContent = content;

    const save = () => {
        if (editedContent) {
            let json = JSON.parse(editedContent);
            delete json.status;
            axios.post(editUrl, json, {
                headers: {
                    'k8s-context': currentContext
                }
            }).then( onClose ).catch(e => {
                editedContent = null;
            });
        }
    }

    const onChange = (newValue) => {
        editedContent = newValue;
    }

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
                onChange={onChange}
                editorProps={{ $blockScrolling: true }}
                value={beautify(content, null, 2, 80)}
            />
            {editUrl && (
                <DialogActions>
                    <Button onClick={ onClose } color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => save()} color="secondary">
                        Save
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}

Editor.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    editUrl: PropTypes.string,
    content: PropTypes.object
};

export default Editor;
