import axios from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';
import { pumpUnitsSelectionApi } from 'entities/pumpUnitsSelection/api/pumpUnitsSelectionApi';
import type {
  PumpAssemblyAdjustRequest,
  PumpAssemblyAdjustResponse,
} from 'entities/pumpUnitsSelection/api/pumpUnitsSelectionApi';
import type { UiStore } from 'app/store/uiStore/model/uiStore';

function errMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return e.response?.data
      ? typeof e.response.data === 'string'
        ? e.response.data
        : JSON.stringify(e.response.data)
      : e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

export class PumpUnitsSelectionStore {
  result: PumpAssemblyAdjustResponse | null = null;
  loading = false;
  error: string | null = null;
  private readonly uiStore?: UiStore;

  constructor(uiStore?: UiStore) {
    this.uiStore = uiStore;
    makeAutoObservable(this);
  }

  async calculate(body: PumpAssemblyAdjustRequest) {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      const { data } = await pumpUnitsSelectionApi.calculate(body);
      runInAction(() => {
        this.result = data;
        this.loading = false;
      });
      return data;
    } catch (e) {
      runInAction(() => {
        this.error = errMessage(e);
        this.uiStore?.showError(this.error ?? 'Неизвестная ошибка');
        this.loading = false;
      });
      throw e;
    }
  }

  clearResult() {
    this.result = null;
  }

  clearError() {
    this.error = null;
  }
}
