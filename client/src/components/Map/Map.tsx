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
import {
  ListOutlined,
  AddAPhoto,
  PinDrop,
  Info,
  HelpOutline,
  Room as RoomIcon,
} from '@material-ui/icons';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { FirebaseItem, FirebaseRequest } from '../../types';
import UploadForm from '../UploadForm/UploadForm';
import { appConfig } from '../../lib/config';
import { mapItemsToGeoFeatures, mapRequestsToGeoFeatures } from '../../lib/maputils';

interface Props {
  items: FirebaseItem[];
  requests: FirebaseRequest[];
}

interface MapState {
  selectedPoint: mapboxgl.LngLat | null;
  mapSelectable: boolean;
  viewMode: 'requests' | 'items';
  drawerIsOpen: boolean;
  uploadIsOpen: boolean;
  showRequestPendingNotification: boolean;
  showRequestCompleteNotification: boolean;
}

type MapRouteParams = { lat: string; lng: string; zoom: string };

class Map extends Component<RouteComponentProps<MapRouteParams> & Props, MapState> {
  constructor(props, state) {
    super(props, state);

    this.state = {
      selectedPoint: null,
      mapSelectable: false,
      viewMode: 'items',
      drawerIsOpen: false,
      uploadIsOpen: false,
      showRequestPendingNotification: false,
      showRequestCompleteNotification: false,
    };
  }

  map: mapboxgl.Map | null = null;

  addPulsingDotToMap = () => {
    if (!this.map) {
      return;
    }

    const size = 120;
    const pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),
      map: this.map,
      context: (null as unknown) as CanvasRenderingContext2D,

      // get rendering context for the map canvas when layer is added to the map
      onAdd: function() {
        const canvas = (document.createElement('canvas') as unknown) as HTMLCanvasElement;
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
      },

      // called once before every frame where the icon will be used
      render: function() {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;
        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(235, 140, 32,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(235, 140, 32, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = (context.getImageData(0, 0, this.width, this.height)
          .data as unknown) as Uint8Array;

        // continuously repaint the map, resulting in the smooth animation of the dot
        this.map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
      },
    };

    this.map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
  };

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
        map.addSource('touched-point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: event.lngLat.toArray(),
                },
              },
            ],
          },
        });
        map.addLayer({
          id: 'touched-point',
          type: 'symbol',
          source: 'touched-point',
          layout: {
            'icon-anchor': 'center',
            'icon-image': 'pulsing-dot',
          },
        });
        this.toggleDrawer();
      }
    });

    map.on('zoomend', event => {
      this.setState({
        mapSelectable: event.target.getZoom() >= 15,
      });
    });

    this.map = map;
    this.addPulsingDotToMap();
  };

  componentDidMount() {
    this.mapSetup();
  }

  componentDidUpdate(prevProps: Props, prevState: MapState) {
    if (
      this.map !== null &&
      this.map.isStyleLoaded() &&
      prevProps.items.length !== this.props.items.length
    ) {
      (this.map.getSource('locations') as mapboxgl.GeoJSONSource).setData(
        mapItemsToGeoFeatures(this.props.items)
      );
    }

    if (
      this.map !== null &&
      this.map.isStyleLoaded() &&
      prevState.viewMode !== this.state.viewMode
    ) {
      if (this.state.viewMode === 'items') {
        (this.map.getSource('locations') as mapboxgl.GeoJSONSource).setData(
          mapItemsToGeoFeatures(this.props.items)
        );
      }
      if (this.state.viewMode === 'requests') {
        (this.map.getSource('locations') as mapboxgl.GeoJSONSource).setData(
          mapRequestsToGeoFeatures(this.props.requests)
        );
      }
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

  toggleViewMode = () => {
    this.setState({
      viewMode: this.state.viewMode === 'items' ? 'requests' : 'items',
    });
  };

  toggleDrawer = () => {
    const map = this.map;
    if (map && this.state.drawerIsOpen) {
      if (map.getLayer('touched-point')) {
        map.removeLayer('touched-point');
      }

      if (map.getSource('touched-point')) {
        map.removeSource('touched-point');
      }
    }
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
    if (this.map && this.state.selectedPoint !== null) {
      new mapboxgl.Marker().setLngLat(this.state.selectedPoint).addTo(this.map);

      const date = new Date();
      const request: Omit<FirebaseRequest, 'id'> = {
        title: '',
        geo: new firebase.firestore.GeoPoint(
          this.state.selectedPoint.lat,
          this.state.selectedPoint.lng
        ),
        timestamp: firebase.firestore.Timestamp.fromDate(date),
      };

      firebase
        .firestore()
        .collection('requests')
        .add(request);
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
        {this.state.mapSelectable ? (
          <div className="select">Du kannst nun Orte auf der Karte markieren!</div>
        ) : null}
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
            onClick={this.toggleViewMode}
            label={this.state.viewMode === 'requests' ? 'Zeige Medien' : 'Zeige Wünsche'}
            icon={<RoomIcon />}
          />
          <BottomNavigationAction
            component={Link}
            to="/help"
            label="Anleitung"
            icon={<HelpOutline />}
          />
          <BottomNavigationAction component={Link} to="/about" label="Über uns" icon={<Info />} />
        </BottomNavigation>
      </div>
    );
  }
}

export default withRouter(Map);
