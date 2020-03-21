import firebase from 'firebase/app';
import 'firebase/firestore';
import { v4 } from 'uuid'
import { MediaType } from '../types'

export function uploadFile(type: MediaType, title: string, tags: Array<string>, blob: Blob): void {
  const storageRef = firebase.storage().ref();
  const id = v4();
  const imageRef = storageRef.child(id);
  imageRef.put(blob).then(function(snapshot) {
    console.log('Uploaded a blob or file!');
    firebase
      .firestore()
      .collection('items')
      .add({
        title,
        tags,
        type,
        fullPath: snapshot.ref.fullPath
      });
  });

}
