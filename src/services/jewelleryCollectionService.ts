import { JewelleryCollectionRecord } from '@/types';
import { api } from './api';

export const jewelleryCollectionService = {
  async getAll(): Promise<JewelleryCollectionRecord[]> {
    const data = await api.get<any[]>('getCollection');
    return data.map((item: any) => {
      const grossWeight = Number(item.GrossWeight ?? item['Gross Weight'] ?? item.grossWeight) || 0;
      const stoneWeight = Number(item.StoneWeight ?? item['Stone Weight'] ?? item.stoneWeight) || 0;
      const purity = Number(item.Purity || item.purity) || 0;
      const backendNetWeight = item.NetWeight ?? item['Net Weight'] ?? item.netWeight;
      const backendTotalPure = item.TotalPure ?? item['Total Pure'] ?? item.totalPure;
      const netWeight = (backendNetWeight !== '' && backendNetWeight !== null && backendNetWeight !== undefined)
        ? Number(backendNetWeight)
        : grossWeight - stoneWeight;
      const totalPure = (backendTotalPure !== '' && backendTotalPure !== null && backendTotalPure !== undefined)
        ? Number(backendTotalPure)
        : (netWeight * purity) / 100;
      const recordId = item.RecordID || item['Record ID'] || item.recordId || '';
      return {
        id: item.ID || item.id || recordId,
        recordId,
        date: item.Date || item.date || '',
        worker: item.WorkerName || item['Worker Name'] || item.Worker || item.worker || '',
        item: item.Item || item.item || '',
        manualTag: item.ManualTag || item['Manual Tag'] || item.manualTag || '',
        grossWeight,
        stoneWeight,
        netWeight,
        purity,
        tagWeight: Number(item.TagWeight ?? item['Tag Weight'] ?? item.tagWeight) || 0,
        totalPure,
        createdAt: item.CreatedAt || item['Created At'] || item.createdAt || '',
        updatedAt: item.UpdatedAt || item['Updated At'] || item.updatedAt || ''
      };
    });
  },

  async create(record: Omit<JewelleryCollectionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'netWeight' | 'totalPure'>): Promise<JewelleryCollectionRecord> {
    const payload = {
      date: record.date,
      worker: record.worker,
      item: record.item,
      manualTag: record.manualTag || "",
      grossWeight: record.grossWeight,
      stoneWeight: record.stoneWeight,
      purity: record.purity,
      tagWeight: record.tagWeight
    };
    const response = await api.post<any>('createCollection', payload);
    return {
      ...record,
      ...response,
      id: response.id || response.ID || response.recordID || response.recordId,
      recordId: response.recordId || response.RecordID || response.recordID,
      netWeight: response.netWeight !== undefined ? response.netWeight : (record.grossWeight - record.stoneWeight),
      totalPure: response.totalPure !== undefined ? response.totalPure : (((record.grossWeight - record.stoneWeight) * record.purity) / 100)
    } as JewelleryCollectionRecord;
  },

  async update(id: string, record: Omit<JewelleryCollectionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'netWeight' | 'totalPure'>, existingRecord?: JewelleryCollectionRecord): Promise<JewelleryCollectionRecord> {
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
      item: record.item,
      manualTag: record.manualTag || "",
      grossWeight: record.grossWeight,
      stoneWeight: record.stoneWeight,
      purity: record.purity,
      tagWeight: record.tagWeight
    };
    const response = await api.post<any>('updateCollection', payload);
    return {
      ...existing,
      ...record,
      ...response,
      id: response.id || existing.id,
      recordId: response.recordId || existing.recordId,
      netWeight: response.netWeight !== undefined ? response.netWeight : (record.grossWeight - record.stoneWeight),
      totalPure: response.totalPure !== undefined ? response.totalPure : (((record.grossWeight - record.stoneWeight) * record.purity) / 100),
    } as JewelleryCollectionRecord;
  },

  async delete(id: string, existingRecord?: JewelleryCollectionRecord): Promise<void> {
    let existing = existingRecord;
    if (!existing) {
      const all = await this.getAll();
      existing = all.find(r => r.id === id);
    }
    if (!existing) throw new Error('Record not found');

    // Backend expects lowercase 'recordId'; send 'id' (UUID) as primary key too
    await api.post('deleteCollection', { id: existing.id, recordId: existing.recordId });
  },
  
  async checkDuplicateTag(tag: string, excludeId?: string): Promise<boolean> {
    const all = await this.getAll();
    return all.some(r => r.manualTag === tag && r.id !== excludeId);
  }
};
