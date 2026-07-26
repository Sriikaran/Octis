import { JewelleryCollectionRecord } from '@/types';
import { api } from './api';

export const jewelleryCollectionService = {
  async getAll(): Promise<JewelleryCollectionRecord[]> {
    const data = await api.get<any[]>('getCollection');
    return data.map((item: any) => ({
      id: item.ID || item.id,
      recordId: item.RecordID || item.recordId,
      date: item.Date || item.date,
      worker: item.WorkerName || item.worker,
      item: item.Item || item.item,
      manualTag: item.ManualTag || item.manualTag || "",
      grossWeight: Number(item.GrossWeight || item.grossWeight) || 0,
      stoneWeight: Number(item.StoneWeight || item.stoneWeight) || 0,
      netWeight: Number(item.NetWeight || item.netWeight) || 0,
      purity: Number(item.Purity || item.purity) || 0,
      tagWeight: Number(item.TagWeight || item.tagWeight) || 0,
      totalPure: Number(item.TotalPure || item.totalPure) || 0,
      createdAt: item.CreatedAt || item.createdAt,
      updatedAt: item.UpdatedAt || item.updatedAt
    }));
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
