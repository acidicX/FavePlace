export type MediaType = 'image' | 'image360' | 'video';

export type GeoLocation = {
  lat: string;
  lng: string;
};

export type FirebaseItem = {
  title: string;
  tags: Array<string>;
  type: MediaType;
  geo: GeoLocation;
  fullPath: string;
};
