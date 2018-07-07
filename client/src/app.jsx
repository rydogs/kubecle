import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DraftsIcon from '@material-ui/icons/Drafts';
import SettingsEthernet from '@material-ui/icons/SettingsEthernet';
import Build from '@material-ui/icons/Build';
import GroupWork from '@material-ui/icons/GroupWork';
import Services from './services';
import Deployments from './deployments';
import Pods from './pods';
import CurrentNs from './currentNs';
import { Route, Link, HashRouter } from "react-router-dom";


const drawerWidth = 200;

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
});

class App extends Component {
  render() {
    const { classes } = this.props;

    return (
      <HashRouter>
        <div className={classes.root}>
          <AppBar position="absolute" className={classes.appBar}>
            <Toolbar>
              <Typography variant="title" color="inherit" noWrap style={{ flex: 1 }}>
                Kubecle
            </Typography>
            <div >
              <CurrentNs />
            </div>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.toolbar} />
            <List>
              <Link to="/deployments" style={{ textDecoration: 'none' }}>
                <ListItem button>
                  <ListItemIcon>
                    <Build />
                  </ListItemIcon>
                  <ListItemText primary="Deployments" />
                </ListItem>
              </Link>
              <Link to="/pods" style={{ textDecoration: 'none' }}>
                <ListItem button>
                  <ListItemIcon>
                    <GroupWork />
                  </ListItemIcon>
                  <ListItemText primary="Pods" />
                </ListItem>
              </Link>
              <Link to="/services" style={{ textDecoration: 'none' }}>
                <ListItem button>
                  <ListItemIcon>
                    <SettingsEthernet />
                  </ListItemIcon>
                  <ListItemText primary="Services" />
                </ListItem>
              </Link>
            </List>
            <Divider />
            <List>
            </List>
          </Drawer>
          <main className={classes.content}>
            <div className={classes.toolbar} />

            <Route path="/deployments" component={Deployments} />
            <Route path="/services" component={Services} />
            <Route path="/pods" component={Pods} />
          </main>
        </div>
      </HashRouter>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
