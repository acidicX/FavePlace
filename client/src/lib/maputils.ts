import { FirebaseItem, FirebaseRequest } from '../types';

export function mapItemsToGeoFeatures(items: FirebaseItem[]): GeoJSON.FeatureCollection {
  return {
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
  };
}

export function mapRequestsToGeoFeatures(requests: FirebaseRequest[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: requests.map(request => {
      const { id, title, geo } = request;

      const feature: GeoJSON.Feature = {
        type: 'Feature',
        properties: {
          id,
          title,
        },
        geometry: {
          type: 'Point',
          coordinates: [geo.longitude, geo.latitude],
        },
      };

      return feature;
    }),
  };
}
