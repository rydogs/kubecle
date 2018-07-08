import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import AceEditor from 'react-ace';
import beautify from 'json-beautify';
import 'brace/mode/json';
import 'brace/theme/monokai';

const styles = theme => ({
});


class Editor extends React.Component {
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
                <DialogTitle id="simple-dialog-title">Describe</DialogTitle>
                <AceEditor
                    height="400px"
                    width="100%"                  
                    mode="json"
                    theme="monokai"
                    name="editor"
                    onChange={this.onChange}
                    editorProps={{$blockScrolling: true}}
                    value={beautify(this.props.content, null, 2, 80)}
                />
            </Dialog>
        )
    }

    onChange(a, b) {
        console.log(a);
        console.log(b);
    }
}

Editor.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    readOnly: PropTypes.bool,
    content: PropTypes.object,
};

export default withStyles(styles)(Editor);