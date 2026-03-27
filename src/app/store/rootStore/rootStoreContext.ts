import React, { use } from 'react';
import rootStore from 'app/store/rootStore/rootStore';

export const RootStoreContext = React.createContext({
  rootStore: rootStore,
});

export const useRootStore = () => {
  const context = use(RootStoreContext);
  if (context === null) {
    throw new Error(
      'useStore must be used within a <RootStoreContext.Provider>'
    );
  }
  return context.rootStore;
};
