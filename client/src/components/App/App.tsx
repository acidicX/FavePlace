import React, { Component } from 'react';
import { Switch, Route, withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import './App.css';
import View from '../View/View';
import Map from '../Map/Map';
import About from '../About/About';
import { List } from '../List/List';
import { FirebaseItem, FirebaseRequest } from '../../types';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import HowTo from '../HowTo/HowTo';

// Germany zoomed out
const initialMapCenter = {
  lat: 51.5167,
  lng: 9.9167,
  zoom: 4,
};

interface AppState {
  items: FirebaseItem[];
  requests: FirebaseRequest[];
}

class App extends Component<RouteComponentProps, AppState> {
  constructor(props, state) {
    super(props, state);

    this.state = {
      items: [],
      requests: [],
    };
  }

  componentDidMount() {
    this.fetchLocations();
  }

  fetchLocations = async () => {
    firebase
      .firestore()
      .collection('items')
      .onSnapshot(querySnapshot => {
        const items = [] as FirebaseItem[];
        querySnapshot.docs.forEach(doc => {
          const id = doc.id;
          const item = doc.data() as FirebaseItem;
          items.push({
            id,
            ...item,
          });
        });

        this.setState({
          items,
        });
      });

    firebase
      .firestore()
      .collection('requests')
      .onSnapshot(querySnapshot => {
        const requests = [] as FirebaseRequest[];
        querySnapshot.docs.forEach(doc => {
          const id = doc.id;
          const request = doc.data() as FirebaseRequest;
          requests.push({
            id,
            ...request,
          });
        });

        this.setState({
          requests,
        });
      });
  };

  render() {
    if (!this.state.items.length) {
      return <div className="App"></div>;
    }

    return (
      <div className="App">
        <Switch>
          <Route path="/" exact>
            <Redirect
              to={`/map/${initialMapCenter.lat}/${initialMapCenter.lng}/${initialMapCenter.zoom}`}
            />
          </Route>
          <Route path="/map/:lat/:lng/:zoom">
            <Map items={this.state.items} requests={this.state.requests} />
          </Route>
          <Route path="/list">
            <List items={this.state.items} />
            <BottomNavigation showLabels>
              <BottomNavigationAction
                icon={<ArrowBack />}
                onClick={() => this.props.history.goBack()}
                label="Zurück"
              />
            </BottomNavigation>
          </Route>
          <Route path="/view/:type/:id">
            <View />
          </Route>
          <Route path="/about">
            <About />
            <BottomNavigation showLabels>
              <BottomNavigationAction
                icon={<ArrowBack />}
                onClick={() => this.props.history.goBack()}
                label="Zurück"
              />
            </BottomNavigation>
          </Route>
          <Route path="/help">
            <HowTo />
            <BottomNavigation showLabels>
              <BottomNavigationAction
                icon={<ArrowBack />}
                onClick={() => this.props.history.goBack()}
                label="Zurück"
              />
            </BottomNavigation>
          </Route>
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
