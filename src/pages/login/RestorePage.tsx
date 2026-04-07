import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginHeader from './loginHeader/LoginHeader';
import LoginContainer from './components/LoginContainer';
import RecoverForm from './forms/RecoverForm';
import { paths } from 'app/paths';
import { useStore } from 'app/store/useStore';

export default observer(function RestorePage() {
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
      <LoginHeader text="Новый пароль" />
      <RecoverForm
        onSubmit={async (data) => {
          if (data.password !== data.passwordConfirm) {
            return;
          }
          try {
            await authStore.login({
              data: {
                userName: 'user@local',
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
