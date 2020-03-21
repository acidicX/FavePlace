import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { View } from '../View/View';
import Map from '../Map/Map'


export default () => (
  <div className="App">
    <Routes>
      <Route path="/" element={<Map />} />
      <Route path="/view/:id" element={<View />} />
    </Routes>
  </div>
);
