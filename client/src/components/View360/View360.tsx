import * as AFrame from 'aframe';
import React, { Component } from 'react';
import './View360.css';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any;
      "a-sky": any;
      "a-text": any;
    }
  }
}

export default class View360 extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div className='Scene360'>
        <a-scene vr-mode-ui="enabled: true">
          <a-sky src="/images/360/Milano-Duomo_Carolin-Windloff.jpg" rotation="0 -130 0"></a-sky>
          <a-text font="kelsonsans" value="Duomo, Milano, Italy" width="6" position="-2.5 0.25 -1.5"
                  rotation="0 15 0"></a-text>
        </a-scene>
      </div>
    )
  }
}
