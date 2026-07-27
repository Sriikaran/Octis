import { GoldDistributionRecord } from '@/types';
import { api } from './api';

export const goldDistributionService = {
  async getAll(): Promise<GoldDistributionRecord[]> {
    const data = await api.get<any[]>('getDistribution');
    return data.map((item: any) => {
      const quantity = Number(item.Quantity || item.quantity) || 0;
      const purity = Number(item.Purity || item.purity) || 0;
      const backendTotalPure = item.TotalPure ?? item['Total Pure'] ?? item.totalPure;
      // Spreadsheet TotalPure may be blank string — calculate locally as fallback
      const totalPure = (backendTotalPure !== '' && backendTotalPure !== null && backendTotalPure !== undefined)
        ? Number(backendTotalPure)
        : (quantity * purity) / 100;
      // Spreadsheet may not have an ID column — use RecordID as the unique key
      const recordId = item.RecordID || item['Record ID'] || item.recordId || '';
      return {
        id: item.ID || item.id || recordId,  // fall back to recordId if no UUID column
        recordId,
        date: item.Date || item.date || '',
        worker: item.WorkerName || item['Worker Name'] || item.Worker || item.worker || '',
        subWorker: item.SubWorker || item['Sub Worker'] || item.subWorker || '',
        quantity,
        purity,
        totalPure,
        createdAt: item.CreatedAt || item['Created At'] || item.createdAt || '',
        updatedAt: item.UpdatedAt || item['Updated At'] || item.updatedAt || ''
      };
    });
  },

  async create(record: Omit<GoldDistributionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'totalPure'>): Promise<GoldDistributionRecord> {
    const payload = {
      date: record.date,
      worker: record.worker,
      subWorker: record.subWorker || "",
      quantity: record.quantity,
      purity: record.purity
    };
    const response = await api.post<any>('createDistribution', payload);
    return {
      ...record,
      ...response,
      id: response.id || response.ID || response.recordID || response.recordId,
      recordId: response.recordId || response.RecordID || response.recordID,
      totalPure: response.totalPure !== undefined ? response.totalPure : ((record.quantity * record.purity) / 100)
    } as GoldDistributionRecord;
  },

  async update(id: string, record: Omit<GoldDistributionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'totalPure'>, existingRecord?: GoldDistributionRecord): Promise<GoldDistributionRecord> {
    // Use the existing record directly if provided; otherwise fall back to re-fetching
    let existing = existingRecord;
    if (!existing) {
      const all = await this.getAll();
      existing = all.find(r => r.id === id);
    }
    if (!existing) throw new Error('Record not found');

    const payload = {
      id: existing.id,           // UUID — primary lookup (col 1)
      recordId: existing.recordId, // business ID — fallback lookup (col 2)
      date: record.date,
      worker: record.worker,
      subWorker: record.subWorker || "",
      quantity: record.quantity,
      purity: record.purity
    };
    const response = await api.post<any>('updateDistribution', payload);
    return {
      ...existing,
      ...record,
      ...response,
      id: response.id || existing.id,
      recordId: response.recordId || existing.recordId,
      totalPure: response.totalPure !== undefined ? response.totalPure : ((record.quantity * record.purity) / 100)
    } as GoldDistributionRecord;
  },

  async delete(id: string, existingRecord?: GoldDistributionRecord): Promise<void> {
    let existing = existingRecord;
    if (!existing) {
      const all = await this.getAll();
      existing = all.find(r => r.id === id);
    }
    if (!existing) throw new Error('Record not found');

    // Backend expects lowercase 'recordId'; send 'id' (UUID) as primary key too
    await api.post('deleteDistribution', { id: existing.id, recordId: existing.recordId });
  },
};
