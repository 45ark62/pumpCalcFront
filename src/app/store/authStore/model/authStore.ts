import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import { authApi } from 'app/store/authStore/api/authApi';

import { setToken } from 'entities/baseApi';
import type { AuthData, Errors } from '../types/types';

export const ACCESS_TIME = 1000 * 60 * 60 * 48;

export class AuthStore {
  private _isSomePending: boolean = false;
  private _rememberMe: boolean = Boolean(localStorage.getItem('rememberMe'));
  private _loginForAuth: string = '';

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
  };

  private get _storage() {
    return this._rememberMe ? localStorage : sessionStorage;
  }

  private _clearAuthStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authTime');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('authTime');
  }

  private _accessToken =
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken');
  private _time =
    localStorage.getItem('authTime') ?? sessionStorage.getItem('authTime');
  private _logoutTrigger = 1;

  private _update() {
    this._logoutTrigger = Math.random();
    this._accessToken =
      localStorage.getItem('accessToken') ??
      sessionStorage.getItem('accessToken');
    this._time =
      localStorage.getItem('authTime') ?? sessionStorage.getItem('authTime');

    if (this._accessToken) {
      setToken(this._accessToken);
    }
  }

  private get _isValidAccessToken() {
    return Boolean(
      this._accessToken &&
        Date.now() - Number(this._time) < ACCESS_TIME &&
        this._logoutTrigger
    );
  }

  constructor() {
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
    this._clearAuthStorage();
    localStorage.removeItem('rememberMe');

    runInAction(() => {
      this._rememberMe = false;
      this._loginForAuth = '';
    });
    this._update();
  }

  public forceLogin(access_token: string) {
    setToken(access_token);
    runInAction(() => {
      this._storage.setItem('accessToken', access_token);
      this._storage.setItem('authTime', JSON.stringify(Date.now()));
      this._update();
    });
  }

  public async login({ data }: { data: AuthData }) {
    this._isSomePending = true;

    try {
      const result = await authApi.login(data);

      this._isSomePending = false;

      if (result) {
        this._clearAuthStorage();
        this.forceLogin(result.data.access_token);
      }
    } catch (e) {
      this._isSomePending = false;
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        this.errors.signin = 'auth';
      }
      throw e;
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
}
