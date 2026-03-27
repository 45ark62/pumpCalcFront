import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';

type CreateMeetingModalState = {
  isOpen: boolean;
  hasChanges: boolean;
};

export class UiStore {
  private _isNavBarShort = false;
  private _isDrag = false;
  private _routerHash = nanoid();

  /**
   * Логика распределенной модалки создания совещания
   *
   * @param isOpen - Открыта ли модалка, нажатие на кнопку в AppBar открывает модалку
   *
   * @param hasChanges - форма редактирования/создания совещания меняет данный параметр
   *
   * Когда isOpen === true и hasChanges === true тогда форма рисует защитную модалку
   *
   * Когда isOpen === true а hasChanges === false тогда AppBar рисует стандартную модалку
   */
  private _createMeetingModalState: CreateMeetingModalState = {
    isOpen: false,
    hasChanges: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  public get routerHash() {
    return this._routerHash;
  }

  public toggleCreateMeetingModal(val: boolean) {
    this._createMeetingModalState.isOpen = val;
  }
  public setMeetingHasChanges(val: boolean) {
    this._createMeetingModalState.hasChanges = val;
  }
  public get isDefaultCreateMeetingModal() {
    return (
      this._createMeetingModalState.isOpen &&
      !this._createMeetingModalState.hasChanges
    );
  }
  public get isChangeProtectCreateMeetingModal() {
    return (
      this._createMeetingModalState.isOpen &&
      this._createMeetingModalState.hasChanges
    );
  }

  public get isNavBarShort() {
    return this._isNavBarShort;
  }
  public set isNavBarShort(val: boolean) {
    this._isNavBarShort = val;
  }

  public get isDrag() {
    return this._isDrag;
  }
  public set isDrag(val: boolean) {
    this._isDrag = val;
  }
}
