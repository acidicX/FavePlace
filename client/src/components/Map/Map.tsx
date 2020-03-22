import React, { Component } from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import firebase from 'firebase/app';
import data from '../../data.json';
import 'firebase/firestore';
import './Map.css';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { ListOutlined, AddAPhoto, Info } from '@material-ui/icons';

interface Location {
  id: string;
  title: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface State {
  locations: Location[];
  images: string[];
}

type MapRouteParams = { lat: string; lng: string; zoom: string };

class Map extends Component<RouteComponentProps<MapRouteParams>, State> {
  constructor(props, state) {
    super(props, state);

    this.state = {
      locations: [],
      images: [],
    };
  }

  map: any = null;

  componentDidMount() {
    const { lat, lng, zoom } = this.props.match.params;
    if (process.env.REACT_APP_MAPBOX_ACCESS_TOKEN) {
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

      const mapOptions: mapboxgl.MapboxOptions = {
        container: 'map',
        style: 'mapbox://styles/martingassner/ck824oanx0aew1jmm6z5w26e0',
        center: {
          lat: parseFloat(lat) || 51.5167,
          lng: parseFloat(lng) || 9.9167,
        },
        zoom: parseInt(zoom) || 5,
      };

      const map = new mapboxgl.Map(mapOptions);

      map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false,
        })
      );

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })
      );

      map.on('zoomend', this.fetchLocations);

      map.on('dragend', this.fetchLocations);

      this.map = map;

      this.setState({
        images: Object.keys(data.assets).map(key => key),
      });
    }
  }

  fetchLocations = async () => {
    const zoom = this.map.getZoom();
    const { lng, lat } = this.map.getCenter();

    if (this.map.isMoving() || zoom < 8) {
      return;
    }

    this.props.history.push(`/map/${lat}-${lng}-${zoom}`);

    const { locations, images } = this.state;

    let newLocations: Location[] = [];

    await firebase
      .firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const id = doc.id;

          const isOnMap = locations.some(location => location.id === id);

          if (!isOnMap) {
            const { title, description } = doc.data();

            newLocations = [
              ...newLocations,
              {
                title,
                description,
                id,
                coordinates: {
                  lng: lng + (Math.random() - 0.5) / 10,
                  lat: lat + (Math.random() - 0.5) / 10,
                },
              },
            ];
          }
        });
      });

    this.setState({
      locations: [...locations, ...newLocations],
    });

    for (const newLocation of newLocations) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url("https://docs.mapbox.com/mapbox-gl-js/assets/washington-monument.jpg")`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([newLocation.coordinates.lng, newLocation.coordinates.lat])
        .addTo(this.map);

      marker.getElement().addEventListener('click', () => {
        this.props.history.push(`/view/${images[Math.floor(Math.random() * images.length)]}`);
      });
    }
  };

  render() {
    return (
      <div className="Map">
        <div id="map"></div>
        <BottomNavigation showLabels>
          <BottomNavigationAction
            component={Link}
            to="/list"
            label="List"
            icon={<ListOutlined />}
          />
          <BottomNavigationAction
            component={Link}
            to="/upload"
            label="Upload"
            icon={<AddAPhoto />}
          />
          <BottomNavigationAction label="About" icon={<Info />} />
        </BottomNavigation>
      </div>
    );
  }
}

export default withRouter(Map);
