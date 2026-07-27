import { JewelleryCollectionRecord } from '@/types';
import { api, PostNetworkUncertainError } from './api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Map a raw API row (spreadsheet headers or camelCase) to a typed record.
 *  Handles both new naming (ManualTagNumber) and any legacy variants. */
function mapRow(item: any): JewelleryCollectionRecord {
  const grossWeight = Number(item.GrossWeight ?? item['Gross Weight'] ?? item.grossWeight) || 0;
  const stoneWeight = Number(item.StoneWeight ?? item['Stone Weight'] ?? item.stoneWeight) || 0;
  const purity      = Number(item.Purity      || item.purity)      || 0;

  const rawNet   = item.NetWeight  ?? item['Net Weight']  ?? item.netWeight;
  const rawTotal = item.TotalPure  ?? item['Total Pure']  ?? item.totalPure;

  const netWeight =
    rawNet !== '' && rawNet !== null && rawNet !== undefined
      ? Number(rawNet)
      : grossWeight - stoneWeight;

  const totalPure =
    rawTotal !== '' && rawTotal !== null && rawTotal !== undefined
      ? Number(rawTotal)
      : (netWeight * purity) / 100;

  // No UUID column — RecordID is the unique key
  const recordId = item.RecordID || item['Record ID'] || item.recordId || '';

  return {
    id:         item.ID || item.id || recordId,
    recordId,
    date:       item.Date      || item.date      || '',
    worker:     item.WorkerName || item['Worker Name'] || item.Worker || item.worker || '',
    item:       item.Item      || item.item       || '',
    // Spreadsheet header is "ManualTagNumber" — also handle "ManualTag" and "Manual Tag"
    manualTag:  item.ManualTagNumber || item.ManualTag || item['Manual Tag'] || item['Manual Tag Number'] || item.manualTag || '',
    grossWeight,
    stoneWeight,
    netWeight,
    purity,
    tagWeight:  Number(item.TagWeight ?? item['Tag Weight'] ?? item.tagWeight) || 0,
    totalPure,
    createdAt:  item.CreatedAt || item['Created At'] || item.createdAt || '',
    updatedAt:  item.UpdatedAt || item['Updated At'] || item.updatedAt || '',
  };
}

export const jewelleryCollectionService = {
  async getAll(): Promise<JewelleryCollectionRecord[]> {
    const data = await api.get<any[]>('getCollection');
    return data.map(mapRow);
  },

  async create(
    record: Omit<JewelleryCollectionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'netWeight' | 'totalPure'>
  ): Promise<JewelleryCollectionRecord> {
    const payload = {
      date:        record.date,
      worker:      record.worker,
      item:        record.item,
      manualTag:   record.manualTag || '',
      grossWeight: record.grossWeight,
      stoneWeight: record.stoneWeight,
      purity:      record.purity,
      tagWeight:   record.tagWeight,
    };

    try {
      const response = await api.post<any>('createCollection', payload);
      const netWeight = response.netWeight !== undefined
        ? response.netWeight
        : record.grossWeight - record.stoneWeight;
      const totalPure = response.totalPure !== undefined
        ? response.totalPure
        : (netWeight * record.purity) / 100;

      return { ...mapRow(response), netWeight, totalPure };
    } catch (err: any) {
      if (err instanceof PostNetworkUncertainError) {
        // Apps Script CORS redirect false-failure — verify via GET
        console.warn('[JewelleryCollection] POST uncertain — verifying via GET in 2.5 s…');
        await delay(2500);

        try {
          const all = await this.getAll();
          const found = all.find(
            (r) =>
              r.worker === record.worker &&
              Math.abs(r.grossWeight - record.grossWeight) < 0.001 &&
              Math.abs(r.purity     - record.purity)       < 0.001
          );
          if (found) {
            console.info('[JewelleryCollection] Record confirmed in sheet — treating POST as success.');
            return found;
          }
        } catch {
          // GET also failed — fall through to original error
        }
      }

      throw new Error(
        err instanceof PostNetworkUncertainError
          ? 'Network error. Please check your connection.'
          : err.message
      );
    }
  },

  async update(
    id: string,
    record: Omit<JewelleryCollectionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'netWeight' | 'totalPure'>,
    existingRecord?: JewelleryCollectionRecord
  ): Promise<JewelleryCollectionRecord> {
    let existing = existingRecord;
    if (!existing) {
      const all = await this.getAll();
      existing = all.find((r) => r.id === id);
    }
    if (!existing) throw new Error('Record not found');

    const payload = {
      id:          existing.id,        // RecordID as primary key (no UUID column)
      recordId:    existing.recordId,
      date:        record.date,
      worker:      record.worker,
      item:        record.item,
      manualTag:   record.manualTag || '',
      grossWeight: record.grossWeight,
      stoneWeight: record.stoneWeight,
      purity:      record.purity,
      tagWeight:   record.tagWeight,
    };

    try {
      const response = await api.post<any>('updateCollection', payload);
      const netWeight = response.netWeight !== undefined
        ? response.netWeight
        : record.grossWeight - record.stoneWeight;
      const totalPure = response.totalPure !== undefined
        ? response.totalPure
        : (netWeight * record.purity) / 100;
      return {
        ...existing,
        ...record,
        ...mapRow(response),
        id:       response.id       || existing.id,
        recordId: response.recordId || existing.recordId,
        netWeight,
        totalPure,
      };
    } catch (err: any) {
      if (err instanceof PostNetworkUncertainError) {
        // Update went through — return locally-merged record
        const netWeight = record.grossWeight - record.stoneWeight;
        const totalPure = (netWeight * record.purity) / 100;
        return { ...existing, ...record, netWeight, totalPure };
      }
      throw err;
    }
  },

  async delete(id: string, existingRecord?: JewelleryCollectionRecord): Promise<void> {
    let existing = existingRecord;
    if (!existing) {
      const all = await this.getAll();
      existing = all.find((r) => r.id === id);
    }
    if (!existing) throw new Error('Record not found');

    try {
      await api.post('deleteCollection', { id: existing.id, recordId: existing.recordId });
    } catch (err: any) {
      if (err instanceof PostNetworkUncertainError) {
        console.warn('[JewelleryCollection] DELETE uncertain — assuming success.');
        return;
      }
      throw err;
    }
  },

  async checkDuplicateTag(tag: string, excludeId?: string): Promise<boolean> {
    const all = await this.getAll();
    return all.some((r) => r.manualTag === tag && r.id !== excludeId);
  },
};
