import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { diff as DiffEditor } from "react-ace";
import beautify from 'json-beautify';
import 'brace/mode/json';
import 'brace/theme/monokai';

import axios from 'axios';

class HistoryViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null
        };
        this.histories = [];
    }

    componentDidUpdate(prevProps, prevStats) {
        const { historyUrl: currentUrl } = this.props;
        const { historyUrl: previousUrl } = prevProps;
        if (currentUrl && currentUrl !== previousUrl) {
            this.fetchHistory();
        }
    }

    fetchHistory() {
        const { context, historyUrl } = this.props;
        axios.get(historyUrl, {
            headers: {
                'k8s-context': context
            }
        }).then(res => {
            if (res && res.data && res.data.body) {
                this.setState({ histories: res.data.body.items });
            }
        });
    }

    render() {
        const { context, historyUrl, open, onClose } = this.props;
        const { error, histories } = this.state;
        const left = histories && histories.length ? histories[0].spec.template:"";
        const right = histories && histories.length > 1 ?histories[1].spec.template: "";

        return (
            <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose}>
                <DialogTitle id="simple-dialog-title">History</DialogTitle>
                <DiffEditor
                    height="600px"
                    width="100%"
                    mode="json"
                    theme="monokai"
                    name="history"
                    readOnly
                    value={[beautify(left, null, 2, 80), beautify(right, null, 2, 80)]}
                />
                <div>
                    {error && (
                        <Typography color="error" align="center">
                            {error.toString()}
                        </Typography>
                    )}
                </div>
            </Dialog>
        );
    }
}

HistoryViewer.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    historyUrl: PropTypes.string,
    deployment: PropTypes.object,
    context: PropTypes.string
};

export default HistoryViewer;
