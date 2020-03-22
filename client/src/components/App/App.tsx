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
  coordinates: {
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
    // this.fetchLocations()
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

          const { title, description, coordinates } = doc.data();

          newLocations = [
            ...newLocations,
            {
              title,
              description,
              id,
              coordinates
            },
          ];

        });
      });

    this.setState({
      geodata: {
        type: 'FeatureCollection',
        features: newLocations.map((location) => {

          return {
            type: 'Feature',
            properties: {
              id: location.id,
              title: location.title,
            },
            geometry: {
              type: 'Point',
              coordinates: [location.coordinates.latitude, location.coordinates.longitude]
            }
          }
        })
      }
    })

  }

  render() {
    return (
      <div className="App">
        <Switch>
          <Route path="/" exact>
            <Map geodata={this.state.geodata} />
          </Route>
          <Route path="/map/:lat-:lng-:zoom">
            <Map geodata={this.state.geodata} />
          </Route>
          <Route path="/list">
            <List />
          </Route>
          <Route path="/view/:type/:id">
            <View />
          </Route>
          <Route path="/upload/:lat-:lng">
            <UploadForm />
          </Route>
        </Switch>
      </div>
    )
  }
}
