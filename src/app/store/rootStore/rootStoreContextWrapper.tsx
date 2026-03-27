import React from 'react';
import { RootStoreContext } from 'app/store/rootStore/rootStoreContext';
import rootStore from 'app/store/rootStore/rootStore';

const value = { rootStore };

export default function RootStoreContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootStoreContext value={value}>{children}</RootStoreContext>;
}
