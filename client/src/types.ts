import firebase from 'firebase';
export type MediaType = 'image' | 'image360' | 'video';

export type GeoLocation = {
  latitude: string;
  longitude: string;
};

export type FirebaseItem = {
  title: string;
  tags: Array<string>;
  type: MediaType;
  geo: firebase.firestore.GeoPoint;
  fullPath: string;
};
