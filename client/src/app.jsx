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
import DescriptionIcon from '@material-ui/icons/Description';
import SettingsEthernet from '@material-ui/icons/SettingsEthernet';
import Input from '@material-ui/icons/Input';
import ScheduleIcon from '@material-ui/icons/Schedule';
import Build from '@material-ui/icons/Build';
import GroupWork from '@material-ui/icons/GroupWork';
import Services from './services';
import Deployments from './deployments';
import Ingresses from './ingresses';
import Pods from './pods';
import Configmaps from './configmaps';
import Jobs from './jobs';
import Context from './context';
import history from './history';
import thunk from 'redux-thunk';
import { rootReducer } from './reducer';
import { Route, Redirect, Link, Router } from 'react-router-dom';

const drawerWidth = 200;

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex'
    },
    appBar: {
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
        padding: theme.spacing.unit * 3,
        minWidth: 0 // So the Typography noWrap works
    },
    menu: {
        paddingTop: theme.spacing.unit * 3
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
    render() {
        const { classes } = this.props;
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
                                    <Link
                                        to={{ pathname: '/deployments', search: window.location.search }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Build />
                                            </ListItemIcon>
                                            <ListItemText primary="Deployments" />
                                        </ListItem>
                                    </Link>
                                    <Link
                                        to={{ pathname: '/pods', search: window.location.search }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <ListItem button>
                                            <ListItemIcon>
                                                <GroupWork />
                                            </ListItemIcon>
                                            <ListItemText primary="Pods" />
                                        </ListItem>
                                    </Link>
                                    <Link
                                        to={{ pathname: '/jobs', search: window.location.search }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <ListItem button>
                                            <ListItemIcon>
                                                <ScheduleIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Jobs" />
                                        </ListItem>
                                    </Link>
                                    <Link
                                        to={{ pathname: '/services', search: window.location.search }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <ListItem button>
                                            <ListItemIcon>
                                                <SettingsEthernet />
                                            </ListItemIcon>
                                            <ListItemText primary="Services" />
                                        </ListItem>
                                    </Link>
                                    <Link
                                        to={{ pathname: '/ingresses', search: window.location.search }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Input />
                                            </ListItemIcon>
                                            <ListItemText primary="Ingresses" />
                                        </ListItem>
                                    </Link>
                                    <Link
                                        to={{ pathname: '/configmaps', search: window.location.search }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <ListItem button>
                                            <ListItemIcon>
                                                <DescriptionIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Configmaps" />
                                        </ListItem>
                                    </Link>
                                </List>
                                <Divider />
                                <List />
                            </Drawer>
                            <main className={classes.content}>
                                <div className={classes.toolbar} />
                                <Route path="/deployments" component={Deployments} />
                                <Route path="/services" component={Services} />
                                <Route path="/ingresses" component={Ingresses} />
                                <Route path="/pods" component={Pods} />
                                <Route path="/jobs" component={Jobs} />
                                <Route path="/configmaps" component={Configmaps} />
                                <Route exact path="/" render={() => <Redirect to="/pods" />} />
                            </main>
                        </div>
                    </Router>
                </MuiThemeProvider>
            </Provider>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
