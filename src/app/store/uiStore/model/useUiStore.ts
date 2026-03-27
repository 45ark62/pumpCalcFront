import { useStore } from 'app/store/useStore';
import { useEffect } from 'react';

export const useUiStore = () => {
  const { uiStore } = useStore();

  useEffect(() => {
    window.addEventListener('dragenter', (e) => {
      // @ts-ignore
      if (e.fromElement === null) {
        uiStore.isDrag = true;
      }
    });
    window.addEventListener('dragleave', (e) => {
      // @ts-ignore
      if (e.fromElement === null) {
        uiStore.isDrag = false;
      }
    });
    window.addEventListener('drop', (e) => {
      // @ts-ignore
      if (e.fromElement === null) {
        uiStore.isDrag = false;
      }
    });
  }, [uiStore]);
};
