import React, { useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import ImageViewer from 'react-viewer';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { Share } from '@material-ui/icons';
import View360 from '../View360/View360';
import { MediaType, FirebaseItem } from '../../types';
import firebase from 'firebase';

type ViewRouteParams = {
  id: string;
  type: MediaType;
};

const Sharing: React.FunctionComponent<{ title: string }> = ({ title }) => {
  return window.navigator.share ? (
    <BottomNavigation className="Sharing" showLabels>
      <BottomNavigationAction
        onClick={() =>
          window.navigator.share({
            url: window.location.href,
            title,
          })
        }
        icon={<Share />}
        label="Teilen"
      />
    </BottomNavigation>
  ) : null;
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
      <aside className="Viewer">
        <ImageViewer
          visible={true}
          images={[
            {
              src,
              alt: title,
            },
          ]}
        />
        <Sharing title={title} />
      </aside>
    );
  }

  if (type === 'image360') {
    return (
      <aside className="Viewer">
        <View360 imagePath={src} imageText={title} />
        <Sharing title={title} />
      </aside>
    );
  }

  if (type === 'video') {
    return (
      <aside className="Viewer">
        <video src={src} title={title} />
        <Sharing title={title} />
      </aside>
    );
  }

  return null;
};

export default withRouter(View);
