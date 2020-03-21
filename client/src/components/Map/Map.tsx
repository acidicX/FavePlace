import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder, { GeolocateControl } from '@mapbox/mapbox-gl-geocoder'

export default class Map extends Component {
  state = {
  };

  map: any = null


  componentDidMount() {
    if (process.env.REACT_APP_MAPBOX_ACCESS_TOKEN) {

      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9'
      })

      map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false
        })
      );

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        })
      );

      map.on('zoomend', this.fetchLocations)

      map.on('dragend', this.fetchLocations)

      this.map = map
    }
  }

  fetchLocations = async () => {
    const { lng, lat } = this.map.getCenter()

    console.log(lng, lat)
  }

  render() {
    return (
      <div className='Map'>
        <div id='map'></div>
      </div>
    );
  }
}