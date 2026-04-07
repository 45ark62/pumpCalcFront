import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router-dom';
import { paths } from 'app/paths';
import { useStore } from 'app/store/useStore';

/** Для страниц входа: уже авторизованных отправляет в приложение */
const RequireGuest = observer(function RequireGuest() {
  const { authStore } = useStore();

  if (authStore.isAuth) {
    return <Navigate to={paths.main} replace />;
  }

  return <Outlet />;
});

export default RequireGuest;
