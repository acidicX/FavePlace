import React from 'react';
import ReactDOM from 'react-dom';
import * as AFrame from 'aframe';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from './theme';
import { appConfig } from './lib/config';

const config = {
  apiKey: appConfig.firebaseApiKey,
  authDomain: appConfig.firebaseAuthDomain,
  databaseURL: appConfig.firebaseDatabaseUrl,
  projectId: appConfig.firebaseProjectId,
  storageBucket: appConfig.firebaseStorageBucket,
  messagingSenderId: appConfig.firebaseMessagingSenderId,
};

firebase.initializeApp(config);
firebase.firestore();

// this requires A-Frame. Should be loaded as high as possible in the render tree.
console.debug('Loading AFrame: ' + AFrame.version);

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
