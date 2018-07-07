import React, { Component } from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { rootReducer, initialState } from './reducer';
import thunk from 'redux-thunk';
import App from './app';

const theme = createMuiTheme();
const logger = createLogger();
const store = createStore(rootReducer, initialState, applyMiddleware(thunk, logger));

class Index extends Component {
  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App />
        </MuiThemeProvider>
      </Provider>
    )
  }
}

render(<Index />, document.getElementById('app'));