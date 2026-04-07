import { AuthStore } from 'app/store/authStore/model/authStore';
import { PumpDatabaseStore } from 'app/store/pumpDatabaseStore/model/pumpDatabaseStore';
import { PumpUnitsStore } from 'entities/pumpUnits/model/PumpUnitsStore';
import { PumpUnitsSelectionStore } from 'entities/pumpUnitsSelection/model/pumpUnitsSelectionStore';
import { makeAutoObservable } from 'mobx';
import { UiStore } from 'app/store/uiStore/model/uiStore';

export class RootStore {
  public readonly uiStore = new UiStore();
  public readonly authStore = new AuthStore(this.uiStore);
  public readonly pumpDatabaseStore = new PumpDatabaseStore(this.uiStore);
  public readonly pumpUnitsStore = new PumpUnitsStore(this.uiStore);
  public readonly pumpUnitsSelectionStore = new PumpUnitsSelectionStore(this.uiStore);

  constructor() {
    makeAutoObservable(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
