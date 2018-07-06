import React, { Component } from 'react'
import { render } from 'react-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import App from './app';

const theme = createMuiTheme();

class Index extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
          <App />
      </MuiThemeProvider>
    )
  }
}

render(<Index />, document.getElementById('app'))