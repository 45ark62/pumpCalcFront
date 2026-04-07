import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginHeader from './loginHeader/LoginHeader';
import LoginContainer from './components/LoginContainer';
import SignupForm from './forms/SignupForm';
import { paths } from 'app/paths';
import { useStore } from 'app/store/useStore';

export default observer(function RegistrationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { authStore } = useStore();
  const codeRef = useRef(searchParams.get('code'));

  useEffect(() => {
    if (!codeRef.current) {
      navigate('/login');
      return;
    }
    setSearchParams({});
  }, [navigate, setSearchParams]);

  return (
    <LoginContainer>
      <LoginHeader text="Создание пароля" />
      <SignupForm
        onSubmit={async (data) => {
          if (data.password !== data.passwordConfirm) {
            return;
          }
          try {
            await authStore.registration({
              data: {
                userName: data.login.trim(),
                password: data.password,
              },
            });
            if (authStore.isAuth) {
              navigate(paths.main, { replace: true });
            }
          } catch {
            // ошибка в authStore
          }
        }}
      />
    </LoginContainer>
  );
});
