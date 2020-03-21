import React from 'react';
import data from '../../data.json';
import { Link, LinkProps } from 'react-router-dom';
import {
  List as MaterialList,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
} from '@material-ui/core';
import { Image as ImageIcon } from '@material-ui/icons';

type ListProps = {};

type ListItemLinkProps = ListItemProps & {
  to: string;
  icon?: React.ReactElement;
};

function ListItemLink(props: ListItemLinkProps) {
  const { icon, children, to } = props;

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
}

export const List: React.FunctionComponent<ListProps> = () => (
  <MaterialList>
    {Object.entries(data.assets).map(([key, { user }]) => (
      <ListItemLink icon={<ImageIcon />} to={`/view/${key}`} key={key}>
        <ListItemText primary={key} secondary={user} />
      </ListItemLink>
    ))}
  </MaterialList>
);
