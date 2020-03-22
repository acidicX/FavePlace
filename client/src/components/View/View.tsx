import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import ImageViewer from 'react-viewer';
import View360 from '../View360/View360';
import { MediaType } from '../../types';

type ViewRouteParams = {
  id: string;
  type: MediaType;
};

const View: React.SFC<RouteComponentProps<ViewRouteParams>> = ({ match }) => {
  const { id, type } = match.params;

  const src = `https://firebasestorage.googleapis.com/v0/b/favorite-place-taxi.appspot.com/o/${id}?alt=media`;
  const title = '#WirVsVirus';

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
