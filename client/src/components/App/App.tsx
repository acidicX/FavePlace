import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import { View } from '../View/View';
import Map from '../Map/Map'
import UploadForm from '../UploadForm/UploadForm';


export default () => (
  <div className="App">
    <Switch>
      <Route path="/" exact><Map /></Route>
      <Route path="/view/:id"><View /></Route>
      <Route path="/upload" element={<UploadForm />} />
    </Switch>
  </div>
);
