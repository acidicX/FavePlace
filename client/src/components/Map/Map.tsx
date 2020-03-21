import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import random from 'lodash/random'

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
    if (this.map.isMoving()) {
      return
    }

    const { lng, lat } = this.map.getCenter()

    const locations = this.generateRandomLocations({ lng, lat })

    for (const location of locations) {
      new mapboxgl.Marker()
        .setLngLat([location.coordinates.lng, location.coordinates.lat])
        .addTo(this.map);
    }
  }

  generateRandomLocations = ({ lng, lat }) => {
    const locations = Array.from(Array(random(5, 20))).map(() => {
      return {
        coordinates: {
          lng: lng + (Math.random() - 0.5) / 10,
          lat: lat + (Math.random() - 0.5) / 10
        },
        imgUrl: 'https://source.unsplash.com/random'
      }
    })


    return locations
  }

  render() {
    return (
      <div className='Map'>
        <div id='map'></div>
      </div>
    );
  }
}