import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import {
  List as MaterialList,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
} from '@material-ui/core';
import { Image as ImageIcon, Movie, ThreeDRotation } from '@material-ui/icons';
import { FirebaseItem, MediaType } from '../../types';

type ListProps = {
  items: FirebaseItem[];
};

type ListItemLinkProps = ListItemProps & {
  to: string;
  icon?: React.ReactElement;
};

const mapTypeToIcon = new Map<MediaType, React.ReactElement>([
  ['image', <ImageIcon />],
  ['image360', <ThreeDRotation />],
  ['video', <Movie />],
]);

const ListItemLink: React.FunctionComponent<ListItemLinkProps> = ({ icon, children, to }) => {
  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<LinkProps, 'to'>>((itemProps, ref) => (
        <Link to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        {children}
      </ListItem>
    </li>
  );
};

export const List: React.FunctionComponent<ListProps> = ({ items }) => (
  <MaterialList className="List">
    {items.map(item => (
      <ListItemLink
        icon={mapTypeToIcon[item.type]}
        to={`/view/${item.type}/${item.fullPath}`}
        key={item.fullPath}
      >
        <ListItemText
          primary={item.title}
          secondary={`${item.geo.latitude},${item.geo.longitude}`}
        />
      </ListItemLink>
    ))}
  </MaterialList>
);
