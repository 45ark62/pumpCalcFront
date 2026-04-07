import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import { pumpDatabaseApi } from 'entities/pumpDatabase/api/pumpDatabaseApi';
import type { PumpDto } from 'entities/pumpDatabase/types/pumpTypes';
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

export class PumpDatabaseStore {
  pumps: PumpDto[] = [];
  currentPump: PumpDto | null = null;
  loading = false;
  error: string | null = null;
  private readonly uiStore?: UiStore;

  constructor(uiStore?: UiStore) {
    this.uiStore = uiStore;
    makeAutoObservable(this);
  }

  async fetchPumps() {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });
    try {
      const { data } = await pumpDatabaseApi.getList();
      runInAction(() => {
        this.pumps = data ?? [];
        this.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = errMessage(e);
        this.uiStore?.showError(this.error ?? 'Неизвестная ошибка');
        this.loading = false;
      });
      throw e;
    }
  }

  async fetchPump(id: number) {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });
    try {
      const { data } = await pumpDatabaseApi.getById(id);
      runInAction(() => {
        this.currentPump = data;
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

  async createPump(body: PumpDto) {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });
    try {
      const { data } = await pumpDatabaseApi.create(body);
      runInAction(() => {
        if (data) {
          this.pumps = [...this.pumps, data];
        }
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

  /**
   * Универсальное сохранение (create/update через POST /api/Pumps).
   * Если сервер на edit возвращает новый id, `replaceId` позволяет убрать старую строку.
   */
  async savePump(body: PumpDto, replaceId?: number) {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });
    try {
      const { data } = await pumpDatabaseApi.create(body);
      runInAction(() => {
        if (data) {
          const targetId = replaceId ?? data.id;
          const idx = this.pumps.findIndex((p) => p.id === targetId);
          if (idx >= 0) {
            const next = [...this.pumps];
            next[idx] = data;
            this.pumps = next;
          } else {
            this.pumps = [data, ...this.pumps];
          }
        }
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
  async updatePump(body: PumpDto) {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });
    try {
      const { data } = await pumpDatabaseApi.update(body);
      // PUT часто отдаёт пустое тело (204) или неполный объект — тогда UI не обновлялся.
      const merged: PumpDto = {
        ...body,
        ...(data && typeof data === 'object' ? data : {}),
      };
      runInAction(() => {
        const idx = this.pumps.findIndex((p) => p.id === merged.id);
        if (idx >= 0) {
          const next = [...this.pumps];
          next[idx] = merged;
          this.pumps = next;
        } else {
          this.pumps = [merged, ...this.pumps];
        }
        if (this.currentPump?.id === merged.id) {
          this.currentPump = merged;
        }
        this.loading = false;
      });
      return merged;
    } catch (e) {
      runInAction(() => {
        this.error = errMessage(e);
        this.uiStore?.showError(this.error ?? 'Неизвестная ошибка');
        this.loading = false;
      });
      throw e;
    }
  }

  async deletePump(id: number) {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });
    try {
      await pumpDatabaseApi.remove(id);
      runInAction(() => {
        this.pumps = this.pumps.filter((p) => p.id !== id);
        if (this.currentPump?.id === id) {
          this.currentPump = null;
        }
        this.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = errMessage(e);
        this.uiStore?.showError(this.error ?? 'Неизвестная ошибка');
        this.loading = false;
      });
      throw e;
    }
  }

  clearError() {
    this.error = null;
  }
}
