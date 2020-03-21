import React from 'react';
import * as AFrame from 'aframe';
import { useParams } from 'react-router-dom';
import View360 from '../View360/View360';
import data from '../../data.json';

type ViewProps = {};

console.debug('Loading AFrame: ' + AFrame.version);

export const View: React.FunctionComponent<ViewProps> = ({ children }) => {
  const { id } = useParams();
  const content = data.assets[id as keyof typeof data.assets];

  return (
    <aside>
      <h2>Shared by {content.user}</h2>
      <View360 imagePath={content.path} imageText={content.title} />
    </aside>
  );
};
