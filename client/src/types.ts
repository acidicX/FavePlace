import firebase from 'firebase';
export type MediaType = 'image' | 'image360' | 'video';

export type GeoLocation = {
  latitude: string;
  longitude: string;
};

export type FirebaseItem = {
  id: string;
  title: string;
  tags: Array<string>;
  type: MediaType;
  geo: firebase.firestore.GeoPoint;
  fullPath: string;
};

export type FirebaseRequest = {
  id: string;
  title?: string;
  geo: firebase.firestore.GeoPoint;
  timestamp: firebase.firestore.Timestamp;
};

export type InjectedConfiguration = {
  mapboxAccessToken: string;
  mapboxMapStyle: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseDatabaseUrl: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
};

declare global {
  interface Window {
    injectedConfiguration: InjectedConfiguration;
  }
}
