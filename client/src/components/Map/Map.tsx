import React, { Component } from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import firebase from 'firebase/app';
import data from '../../data.json';
import 'firebase/firestore';
import './Map.css';
import {
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ListOutlined, AddAPhoto, PinDrop, Info } from '@material-ui/icons';
import UploadForm from '../UploadForm/UploadForm';
import { GeoLocation } from '../../types';

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
  selectedPoint: mapboxgl.LngLat | null;
  drawerIsOpen: boolean;
  uploadIsOpen: boolean;
  showRequestPendingNotification: boolean;
  showRequestCompleteNotification: boolean;
  locations: Location[];
  images: string[];
}

type MapRouteParams = { lat: string; lng: string; zoom: string };

class Map extends Component<RouteComponentProps<MapRouteParams>, State> {
  constructor(props, state) {
    super(props, state);

    this.state = {
      selectedPoint: null,
      drawerIsOpen: false,
      uploadIsOpen: false,
      showRequestPendingNotification: false,
      showRequestCompleteNotification: false,
      locations: [],
      images: [],
    };
  }

  map: any = null;

  componentDidMount() {
    if (process.env.REACT_APP_MAPBOX_ACCESS_TOKEN) {
      const { lat, lng, zoom } = this.props.match.params;

      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

      const initialLat = parseFloat(lat) || 51.5167;
      const initialLng = parseFloat(lng) || 9.9167;
      const initialZoom = parseFloat(zoom) || 5;

      const mapOptions: mapboxgl.MapboxOptions = {
        container: 'map',
        style: 'mapbox://styles/martingassner/ck824oanx0aew1jmm6z5w26e0',
        center: {
          lat: initialLat,
          lng: initialLng,
        },
        zoom: initialZoom,
      };

      const map = new mapboxgl.Map(mapOptions);

      map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false,
          placeholder: 'Mein Lieblingsort ist...',
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

      map.on('moveend', this.onMoveend);

      map.on('click', event => {
        this.setState({
          selectedPoint: event.lngLat,
        });
        this.toggleDrawer();
      });

      this.map = map;

      this.setState(
        {
          images: Object.keys(data.assets).map(key => key),
        },
        () => {
          this.fetchLocations();
        }
      );

      if (this.props.match.path === '/') {
        this.props.history.push(`/map/${initialLat}/${initialLng}/${initialZoom}`);
      }
    }
  }

  onMoveend = () => {
    const zoom = this.map.getZoom();
    const { lng, lat } = this.map.getCenter();

    this.props.history.push(`/map/${lat}/${lng}/${zoom}`);

    this.fetchLocations();
  };

  fetchLocations = async () => {
    const { zoom, lat, lng } = this.props.match.params;

    if (this.map.isMoving() || parseFloat(zoom) < 8) {
      return;
    }

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
                  lng: parseFloat(lng) + (Math.random() - 0.5) / 10,
                  lat: parseFloat(lat) + (Math.random() - 0.5) / 10,
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

  toggleUpload = () => {
    this.setState({
      uploadIsOpen: !this.state.uploadIsOpen,
    });
  };

  toggleDrawer = () => {
    this.setState({
      drawerIsOpen: !this.state.drawerIsOpen,
    });
  };

  // TODO: this is a state machine...
  requestPending = () => {
    this.toggleDrawer();
    this.setState({
      showRequestPendingNotification: true,
    });
  };

  requestSaved = () => {
    if (this.state.selectedPoint !== null) {
      new mapboxgl.Marker().setLngLat(this.state.selectedPoint).addTo(this.map);

      firebase
        .firestore()
        .collection('requests')
        .add({
          geo: {
            lng: this.state.selectedPoint.lng,
            lat: this.state.selectedPoint.lat,
          },
        });
    }

    this.setState({
      showRequestPendingNotification: false,
      showRequestCompleteNotification: true,
    });
  };

  requestCompleted = () => {
    this.setState({
      showRequestCompleteNotification: false,
    });
  };

  render() {
    return (
      <div className="Map">
        <div id="map"></div>

        <Snackbar
          className="Snackbar"
          open={this.state.showRequestPendingNotification}
          autoHideDuration={3000}
          onClose={this.requestSaved}
        >
          <Alert icon={<CircularProgress size={20} />} severity="info">
            Wir suchen Leute in der Nähe deines Lieblingsortes...
          </Alert>
        </Snackbar>
        <Snackbar
          className="Snackbar"
          open={this.state.showRequestCompleteNotification}
          autoHideDuration={4000}
          onClose={this.requestCompleted}
        >
          <Alert severity="success">
            Wir benachrichtigen dich, sobald jemand deinen Lieblingsort besucht hat!
          </Alert>
        </Snackbar>
        <Drawer anchor="bottom" open={this.state.drawerIsOpen} onClose={() => this.toggleDrawer()}>
          <List>
            <ListItem onClick={() => this.requestPending()}>
              <ListItemIcon>
                <PinDrop />
              </ListItemIcon>
              <ListItemText>Ich möchte hier hinreisen</ListItemText>
            </ListItem>
            <ListItem onClick={() => this.toggleUpload}>
              <ListItemIcon>
                <AddAPhoto />
              </ListItemIcon>
              <ListItemText>Ich möchte einen neuen Ort teilen</ListItemText>
            </ListItem>
          </List>
        </Drawer>
        <Drawer anchor="bottom" open={this.state.uploadIsOpen} onClose={this.toggleUpload}>
          {this.map && (
            <UploadForm geo={((this.map as mapboxgl.Map).getCenter() as unknown) as GeoLocation} />
          )}
        </Drawer>
        <BottomNavigation showLabels>
          <BottomNavigationAction
            component={Link}
            to="/list"
            label="Liste"
            icon={<ListOutlined />}
          />
          <BottomNavigationAction
            onClick={this.toggleUpload}
            label="Erstellen"
            icon={<AddAPhoto />}
          />
          <BottomNavigationAction label="Über uns" icon={<Info />} />
        </BottomNavigation>
      </div>
    );
  }
}

export default withRouter(Map);
