import firebase from 'firebase';
import { v4 } from 'uuid';
import { MediaType, GeoLocation, FirebaseItem } from '../types';

export async function uploadFile(
  type: MediaType,
  title: string,
  tags: Array<string>,
  geo: GeoLocation,
  blob: Blob
) {
  const storageRef = firebase.storage().ref();
  const id = v4();
  const imageRef = storageRef.child(id);

  return imageRef
    .put(blob)
    .catch(e => {
      console.error(e);
    })
    .then(function(snapshot) {
      console.log('Uploaded a blob or file!');
      const item: FirebaseItem = {
        title,
        tags,
        type,
        geo,
        fullPath: snapshot.ref.fullPath,
      };
      firebase
        .firestore()
        .collection('items')
        .add(item);

      return snapshot;
    })
    .catch(e => {
      console.error(e);
    });
}
