import * as AFrame from 'aframe';
import React from 'react';
import './View360.css';

export interface IView360Props {
  imagePath: string;
  imageText: string;
}

const View360: React.SFC<IView360Props> = ({ imagePath, imageText }) => {
  return (
    <div className='Scene360'>
      <a-scene vr-mode-ui="enabled: true">
        <a-sky src={imagePath} rotation="0 -130 0"></a-sky>
        <a-text font="kelsonsans" value={imageText} width="6" position="-2.5 0.25 -1.5"
                rotation="0 15 0"></a-text>
      </a-scene>
    </div>
  )
}

export default View360
