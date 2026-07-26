import { api } from './api';
import { Worker, Item } from '@/types';

export interface PurityOption {
  label: string;
  value: number;
}

let workersCache: Worker[] | null = null;
let itemsCache: Item[] | null = null;
let puritiesCache: PurityOption[] | null = null;

export const masterDataService = {
  async getWorkers(forceRefresh = false): Promise<Worker[]> {
    if (workersCache && !forceRefresh) {
      return workersCache;
    }
    
    try {
      const data = await api.get<any[]>('getWorkers');
      workersCache = data.map(item => ({
        id: item.id || item.ID || item.Id || String(Math.random()),
        name: item.worker || item.WorkerName || item.Worker || ''
      })).filter(w => w.name); // Filter out empty rows
      return workersCache;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      console.error('Error fetching workers', error);
      return workersCache || [];
    }
  },

  async getItems(forceRefresh = false): Promise<Item[]> {
    if (itemsCache && !forceRefresh) {
      return itemsCache;
    }
    
    try {
      const data = await api.get<any[]>('getItems');
      itemsCache = data.map(item => ({
        id: item.id || item.ID || item.Id || String(Math.random()),
        name: item.item || item.ItemName || item.Item || '',
        category: '',
        code: ''
      })).filter(i => i.name);
      return itemsCache;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      console.error('Error fetching items', error);
      return itemsCache || [];
    }
  },

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
          value: isNaN(val) ? 0 : val
        };
      }).filter(p => p.label !== '');
      return puritiesCache;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      console.error('Error fetching purities', error);
      return puritiesCache || [];
    }
  },
  
  clearCache() {
    workersCache = null;
    itemsCache = null;
    puritiesCache = null;
  }
};
