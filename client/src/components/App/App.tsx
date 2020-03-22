import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import View from '../View/View';
import Map from '../Map/Map';
import UploadForm from '../UploadForm/UploadForm';
import { List } from '../List/List';
import firebase from 'firebase/app';
import 'firebase/firestore';

interface Location {
  id: string;
  title: string;
  description: string;
  fullPath: string,
  type: string,
  geo: {
    latitude: number;
    longitude: number;
  };
}

interface GeoData {
  type: string,
  features: Feature[]
}

interface Feature {
  type: string,
  properties: {
    id: string,
    title: string,
  },
  geometry: {
    type: string,
    coordinates: [number, number]
  }
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
        features: []
      }
    };
  }

  componentDidMount() {
    this.fetchLocations()
  }

  fetchLocations = async () => {
    let newLocations: Location[] = [];

    await firebase
      .firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const id = doc.id;

          const { title, description, geo, fullPath, type } = doc.data();

          newLocations = [
            ...newLocations,
            {
              title,
              description,
              id,
              geo,
              fullPath,
              type
            },
          ];

        });
      });

      console.log(newLocations)

    this.setState({
      geodata: {
        type: 'FeatureCollection',
        features: newLocations.map((location) => {

          return {
            type: 'Feature',
            properties: {
              id: location.id,
              title: location.title,
              fullPath: location.fullPath,
              type: location.type
            },
            geometry: {
              type: 'Point',
              coordinates: [location.geo.latitude, location.geo.longitude]
            }
          }
        })
      }
    })

  }

  render() {
    if(!this.state.geodata.features.length) {
      return (
        <div className="App"></div>
      )
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
          <Route path="/upload/:latitude/:longitude">
            <UploadForm />
          </Route>
        </Switch>
      </div>
    )
  }
}
