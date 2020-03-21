import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import uniqBy from 'lodash/uniqBy';
import firebase from 'firebase/app';
import 'firebase/firestore';
import "./Map.css"

interface Item {
  id: string,
  title: string,
  description: string,
  coordinates: {
    lat: number,
    lng: number
  }
}

export default class Map extends Component {
  state = {};

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
    if (this.map.isMoving() || this.map.getZoom() < 8) {
      return
    }

    const { lng, lat } = this.map.getCenter()

    let locations: Item[] = []

    await firebase
      .firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const {
            title,
            description
          } = doc.data()

          locations = uniqBy([
            ...locations,
            {
              title,
              description,
              id: doc.id,
              coordinates: {
                lng: lng + (Math.random() - 0.5) / 10,
                lat: lat + (Math.random() - 0.5) / 10
              },
            }], 'id')
        });
      });


    for (const location of locations) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url("https://docs.mapbox.com/mapbox-gl-js/assets/washington-monument.jpg")`

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.coordinates.lng, location.coordinates.lat])
        .addTo(this.map);

      marker.getElement().addEventListener('click', () => {
        console.log('show image')
      });
    }
  }

  render() {
    return (
      <div className='Map'>
        <div id='map'></div>
      </div>
    );
  }
}