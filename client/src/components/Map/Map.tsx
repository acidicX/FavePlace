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
import firebase from 'firebase/app';
import 'firebase/firestore';
import { FirebaseItem } from '../../types';
import UploadForm from '../UploadForm/UploadForm';
import { appConfig } from '../../lib/config';

interface Props {
  items: FirebaseItem[];
}

interface MapState {
  selectedPoint: mapboxgl.LngLat | null;
  drawerIsOpen: boolean;
  uploadIsOpen: boolean;
  showRequestPendingNotification: boolean;
  showRequestCompleteNotification: boolean;
}

type MapRouteParams = { lat: string; lng: string; zoom: string };

const mapItemsToGeoFeatures = (items: FirebaseItem[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: items.map(item => {
    const { id, title, geo, fullPath, type } = item;

    const feature: GeoJSON.Feature = {
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
    };

    return feature;
  }),
});

class Map extends Component<RouteComponentProps<MapRouteParams> & Props, MapState> {
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

  map: mapboxgl.Map | null = null;

  mapSetup = () => {
    const { lat, lng, zoom } = this.props.match.params;

    mapboxgl.accessToken = appConfig.mapboxAccessToken;

    const mapOptions: mapboxgl.MapboxOptions = {
      container: 'map',
      style: appConfig.mapboxMapStyle,
      center: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      zoom: parseFloat(zoom),
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

    map.on('load', () => {
      map.addSource('locations', {
        type: 'geojson',
        data: mapItemsToGeoFeatures(this.props.items),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#EA8C20',
            100,
            '#f1f075',
            300,
            '#f28cb1',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 300, 40],
        },
      });

      map.addLayer({
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

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'locations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#EA8C20',
          'circle-radius': 10,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });

      map.on('click', 'clusters', event => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['clusters'],
        });

        if (features && features.length > 0) {
          const cluster = features[0];
          if (cluster.properties !== null) {
            const clusterId = cluster.properties.cluster_id;
            (map.getSource('locations') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
              clusterId,
              (err, zoom) => {
                if (err) return;

                map.easeTo({
                  // Oh TypeScript
                  center: (cluster.geometry as any).coordinates as mapboxgl.LngLat,
                  zoom,
                });
              }
            );
          }
        }
      });

      map.on('click', 'unclustered-point', event => {
        if (event.features && event.features.length > 0) {
          const point = event.features[0];
          if (point.properties !== null) {
            const { fullPath, type } = point.properties;

            this.props.history.push(`/view/${type}/${fullPath}`);
          }
        }
      });
    });

    map.on('moveend', this.onMoveend);

    map.on('click', event => {
      if (map.getZoom() >= 15) {
        this.setState({
          selectedPoint: event.lngLat,
        });
        this.toggleDrawer();
      }
    });

    this.map = map;
  };

  componentDidMount() {
    this.mapSetup();
  }

  componentDidUpdate(prevProps) {
    if (
      this.map !== null &&
      this.map.isStyleLoaded() &&
      prevProps.items.length !== this.props.items.length
    ) {
      (this.map.getSource('locations') as mapboxgl.GeoJSONSource).setData(
        mapItemsToGeoFeatures(this.props.items)
      );
    }
  }

  onMoveend = () => {
    const zoom = this.map!.getZoom();
    const { lng, lat } = this.map!.getCenter();

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
      new mapboxgl.Marker().setLngLat(this.state.selectedPoint).addTo(this.map!);

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
            <ListItem onClick={() => this.toggleUpload()}>
              <ListItemIcon>
                <AddAPhoto />
              </ListItemIcon>
              <ListItemText>Ich möchte einen neuen Ort teilen</ListItemText>
            </ListItem>
          </List>
        </Drawer>
        <Drawer anchor="bottom" open={this.state.uploadIsOpen} onClose={this.toggleUpload}>
          {this.map && (
            <UploadForm
              geo={{
                latitude: (this.map as mapboxgl.Map).getCenter().lat.toString(),
                longitude: (this.map as mapboxgl.Map).getCenter().lng.toString(),
              }}
            />
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
          <BottomNavigationAction component={Link} to="/about" label="Über uns" icon={<Info />} />
        </BottomNavigation>
      </div>
    );
  }
}

export default withRouter(Map);
