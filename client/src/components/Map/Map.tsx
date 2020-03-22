import React, { Component } from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
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
import firebase from 'firebase/app';
import 'firebase/firestore';

interface Feature {
  type: string;
  properties: {
    id: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface GeoData {
  type: string;
  features: Feature[];
}

interface Props {
  geodata: GeoData;
}

interface State {
  selectedPoint: mapboxgl.LngLat | null;
  drawerIsOpen: boolean;
  uploadIsOpen: boolean;
  showRequestPendingNotification: boolean;
  showRequestCompleteNotification: boolean;
}

type MapRouteParams = { lat: string; lng: string; zoom: string };

class Map extends Component<RouteComponentProps<MapRouteParams> & Props, State> {
  constructor(props, state) {
    super(props, state);

    this.state = {
      selectedPoint: null,
      drawerIsOpen: false,
      uploadIsOpen: false,
      showRequestPendingNotification: false,
      showRequestCompleteNotification: false,
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

      this.map = map;

      map.on('moveend', this.onMoveend);

      this.map.on('load', () => {
        this.map.addSource('locations', {
          type: 'geojson',
          data: this.props.geodata,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        this.map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'locations',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              300,
              '#f28cb1',
            ],
            'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 300, 40],
          },
        });

        this.map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'locations',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
        });

        this.map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'locations',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 10,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
          },
        });

        this.map.on('click', 'clusters', e => {
          const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          const clusterId = features[0].properties.cluster_id;
          this.map.getSource('locations').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            this.map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
        });

        this.map.on('click', 'unclustered-point', e => {
          const fullPath = e.features[0].properties.fullPath;
          const type = e.features[0].properties.type;

          this.props.history.push(`/view/${type}/${fullPath}`);
        });
      });

      map.on('click', event => {
        this.setState({
          selectedPoint: event.lngLat,
        });
        this.toggleDrawer();
      });

      if (this.props.match.path === '/') {
        this.props.history.push(`/map/${initialLat}/${initialLng}/${initialZoom}`);
      }
    }
  }

  onMoveend = () => {
    const zoom = this.map.getZoom();
    const { lng, lat } = this.map.getCenter();

    this.props.history.push(`/map/${lat}/${lng}/${zoom}`);
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
