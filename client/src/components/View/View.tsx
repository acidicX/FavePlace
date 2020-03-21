import React from 'react';
import { useParams } from 'react-router-dom';

type ViewProps = {};

export const View: React.FunctionComponent<ViewProps> = ({ children }) => {
  let { id } = useParams();
  return (
    <aside>
      <h2>View: {id}</h2>
      {children}
    </aside>
  );
};
