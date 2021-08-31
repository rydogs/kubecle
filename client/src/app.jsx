import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import DescriptionIcon from '@material-ui/icons/Description';
import SettingsEthernet from '@material-ui/icons/SettingsEthernet';
import TrendingUp from '@material-ui/icons/TrendingUp';
import Input from '@material-ui/icons/Input';
import ScheduleIcon from '@material-ui/icons/Schedule';
import TimerIcon from '@material-ui/icons/Timer';
import Build from '@material-ui/icons/Build';
import AllInbox from '@material-ui/icons/AllInbox';
import GroupWork from '@material-ui/icons/GroupWork';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Services from './services';
import Deployments from './deployments';
import StatefulSets from './statefulsets';
import Ingresses from './ingresses';
import Pods from './pods';
import Configmaps from './configmaps';
import Jobs from './jobs';
import Cronjobs from './cronjobs';
import HPAs from './hpas';
import Context from './context';
import history from './history';
import CRDs from './crds';
import thunk from 'redux-thunk';
import { rootReducer } from './reducer';
import { Route, Redirect, Link, Router } from 'react-router-dom';
import axios from 'axios';

const drawerWidth = 200;

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        minHeight: '800px'
    },
    appBar: {
        '-webkit-app-region': 'drag',
        zIndex: theme.zIndex.drawer + 1
    },
    logo: {
        paddingRight: 10,
        height: 50,
        width: 50
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
        minWidth: 0 // So the Typography noWrap works
    },
    menu: {
        paddingTop: theme.spacing(3)
    },
    toolbar: theme.mixins.toolbar
});

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    }
});
const logger = createLogger();
const store = createStore(rootReducer, undefined, applyMiddleware(thunk, logger));

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null
        };
        this.formatError = this.formatError.bind(this);
        axios.interceptors.response.use((response) => {
            return response;
        }, (error) => {
            this.setState({error});
            return Promise.reject(error);
        });
    }

    formatError(error) {
        if (error) {
            return error.response.data.message || error.response.data;
        }
        return "Unexpected error!";
    }

    render() {
        const { classes } = this.props;
        const { error } = this.state;
        const menus = [
            {text: "Deployments", path: "/deployments", icon: <Build />, component: Deployments},
            {text: "Stateful Sets", path: "/statefulsets", icon: <AllInbox />, component: StatefulSets},
            {text: "Pods", path: "/pods", icon: <GroupWork />, component: Pods},
            {text: "Jobs", path: "/jobs", icon: <ScheduleIcon />, component: Jobs},
            {text: "Cron Jobs", path: "/cronjobs", icon: <TimerIcon />, component: Cronjobs},
            {text: "Services", path: "/services", icon: <SettingsEthernet />, component: Services},
            {text: "HPAs", path: "/hpas", icon: <TrendingUp />, component: HPAs},
            {text: "Ingresses", path: "/ingresses", icon: <Input />, component: Ingresses},
            {text: "Configmaps", path: "/configmaps", icon: <DescriptionIcon />, component: Configmaps},
            {text: "CRDs", path: "/crds", icon: <AllInclusiveIcon />, component: CRDs},
        ];
        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <Router history={history}>
                        <div className={classes.root}>
                            <AppBar position="absolute" className={classes.appBar}>
                                <Toolbar>
                                    <img src="images/kubecle-logo.png" className={classes.logo} />
                                    <Typography variant="h6" color="inherit" noWrap style={{ flex: 1 }}>
                                        Kubecle
                                    </Typography>
                                    <div>
                                        <Context />
                                    </div>
                                </Toolbar>
                            </AppBar>
                            <Drawer variant="permanent" classes={{ paper: classes.drawerPaper }}>
                                <div className={classes.toolbar} />
                                <List className={classes.menu}>
                                    {menus.map((item, i) => (
                                        <ListItem key={i} button component={Link} to={location => ({ pathname: item.path, search: location.search })}>
                                            <ListItemIcon>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} />
                                        </ListItem> 
                                    ))}
                                </List>
                                <Divider />
                                <List />
                            </Drawer>
                            <main className={classes.content}>
                                <div className={classes.toolbar} />
                                {menus.map((item, i) => (
                                    <Route key={i} path={item.path} component={item.component} />
                                ))}
                                <Route exact path="/" render={() => <Redirect to="/pods" />} />
                            </main>
                        </div>
                    </Router>
                    <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} open={error!=null} autoHideDuration={6000} onClose={() => {this.setState({error: null})}}> 
                        <SnackbarContent style={{backgroundColor: theme.palette.error.dark}} message={this.formatError(error)} />
                    </Snackbar>
                </MuiThemeProvider>
            </Provider>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
