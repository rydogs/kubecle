import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { diff as DiffEditor } from "react-ace";
import beautify from 'json-beautify';
import Moment from 'moment';
import 'brace/mode/json';
import 'brace/theme/monokai';
import * as _ from 'lodash';
import axios from 'axios';

const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing.unit * 0.5,
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
});

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
                this.setState({ histories: _.orderBy(res.data.body.items, (i) => i.metadata.annotations["deployment.kubernetes.io/revision"], ["desc"]) });
            }
        });
    }

    diffText(rs) {
        return (rs && rs.spec) ? beautify(rs.spec.template, null, 2, 80) : "";
    }

    diffVersion(rs) {
        return (rs && rs.metadata) ? `Revision ${rs.metadata.annotations["deployment.kubernetes.io/revision"]} on ${Moment(rs.metadata.creationTimestamp).fromNow()}` : "";
    }

    render() {
        const { context, historyUrl, open, onClose, classes } = this.props;
        const { error, histories } = this.state;
        const left = histories && histories.length ? histories[0] : {};
        const right = histories && histories.length > 1 ? histories[1] : {};
        return (
            <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose}>
                <DialogTitle id="simple-dialog-title">History</DialogTitle>
                <div className={classes.root}>
                    <Grid container spacing={24}>
                        <Grid item xs={6}>
                            <Paper elevation={0} className={classes.paper}>{this.diffVersion(left)}</Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper elevation={0} className={classes.paper}>{this.diffVersion(right)}</Paper>
                        </Grid>
                    </Grid>
                    <DiffEditor
                        height="600px"
                        width="100%"
                        mode="json"
                        theme="monokai"
                        name="history"
                        readOnly
                        value={[this.diffText(left), this.diffText(right)]}
                    />
                </div>
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

export default withStyles(styles)(HistoryViewer);
