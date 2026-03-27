import { AuthStore } from 'app/store/authStore/model/authStore';
import { makeAutoObservable } from 'mobx';
import { UiStore } from 'app/store/uiStore/model/uiStore';

export class RootStore {
  public readonly authStore = new AuthStore();
  public readonly uiStore = new UiStore();

  constructor() {
    makeAutoObservable(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
