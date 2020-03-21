import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from '../Home/Home';
import { View } from '../View/View';
import UploadForm from '../UploadForm/UploadForm';

export default () => (
  <div className="App">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/view/:id" element={<View />} />
      <Route path="/upload" element={<UploadForm />} />
    </Routes>
  </div>
);
