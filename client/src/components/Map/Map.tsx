import React, { Component } from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import './Map.css';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { ListOutlined, AddAPhoto, Info } from '@material-ui/icons';

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

interface Props {
  geodata: GeoData
}

type MapRouteParams = { lat: string; lng: string; zoom: string };

class Map extends Component<RouteComponentProps<MapRouteParams> & Props, {}> {
  map: any = null;

  componentDidMount() {
    if (process.env.REACT_APP_MAPBOX_ACCESS_TOKEN) {
      const { lat, lng, zoom } = this.props.match.params;

      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

      const initialLat = parseFloat(lat) || 51.5167
      const initialLng = parseFloat(lng) || 9.9167
      const initialZoom = parseFloat(zoom) || 5

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

      this.map.on('moveend', this.onMoveend);

      this.map.on('load', () => {
        this.map.addSource('locations', {
          type: 'geojson',
          data: this.props.geodata,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
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
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              300,
              40
            ]
          }
        });

        this.map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'locations',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
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
            'circle-stroke-color': '#fff'
          }
        });

        this.map.on('click', 'clusters', (e) => {
          const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          const clusterId = features[0].properties.cluster_id;
          this.map.getSource('locations').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;

              this.map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
            }
          );
        });

        this.map.on('click', 'unclustered-point', (e) => {
          const imagePath = e.features[0].properties.imagePath

          this.props.history.push(`/view/${imagePath}`);
        });
      })

      if (this.props.match.path === '/') {
        this.props.history.push(`/map/${initialLat}-${initialLng}-${initialZoom}`);
      }
    }
  }

  onMoveend = () => {
    const zoom = this.map.getZoom();
    const { lng, lat } = this.map.getCenter();

    this.props.history.push(`/map/${lat}-${lng}-${zoom}`);
  }

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
