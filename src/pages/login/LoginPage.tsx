import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from 'app/paths';
import LoginForm from './forms/LoginForm';
import LoginHeader from './loginHeader/LoginHeader';
import LoginFooter from './loginFooter/LoginFooter';
import SignupForm from './forms/SignupForm';
import LoginContainer from './components/LoginContainer';
import { useStore } from 'app/store/useStore';

export type LoginPageFormType = 'login' | 'register';

function parseFormFromHash(hash: string): LoginPageFormType {
  if (hash === '#register' || hash === '#invite') return 'register';

  return 'login';
}

export default observer(function LoginPage() {
  const { authStore } = useStore();
  const navigate = useNavigate();
  const loc = useLocation();

  const [activeForm, setActiveForm] = useState<LoginPageFormType>(() =>
    parseFormFromHash(loc.hash)
  );

  const handleSwitchForm = () => {
    runInAction(() => {
      authStore.errors.signin = null;
      authStore.errors.restore = null;
      authStore.errors.registration = null;
    });
    setActiveForm((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  const headerText =
    activeForm === 'login' ? 'Вход' : 'Регистрация';

  return (
    <LoginContainer>
      <LoginHeader text={headerText} />
      {activeForm === 'login' ? (
        <LoginForm />
      ) : activeForm === 'register' ? (
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
              // ошибка в authStore.errors.registration
            }
          }}
        />
      ) : null}
      <LoginFooter activeForm={activeForm} handleSwitchForm={handleSwitchForm} />
    </LoginContainer>
  );
});
