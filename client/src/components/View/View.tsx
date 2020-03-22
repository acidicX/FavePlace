import React, { useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import ImageViewer from 'react-viewer';
import View360 from '../View360/View360';
import { MediaType, FirebaseItem } from '../../types';
import firebase from 'firebase';

type ViewRouteParams = {
  id: string;
  type: MediaType;
};

const View: React.FC<RouteComponentProps<ViewRouteParams>> = ({ match }) => {
  const { id, type } = match.params;
  const [title, setTitle] = useState('blums');

  firebase
    .firestore()
    .collection('items')
    .where('fullPath', '==', id)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data() as FirebaseItem;
        setTitle(data.title);
      });
    });

  const src = `https://firebasestorage.googleapis.com/v0/b/favorite-place-taxi.appspot.com/o/${id}?alt=media`;

  if (type === 'image') {
    return (
      <aside>
        <ImageViewer
          visible={true}
          images={[
            {
              src,
              alt: title,
            },
          ]}
        />
      </aside>
    );
  }

  if (type === 'image360') {
    return (
      <aside>
        <View360 imagePath={src} imageText={title} />
      </aside>
    );
  }

  if (type === 'video') {
    return (
      <aside>
        <video src={src} title={title} />
      </aside>
    );
  }

  return null;
};

export default withRouter(View);
