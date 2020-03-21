import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import { View } from '../View/View';
import Map from '../Map/Map'


export default () => (
  <div className="App">
    <Switch>
      <Route path="/" exact><Map /></Route>
      <Route path="/view/:id"><View /></Route>
    </Switch>
  </div>
);
