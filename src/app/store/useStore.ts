import { useRootStore } from './rootStore/rootStoreContext';

export const useStore = () => {
  return useRootStore();
};
