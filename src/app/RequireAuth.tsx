import { observer } from 'mobx-react-lite';
import { useStore } from 'app/store/useStore';
import  { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = observer(function RequireAuth({
  children,
}: {
  children: ReactNode;
}) {
  const { authStore } = useStore();

  if (!authStore.isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

export default RequireAuth;
