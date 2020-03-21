import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from '../Home/Home';
import { View } from '../View/View';

export default () => (
  <div className="App">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/view/:id" element={<View />} />
    </Routes>
  </div>
);
