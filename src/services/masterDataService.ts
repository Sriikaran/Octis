import { api } from './api';
import { Worker, Item } from '@/types';

export interface PurityOption {
  label: string;
  value: number;
}

let workersCache: Worker[] | null = null;
let itemsCache: Item[] | null = null;
let puritiesCache: PurityOption[] | null = null;

// Subscribers for real-time global cache invalidation across pages/components
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error notifying masterDataService listener:', err);
    }
  });
}

export const masterDataService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  clearCache() {
    workersCache = null;
    itemsCache = null;
    puritiesCache = null;
    notifyListeners();
  },

  async getWorkers(forceRefresh = false): Promise<Worker[]> {
    if (workersCache && !forceRefresh) {
      return workersCache;
    }

    try {
      const data = await api.get<any[]>('getWorkers');
      const list = data
        .map((item) => ({
          id: item.id || item.ID || item.Id || String(Math.random()),
          name: (item.worker || item.WorkerName || item.Worker || item.name || '').trim(),
        }))
        .filter((w) => w.name);

      // Auto-sort alphabetically
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

      workersCache = list;
      return workersCache;
    } catch (error: unknown) {
      console.error('Error fetching workers', error);
      return workersCache || [];
    }
  },

  async createWorker(name: string): Promise<Worker> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Worker name cannot be empty');

    // Case-insensitive duplicate check against cache
    const current = await this.getWorkers();
    if (current.some((w) => w.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Worker "${trimmed}" already exists.`);
    }

    const response = await api.post<any>('createWorker', { name: trimmed });
    this.clearCache();
    return {
      id: response?.id || String(Math.random()),
      name: trimmed,
    };
  },

  async deleteWorker(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await api.post('deleteWorker', { name: trimmed });
      this.clearCache();
    } catch (err: any) {
      // Re-throw API error (including reference check count messages)
      throw err;
    }
  },

  async getItems(forceRefresh = false): Promise<Item[]> {
    if (itemsCache && !forceRefresh) {
      return itemsCache;
    }

    try {
      const data = await api.get<any[]>('getItems');
      const list = data
        .map((item) => ({
          id: item.id || item.ID || item.Id || String(Math.random()),
          name: (item.item || item.ItemName || item.Item || item.name || '').trim(),
          category: '',
          code: '',
        }))
        .filter((i) => i.name);

      // Auto-sort alphabetically
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

      itemsCache = list;
      return itemsCache;
    } catch (error: unknown) {
      console.error('Error fetching items', error);
      return itemsCache || [];
    }
  },

  async createItem(name: string): Promise<Item> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Item name cannot be empty');

    const current = await this.getItems();
    if (current.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Item "${trimmed}" already exists.`);
    }

    const response = await api.post<any>('createItem', { name: trimmed });
    this.clearCache();
    return {
      id: response?.id || String(Math.random()),
      name: trimmed,
      category: '',
      code: '',
    };
  },

  async deleteItem(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await api.post('deleteItem', { name: trimmed });
      this.clearCache();
    } catch (err: any) {
      throw err;
    }
  },

  async getPurities(forceRefresh = false): Promise<PurityOption[]> {
    if (puritiesCache && !forceRefresh) {
      return puritiesCache;
    }

    try {
      const data = await api.get<any[]>('getPurities');
      const list = data
        .map((item) => {
          const raw =
            item.purity !== undefined
              ? item.purity
              : item.Purity !== undefined
              ? item.Purity
              : '';
          const val = parseFloat(raw);
          return {
            label: isNaN(val) ? String(raw) : `${val}%`,
            value: isNaN(val) ? 0 : val,
          };
        })
        .filter((p) => p.label !== '' && !isNaN(p.value));

      // Auto-sort numerically ascending
      list.sort((a, b) => a.value - b.value);

      // Remove numerical duplicates
      const unique: PurityOption[] = [];
      list.forEach((item) => {
        if (!unique.some((u) => Math.abs(u.value - item.value) < 0.0001)) {
          unique.push(item);
        }
      });

      puritiesCache = unique;
      return puritiesCache;
    } catch (error: unknown) {
      console.error('Error fetching purities', error);
      return puritiesCache || [];
    }
  },

  async createPurity(purityInput: number | string): Promise<PurityOption> {
    const num = parseFloat(String(purityInput));
    if (isNaN(num)) throw new Error('Invalid purity value');

    const current = await this.getPurities();
    if (current.some((p) => Math.abs(p.value - num) < 0.0001)) {
      throw new Error(`Purity ${num}% already exists.`);
    }

    await api.post('createPurity', { purity: num });
    this.clearCache();
    return {
      label: `${num}%`,
      value: num,
    };
  },

  async deletePurity(purityInput: number | string): Promise<void> {
    const num = parseFloat(String(purityInput));
    if (isNaN(num)) return;

    try {
      await api.post('deletePurity', { purity: num });
      this.clearCache();
    } catch (err: any) {
      throw err;
    }
  },
};
