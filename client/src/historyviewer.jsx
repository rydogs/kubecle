import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import copy from 'copy-to-clipboard';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import HistoryIcon from '@material-ui/icons/History';
import { diff as DiffEditor } from "react-ace";
import beautify from 'json-beautify';
import Moment from 'moment';
import 'brace/mode/json';
import 'brace/theme/monokai';
import * as _ from 'lodash';
import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(0.5),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
});

class HistoryViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            leftIdx: 0,
            rightIdx: 1
        };
        this.histories = [];
    }

    componentDidUpdate(prevProps, prevStats) {
        const { historyUrl: currentUrl } = this.props;
        const { historyUrl: previousUrl } = prevProps;
        if (currentUrl && currentUrl !== previousUrl) {
            this.state.leftIdx = 0;
            this.state.rightIdx = 1;
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

    copyRollbackToClipboard(rs) {
        const { context, ns, deployment } = this.props;
        const revision = this.revision(rs);
        let copyCmd = `kubectl rollout undo deployment.v1.apps/${deployment.metadata.name} -n ${ns} --context ${context} --to-revision=${revision}`;
        copy(copyCmd);
    }

    diffText(rs) {
        return (rs && rs.spec) ? beautify(rs.spec.template, null, 2, 80) : "";
    }

    revisionText(rs) {
        return (rs && rs.metadata) ? `Revision ${this.revision(rs)} on ${Moment(rs.metadata.creationTimestamp).fromNow()}` : "";
    }

    revision(rs) {
        return (rs && rs.metadata) ? rs.metadata.annotations["deployment.kubernetes.io/revision"] : null;
    }

    render() {
        const { context, historyUrl, open, onClose, classes } = this.props;
        const { error, histories, leftIdx, rightIdx } = this.state;
        const left = histories && histories.length > leftIdx? histories[leftIdx] : {};
        const right = histories && histories.length > rightIdx ? histories[rightIdx] : {};
        return (
            <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose}>
                <DialogTitle id="simple-dialog-title">History</DialogTitle>
                <div className={classes.root}>
                    <Grid container spacing={24}>
                        <Grid item xs={6}>
                            <Paper elevation={0} className={classes.paper}>
                                {this.revisionText(left)}
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper elevation={0} className={classes.paper}>
                                <Button disabled={rightIdx <= 1} size="small" onClick={() => this.setState({rightIdx:rightIdx-1})}><ChevronLeftIcon /></Button>
                                {this.revisionText(right)}
                                <Button size="small" disabled={histories && rightIdx + 1 >= histories.length} onClick={() => this.setState({rightIdx:rightIdx+1})}><ChevronRightIcon /></Button>
                                <Tooltip title="Copy Rollback Command" placement="top">
                                    <Button size="small" color="secondary" variant="contained" onClick={() => this.copyRollbackToClipboard(right)}><HistoryIcon /></Button>
                                </Tooltip>
                            </Paper>
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
    context: PropTypes.string,
    ns: PropTypes.string
};

export default withStyles(styles)(HistoryViewer);
