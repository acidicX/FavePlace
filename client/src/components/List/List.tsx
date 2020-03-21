import React from 'react';
import data from '../../data.json';
import { Link } from 'react-router-dom';

type ListProps = {};

export const List: React.FunctionComponent<ListProps> = () => (
  <ul>
    {Object.entries(data.assets).map(([key, { user }]) => (
      <li key={key}>
        <Link to={`/view/${key}`}>
          <strong>{key}</strong> by {user}
        </Link>
      </li>
    ))}
  </ul>
);
