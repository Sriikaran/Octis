import { api } from './api';
import { Worker, Item } from '@/types';

export interface PurityOption {
  label: string;
  value: number;
  id?: string;
}

let workersCache: Worker[] | null = null;
let itemsCache: Item[] | null = null;
let puritiesCache: PurityOption[] | null = null;

export const masterDataService = {
  // =====================================
  // WORKERS
  // =====================================
  async getWorkers(forceRefresh = false): Promise<Worker[]> {
    if (workersCache && !forceRefresh) {
      return workersCache;
    }
    
    try {
      const data = await api.get<any[]>('getWorkers');
      workersCache = data.map(item => ({
        id: item.id || item.ID || item.Id || String(Math.random()),
        name: item.worker || item.WorkerName || item.Worker || item.Name || item.name || ''
      })).filter(w => w.name);
      
      // Sort alphabetically
      workersCache.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      return workersCache;
    } catch (error: unknown) {
      console.error('Error fetching workers', error);
      return workersCache || [];
    }
  },

  async createWorker(name: string): Promise<Worker> {
    try {
      const data = await api.post<{ id: string, name: string }>('createWorker', { name: name });
      this.clearCache(); // Invalidate cache so next fetch gets updated data
      return { id: data.id, name: data.name };
    } catch (error: any) {
      // Recovery: Check if it was created despite the error (e.g., timeout or CORS)
      this.clearCache();
      const all = await this.getWorkers(true);
      const existing = all.find(w => w.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing;
      throw error;
    }
  },

  async deleteWorker(id: string, name: string): Promise<void> {
    try {
      await api.post('deleteWorker', { id, name: name });
      this.clearCache();
    } catch (error: any) {
      if (error.name === 'PostNetworkUncertainError') {
        this.clearCache();
        return;
      }
      throw error;
    }
  },

  // =====================================
  // ITEMS
  // =====================================
  async getItems(forceRefresh = false): Promise<Item[]> {
    if (itemsCache && !forceRefresh) {
      return itemsCache;
    }
    
    try {
      const data = await api.get<any[]>('getItems');
      itemsCache = data.map(item => ({
        id: item.id || item.ID || item.Id || String(Math.random()),
        name: item.item || item.ItemName || item.Item || item.Name || item.name || '',
        category: '',
        code: ''
      })).filter(i => i.name);
      
      // Sort alphabetically
      itemsCache.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      return itemsCache;
    } catch (error: unknown) {
      console.error('Error fetching items', error);
      return itemsCache || [];
    }
  },

  async createItem(name: string): Promise<Item> {
    try {
      const data = await api.post<{ id: string, name: string }>('createItem', { name: name });
      this.clearCache();
      return { id: data.id, name: data.name, category: '', code: '' };
    } catch (error: any) {
      this.clearCache();
      const all = await this.getItems(true);
      const existing = all.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing;
      throw error;
    }
  },

  async deleteItem(id: string, name: string): Promise<void> {
    try {
      await api.post('deleteItem', { id, name: name });
      this.clearCache();
    } catch (error: any) {
      if (error.name === 'PostNetworkUncertainError') {
        this.clearCache();
        return;
      }
      throw error;
    }
  },

  // =====================================
  // PURITIES
  // =====================================
  async getPurities(forceRefresh = false): Promise<PurityOption[]> {
    if (puritiesCache && !forceRefresh) {
      return puritiesCache;
    }
    
    try {
      const data = await api.get<any[]>('getPurities');
      puritiesCache = data.map(item => {
        const raw = item.purity !== undefined ? item.purity : (item.Purity !== undefined ? item.Purity : '');
        const val = parseFloat(raw);
        return {
          label: isNaN(val) ? String(raw) : `${val}%`, 
          value: isNaN(val) ? 0 : val,
          id: item.id || item.ID || item.Id
        };
      }).filter(p => p.label !== '');
      
      // Sort numerically descending
      puritiesCache.sort((a, b) => b.value - a.value);
      return puritiesCache;
    } catch (error: unknown) {
      console.error('Error fetching purities', error);
      return puritiesCache || [];
    }
  },

  async createPurity(val: number): Promise<PurityOption> {
    try {
      const data = await api.post<{ id: string, purity: number }>('createPurity', { purity: val });
      this.clearCache();
      return { label: `${data.purity}%`, value: data.purity, id: data.id };
    } catch (error: any) {
      this.clearCache();
      const all = await this.getPurities(true);
      const existing = all.find(p => p.value === val);
      if (existing) return existing;
      throw error;
    }
  },

  async deletePurity(id: string, val: number): Promise<void> {
    try {
      await api.post('deletePurity', { id, purity: val });
      this.clearCache();
    } catch (error: any) {
      if (error.name === 'PostNetworkUncertainError') {
        this.clearCache();
        return;
      }
      throw error;
    }
  },
  
  clearCache() {
    workersCache = null;
    itemsCache = null;
    puritiesCache = null;
  }
};
