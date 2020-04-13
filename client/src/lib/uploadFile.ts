import firebase from 'firebase';
import { v4 } from 'uuid';
import Jimp from 'jimp';
import { MediaType, FirebaseItem } from '../types';

type ImageOptions = {
  maxHeight: number;
  maxWidth: number;
  maxFileSize: number;
}

async function processImage(blob: Blob, options: ImageOptions): Promise<ArrayBuffer> {
  let arrayBuffer;
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    if (event.target) {
      arrayBuffer = event.target.result;
    }
  };
  fileReader.readAsArrayBuffer(blob);

  return await Jimp.read(arrayBuffer)
    .then(image => {
      const { maxHeight, maxWidth, maxFileSize } = options;
      const height = image.getHeight();
      const width = image.getWidth();
      const heightExceeded = height > maxHeight;
      const widthExceeded = width > maxWidth;
      const fileSizeExceeded = blob.size > maxFileSize;
      if (heightExceeded && !widthExceeded) {
        console.log("height exceeded")
        image.resize(Jimp.AUTO, maxHeight);
      }
      if (widthExceeded) {
        console.log("width exceeded")
        image.resize(maxWidth, Jimp.AUTO);
      }
      if (!heightExceeded && !widthExceeded && fileSizeExceeded) {
        console.log("file size exceeded")
        image.quality(70);
      }
      return image.getBufferAsync(Jimp.MIME_JPEG)
    })
}

export async function uploadFile(
  type: MediaType,
  title: string,
  tags: Array<string>,
  geo: FirebaseItem['geo'],
  blob: Blob
) {
  let processedFile: ArrayBuffer | Blob | void;
  try {
    if (type === "image") {
      processedFile = await processImage(blob, {
        maxHeight: 2160,
        maxWidth: 3840,
        maxFileSize: 10000000
      });
    }
    if (type === "image360") {
      processedFile = await processImage(blob, {
        maxHeight: 4352,
        maxWidth: 8704,
        maxFileSize: 15000000
      });
    }
    if (type === "video") {
      if (blob.size < 50000000) {
        processedFile = blob;
      } else {
        throw new Error('File size exceeded (> 50 MB)');
      }
    }
    if (!processedFile) {
      throw new Error('File could not be handled');
    }
  } catch (err) {
    alert ('File could not be handled');
    console.error(err);
    return;
  }

  const storageRef = firebase.storage().ref();
  const id = v4();
  const imageRef = storageRef.child(id);

  return imageRef
    .put(processedFile)
    .catch(e => {
      console.error(e);
    })
    .then(function(snapshot) {
      console.log('Uploaded a blob or file!');
      const item: Omit<FirebaseItem, 'id'> = {
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
