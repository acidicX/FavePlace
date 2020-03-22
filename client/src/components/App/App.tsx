import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import View from '../View/View';
import Map from '../Map/Map';
import { List } from '../List/List';
import firebase from 'firebase/app';
import 'firebase/firestore';

interface GeoData {
  type: string;
  features: Feature[];
}

interface Feature {
  type: string;
  properties: {
    id: string;
    title: string;
    fullPath: string,
    type: string,
  };
  geometry: {
    type: string;
    coordinates: number[];
  };
}

interface State {
  geodata: GeoData;
}

export default class App extends Component<{}, State> {
  constructor(props, state) {
    super(props, state);

    this.state = {
      geodata: {
        type: 'FeatureCollection',
        features: [],
      },
    };
  }

  componentDidMount() {
    this.fetchLocations();
  }

  fetchLocations = async () => {
    await firebase
      .firestore()
      .collection('items')
      .onSnapshot(querySnapshot => {
        let features: Feature[] = []

        querySnapshot.docs.forEach(doc => {
          const id = doc.id;

          const { title, geo, fullPath, type } = doc.data();

          const feature = {
            type: 'Feature',
            properties: {
              id,
              title,
              fullPath,
              type,
            },
            geometry: {
              type: 'Point',
              coordinates: [geo.longitude, geo.latitude],
            },
          }
          features.push(feature)
        });

        this.setState({
          geodata: {
            type: this.state.geodata.type,
            features 
          }
        })
      })
  };

  render() {
    if (!this.state.geodata.features.length) {
      return <div className="App"></div>;
    }

    return (
      <div className="App">
        <Switch>
          <Route path="/" exact>
            <Map geodata={this.state.geodata} />
          </Route>
          <Route path="/map/:lat/:lng/:zoom">
            <Map geodata={this.state.geodata} />
          </Route>
          <Route path="/list">
            <List />
          </Route>
          <Route path="/view/:type/:id">
            <View />
          </Route>
        </Switch>
      </div>
    );
  }
}
