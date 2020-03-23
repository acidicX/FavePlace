import { InjectedConfiguration } from '../types';
import { isDev } from './env';

if (!isDev && !window.injectedConfiguration) {
  throw new Error('Injected configuration is not available');
}

export const appConfig: InjectedConfiguration = {
  mapboxAccessToken: isDev
    ? process.env.REACT_APP_MAPBOX_ACCESS_TOKEN!
    : window.injectedConfiguration.mapboxAccessToken,
  mapboxMapStyle: isDev
    ? process.env.REACT_APP_MAPBOX_MAP_STYLE!
    : window.injectedConfiguration.mapboxMapStyle,
  firebaseApiKey: isDev
    ? process.env.REACT_APP_FIREBASE_API_KEY!
    : window.injectedConfiguration.firebaseApiKey,
  firebaseAuthDomain: isDev
    ? process.env.REACT_APP_FIREBASE_AUTH_DOMAIN!
    : window.injectedConfiguration.firebaseAuthDomain,
  firebaseDatabaseUrl: isDev
    ? process.env.REACT_APP_FIREBASE_DATABASE_URL!
    : window.injectedConfiguration.firebaseDatabaseUrl,
  firebaseProjectId: isDev
    ? process.env.REACT_APP_FIREBASE_PROJECT_ID!
    : window.injectedConfiguration.firebaseProjectId,
  firebaseStorageBucket: isDev
    ? process.env.REACT_APP_FIREBASE_STORAGE_BUCKET!
    : window.injectedConfiguration.firebaseStorageBucket,
  firebaseMessagingSenderId: isDev
    ? process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID!
    : window.injectedConfiguration.firebaseMessagingSenderId,
  firebaseAppId: isDev
    ? process.env.REACT_APP_FIREBASE_APP_ID!
    : window.injectedConfiguration.firebaseAppId,
};
