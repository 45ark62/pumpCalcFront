import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import { authApi } from 'app/store/authStore/api/authApi';
import type { UiStore } from 'app/store/uiStore/model/uiStore';

import { setToken } from 'entities/baseApi';
import type { AuthData, Errors } from '../types/types';

/** Fallback, если бэкенд не прислал `expires` (старые сессии) */
export const ACCESS_TIME = 1000 * 60 * 60 * 48;

const KEY_EXPIRES = 'authExpires';
const KEY_USER_DISPLAY = 'authUserDisplay';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export class AuthStore {
  private _isSomePending: boolean = false;
  private _rememberMe: boolean = Boolean(localStorage.getItem('rememberMe'));
  private _loginForAuth: string = '';
  private readonly _uiStore?: UiStore;

  public get loginForAuth() {
    return this._loginForAuth;
  }

  public set loginForAuth(val: string) {
    this._loginForAuth = val;
  }

  public get isSomePending() {
    return this._isSomePending;
  }

  public errors: Errors = {
    signin: null,
    restore: null,
    registration: null,
  };

  private get _storage() {
    return this._rememberMe ? localStorage : sessionStorage;
  }

  private _clearAuthStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authTime');
    localStorage.removeItem(KEY_EXPIRES);
    localStorage.removeItem(KEY_USER_DISPLAY);
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('authTime');
    sessionStorage.removeItem(KEY_EXPIRES);
    sessionStorage.removeItem(KEY_USER_DISPLAY);
  }

  /** Имя/логин в том же хранилище, что и токен */
  private _readUserDisplay(): string {
    if (localStorage.getItem('accessToken')) {
      return localStorage.getItem(KEY_USER_DISPLAY) ?? '';
    }
    if (sessionStorage.getItem('accessToken')) {
      return sessionStorage.getItem(KEY_USER_DISPLAY) ?? '';
    }
    return '';
  }

  private _nameFromJwt(): string | null {
    const token = this._accessToken;
    if (!token) return null;
    const p = decodeJwtPayload(token);
    if (!p) return null;
    const claimName =
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
    const raw =
      (p[claimName] as string | undefined) ||
      (p.email as string | undefined) ||
      (p.unique_name as string | undefined) ||
      (p.name as string | undefined) ||
      (p.sub as string | undefined);
    return raw?.trim() || null;
  }

  /** Подпись в шапке: сохранённый логин или имя из JWT */
  public get userDisplayLabel(): string {
    if (this._loginForAuth) return this._loginForAuth;
    return this._nameFromJwt() ?? 'Пользователь';
  }

  private _accessToken =
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken');
  private _time =
    localStorage.getItem('authTime') ?? sessionStorage.getItem('authTime');
  /** ISO-строка с бэкенда, поле `expires` */
  private _expiresIso =
    localStorage.getItem(KEY_EXPIRES) ?? sessionStorage.getItem(KEY_EXPIRES);

  private _update() {
    this._accessToken =
      localStorage.getItem('accessToken') ??
      sessionStorage.getItem('accessToken');
    this._time =
      localStorage.getItem('authTime') ?? sessionStorage.getItem('authTime');
    this._expiresIso =
      localStorage.getItem(KEY_EXPIRES) ?? sessionStorage.getItem(KEY_EXPIRES);

    if (this._accessToken) {
      setToken(this._accessToken);
    } else {
      setToken(null);
    }

    this._loginForAuth = this._readUserDisplay();
  }

  private get _isValidAccessToken() {
    if (!this._accessToken) {
      return false;
    }

    if (this._expiresIso) {
      const expMs = new Date(this._expiresIso).getTime();
      if (Number.isNaN(expMs)) {
        return false;
      }
      return Date.now() < expMs;
    }

    if (this._time) {
      return Date.now() - Number(this._time) < ACCESS_TIME;
    }

    return false;
  }

  constructor(uiStore?: UiStore) {
    this._uiStore = uiStore;
    makeAutoObservable(this);
    this._update();

    setInterval(() => {
      this._update();
    }, 5000);
  }

  public get isAuth() {
    return this._isValidAccessToken;
  }

  public logout() {
    // Full cleanup on logout by user request.
    localStorage.clear();
    sessionStorage.clear();

    runInAction(() => {
      this._rememberMe = false;
      this._loginForAuth = '';
    });
    this._update();
  }

  /**
   * Сохраняет JWT и срок действия (как пришло с API).
   * `expires` — ISO UTC, например `2026-04-07T00:39:33.2277027Z`
   */
  public forceLogin(token: string, expiresIso?: string, userDisplayName?: string) {
    setToken(token);
    runInAction(() => {
      this._storage.setItem('accessToken', token);
      if (expiresIso) {
        this._storage.setItem(KEY_EXPIRES, expiresIso);
        this._storage.removeItem('authTime');
      } else {
        this._storage.setItem('authTime', JSON.stringify(Date.now()));
        this._storage.removeItem(KEY_EXPIRES);
      }
      if (userDisplayName !== undefined && userDisplayName !== '') {
        this._storage.setItem(KEY_USER_DISPLAY, userDisplayName);
      }
      this._update();
    });
  }

  public async login({ data }: { data: AuthData }) {
    runInAction(() => {
      this._isSomePending = true;
      this.errors.signin = null;
    });

    try {
      const result = await authApi.login(data);
      const body = result?.data;
      if (body?.token) {
        this._clearAuthStorage();
        this.forceLogin(body.token, body.expires, data.userName);
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        runInAction(() => {
          this.errors.signin = 'auth';
        });
        this._uiStore?.showError('Неверный логин или пароль');
      } else {
        const message = axios.isAxiosError(e)
          ? e.response?.data
            ? typeof e.response.data === 'string'
              ? e.response.data
              : JSON.stringify(e.response.data)
            : e.message
          : e instanceof Error
            ? e.message
            : String(e);
        this._uiStore?.showError(message);
      }
      throw e;
    } finally {
      runInAction(() => {
        this._isSomePending = false;
      });
    }
  }

  public get userPermissions() {
    if (!this.isAuth) {
      return null;
    }

    const userToken = this._accessToken;
    if (!userToken) {
      return null;
    }
  }

  public get rememberMe() {
    return this._rememberMe;
  }

  public set rememberMe(val: boolean) {
    if (val) {
      localStorage.setItem('rememberMe', '1');
    } else {
      localStorage.removeItem('rememberMe');
    }

    this._rememberMe = val;
  }

  public async registration({ data }: { data: AuthData }) {
    runInAction(() => {
      this._isSomePending = true;
      this.errors.registration = null;
    });

    try {
      const result = await authApi.registration(data);
      const body = result?.data;
      if (body?.token) {
        this._clearAuthStorage();
        this.forceLogin(body.token, body.expires, data.userName);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        if (status !== undefined && status >= 400 && status < 500) {
          runInAction(() => {
            this.errors.registration = 'auth';
          });
          this._uiStore?.showError('Ошибка регистрации. Проверьте введенные данные');
        } else {
          const message = e.response?.data
            ? typeof e.response.data === 'string'
              ? e.response.data
              : JSON.stringify(e.response.data)
            : e.message;
          this._uiStore?.showError(message);
        }
      } else {
        this._uiStore?.showError(e instanceof Error ? e.message : String(e));
      }
      throw e;
    } finally {
      runInAction(() => {
        this._isSomePending = false;
      });
    }
  }
}
