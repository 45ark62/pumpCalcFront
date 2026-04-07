import React from 'react';
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { paths } from 'app/paths';
import RequireAuth from './RequireAuth';
import RequireGuest from './RequireGuest';
import RootLayout from 'pages/rootLayout';
import AuthorizedLayout from 'pages/authorizedLayout';
import PumpDatabasePageSkeleton from 'pages/pumpDatabase/PumpDatabasePageSkeleton';
import PumpUnitsPageSkeleton from 'pages/PumpUnits/PumpUnitsPageSkeleton';
import PumpUnitSelectionPageSkeleton from 'pages/PumpUnitSelection/PumpUnitSelectionPageSkeleton';
import NotFoundPage from 'pages/NotFoundPage';
import { useAuthStore } from './store/authStore/api/useAuthStore';



const LoginPage = React.lazy(() => import('pages/login/LoginPage'));


const PumpDatabasePage = React.lazy(() => import('pages/pumpDatabase/PumpDatabasePage'));

const PumpUnitsPage = React.lazy(() => import('pages/PumpUnits/PumpUnitsPage'));

const PumpUnitSelectionPage = React.lazy(() => import('pages/PumpUnitSelection/PumpUnitSelectionPage'));



const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ---------- LOGIN (гости) ----------
      {
        path: 'login',
        element: <RequireGuest />,
        children: [
          {
            index: true,
            element: (
              <React.Suspense fallback={<></>}>
                <LoginPage />
              </React.Suspense>
            ),
          },
          {
            path: 'reset',
            element: (
              <React.Suspense fallback={<></>}>
               {/* <ResetPasswordPage />*/}
              </React.Suspense>
            ),
          },
        ],
      },

      // ---------- AUTHORIZED ----------
      {
        path: '/',
        element: (
          <RequireAuth>
            <AuthorizedLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={paths.root} replace />,
          },
          {
            path: paths.root,
            element: (
              <React.Suspense fallback={<PumpDatabasePageSkeleton/>}>
                <PumpDatabasePage />
              </React.Suspense>
            ),
          },
          {
            path: paths.pumpUnits,
            element: (
              <React.Suspense fallback={<PumpUnitsPageSkeleton />}>
                <PumpUnitsPage />
              </React.Suspense>
            ),
          },
          {
            path: paths.pumpUnitSelection,
            element: (
              <React.Suspense fallback={<PumpUnitSelectionPageSkeleton />}>
                <PumpUnitSelectionPage />
              </React.Suspense>
            ),
          },
          
        ],
      },

      // ---------- 404 ----------
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

const App = observer(() => {
  useAuthStore();

  return <RouterProvider router={router} />;
});

export default App;
