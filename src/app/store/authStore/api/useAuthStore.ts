import { useStore } from 'app/store/useStore';
import { useEffect } from 'react';

export const useAuthStore = () => {
  const { authStore } = useStore();

  useEffect(() => {

  }, [authStore, authStore?.isAuth]);

  return { authStore};
};
